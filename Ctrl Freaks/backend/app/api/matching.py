from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from math import radians, sin, cos, sqrt, atan2

from app.database.database import get_db

from app.models.user import User
from app.models.blood_request import BloodRequest
from app.models.donor_eligibility import DonorEligibility
from app.models.donor_availability import DonorAvailability


router = APIRouter(
    prefix="/matching",
    tags=["Donor Matching"]
)


# =========================================================
# BLOOD GROUP COMPATIBILITY
# =========================================================

COMPATIBLE_BLOOD_GROUPS = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],

    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],

    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],

    "AB-": [
        "O-",
        "A-",
        "B-",
        "AB-"
    ],

    "AB+": [
        "O-",
        "O+",
        "A-",
        "A+",
        "B-",
        "B+",
        "AB-",
        "AB+"
    ],
}


# =========================================================
# URGENCY SEARCH RADIUS
# =========================================================

URGENCY_RADIUS_KM = {
    "critical": 5,
    "medium": 10,
    "planned": 20,
}


# =========================================================
# HAVERSINE DISTANCE
# =========================================================

def calculate_distance_km(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float
) -> float:

    earth_radius = 6371.0

    lat1 = radians(latitude1)
    lon1 = radians(longitude1)

    lat2 = radians(latitude2)
    lon2 = radians(longitude2)

    difference_latitude = lat2 - lat1
    difference_longitude = lon2 - lon1

    a = (
        sin(difference_latitude / 2) ** 2
        +
        cos(lat1)
        * cos(lat2)
        * sin(difference_longitude / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return earth_radius * c


# =========================================================
# FIND MATCHING DONORS
# =========================================================

@router.get("/request/{request_id}")
def find_matching_donors(
    request_id: int,
    db: Session = Depends(get_db)
):

    # =====================================================
    # 1. GET BLOOD REQUEST
    # =====================================================

    blood_request = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.id == request_id
        )
        .first()
    )

    if not blood_request:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found"
        )

    # =====================================================
    # 2. CHECK REQUEST STATUS
    # =====================================================

    if blood_request.status != "active":
        raise HTTPException(
            status_code=400,
            detail="This blood request is no longer active"
        )

    # =====================================================
    # 3. CHECK PATIENT LOCATION
    # =====================================================

    if (
        blood_request.latitude is None
        or blood_request.longitude is None
    ):
        raise HTTPException(
            status_code=400,
            detail="Patient location is missing for this blood request"
        )

    # =====================================================
    # 4. REQUIRED BLOOD GROUP
    # =====================================================

    required_blood_group = (
        str(blood_request.blood_group)
        .upper()
        .strip()
    )

    compatible_groups = COMPATIBLE_BLOOD_GROUPS.get(
        required_blood_group
    )

    if not compatible_groups:
        raise HTTPException(
            status_code=400,
            detail="Invalid blood group"
        )

    # =====================================================
    # 5. URGENCY
    # =====================================================

    urgency = (
        str(blood_request.urgency)
        .lower()
        .strip()
    )

    search_radius = URGENCY_RADIUS_KM.get(
        urgency
    )

    if search_radius is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid urgency. "
                "Use critical, medium, or planned."
            )
        )

    # =====================================================
    # 6. GET COMPATIBLE USERS
    # =====================================================

    donors = (
        db.query(User)
        .filter(
            User.blood_group.in_(
                compatible_groups
            )
        )
        .filter(
            User.id != blood_request.patient_id
        )
        .all()
    )

    matches = []

    # =====================================================
    # 7. CHECK EACH POSSIBLE DONOR
    # =====================================================

    for donor in donors:

        # -------------------------------------------------
        # LOCATION
        # -------------------------------------------------

        if (
            donor.latitude is None
            or donor.longitude is None
        ):
            continue

        # -------------------------------------------------
        # LATEST ELIGIBILITY
        # -------------------------------------------------

        eligibility = (
            db.query(DonorEligibility)
            .filter(
                DonorEligibility.user_id == donor.id
            )
            .order_by(
                DonorEligibility.id.desc()
            )
            .first()
        )

        if not eligibility:
            continue

        eligibility_result = (
            str(eligibility.result)
            .lower()
            .strip()
        )

        if eligibility_result != "eligible":
            continue

        # -------------------------------------------------
        # LATEST AVAILABILITY
        # -------------------------------------------------

        availability = (
            db.query(DonorAvailability)
            .filter(
                DonorAvailability.user_id == donor.id
            )
            .order_by(
                DonorAvailability.id.desc()
            )
            .first()
        )

        if not availability:
            continue

        if not availability.is_available:
            continue

        # -------------------------------------------------
        # DISTANCE
        # -------------------------------------------------

        distance_km = calculate_distance_km(
            blood_request.latitude,
            blood_request.longitude,
            donor.latitude,
            donor.longitude
        )

        # -------------------------------------------------
        # RADIUS
        # -------------------------------------------------

        if distance_km > search_radius:
            continue

        # -------------------------------------------------
        # MATCH FOUND
        # -------------------------------------------------

        matches.append({
            "donor_id": donor.id,
            "name": donor.name,
            "blood_group": donor.blood_group,
            "phone": donor.phone,

            "latitude": donor.latitude,
            "longitude": donor.longitude,

            "distance_km": round(
                distance_km,
                2
            ),

            "urgency": urgency,

            "search_radius_km": search_radius
        })

    # =====================================================
    # 8. SORT BY DISTANCE
    # =====================================================

    matches.sort(
        key=lambda donor: donor["distance_km"]
    )

    # =====================================================
    # 9. RESPONSE
    # =====================================================

    return {
        "request_id": blood_request.id,

        "required_blood_group":
            required_blood_group,

        "compatible_blood_groups":
            compatible_groups,

        "urgency":
            urgency,

        "search_radius_km":
            search_radius,

        "patient_location": {
            "latitude":
                blood_request.latitude,

            "longitude":
                blood_request.longitude
        },

        "total_matches":
            len(matches),

        "matches":
            matches
    }
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from math import radians, sin, cos, sqrt, atan2

from app.database.database import get_db
from app.models.user import User
from app.models.blood_request import BloodRequest
from app.models.donor_response import DonorResponse


router = APIRouter(
    prefix="/location",
    tags=["User Location"]
)


# =========================================================
# LOCATION UPDATE SCHEMA
# =========================================================

class LocationUpdate(BaseModel):
    user_id: int
    latitude: float
    longitude: float


# =========================================================
# UPDATE USER LOCATION
# =========================================================

@router.post("/update")
def update_location(
    location: LocationUpdate,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.id == location.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.latitude = location.latitude
    user.longitude = location.longitude

    db.commit()
    db.refresh(user)

    return {
        "message": "Location updated successfully",
        "user_id": user.id,
        "latitude": user.latitude,
        "longitude": user.longitude
    }


# =========================================================
# GET USER LOCATION
# =========================================================

@router.get("/{user_id}")
def get_location(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "user_id": user.id,
        "latitude": user.latitude,
        "longitude": user.longitude
    }


# =========================================================
# HAVERSINE DISTANCE
# =========================================================

def calculate_distance_km(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float
):

    earth_radius = 6371.0

    lat1 = radians(latitude1)
    lon1 = radians(longitude1)

    lat2 = radians(latitude2)
    lon2 = radians(longitude2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        +
        cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return earth_radius * c


# =========================================================
# PATIENT TRACK ACCEPTED DONOR
# =========================================================

@router.get("/track/{request_id}")
def track_accepted_donor(
    request_id: int,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # GET BLOOD REQUEST
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # FIND ACCEPTED DONOR
    # -----------------------------------------------------

    donor_response = (
        db.query(DonorResponse)
        .filter(
            DonorResponse.request_id == request_id,
            DonorResponse.response == "accepted"
        )
        .order_by(
            DonorResponse.created_at.asc()
        )
        .first()
    )

    # -----------------------------------------------------
    # NO DONOR YET
    # -----------------------------------------------------

    if not donor_response:

        return {
            "request_id": request_id,
            "status": "waiting",
            "donor": None
        }

    # -----------------------------------------------------
    # GET DONOR
    # -----------------------------------------------------

    donor = (
        db.query(User)
        .filter(
            User.id == donor_response.donor_id
        )
        .first()
    )

    if not donor:
        raise HTTPException(
            status_code=404,
            detail="Accepted donor not found"
        )

    # -----------------------------------------------------
    # CHECK DONOR LOCATION
    # -----------------------------------------------------

    if (
        donor.latitude is None
        or donor.longitude is None
    ):

        return {
            "request_id": request_id,
            "status": "accepted",
            "donor": {
                "id": donor.id,
                "name": donor.name,
                "blood_group": donor.blood_group
            },
            "donor_location": None,
            "distance_km": None,
            "estimated_minutes": None
        }

    # -----------------------------------------------------
    # CHECK PATIENT LOCATION
    # -----------------------------------------------------

    if (
        blood_request.latitude is None
        or blood_request.longitude is None
    ):

        raise HTTPException(
            status_code=400,
            detail="Patient location is missing"
        )

    # -----------------------------------------------------
    # CALCULATE DISTANCE
    # -----------------------------------------------------

    distance_km = calculate_distance_km(
        blood_request.latitude,
        blood_request.longitude,
        donor.latitude,
        donor.longitude
    )

    # -----------------------------------------------------
    # SIMPLE ETA
    #
    # Approximation for hackathon demo.
    # Average emergency road speed = 30 km/h.
    # -----------------------------------------------------

    estimated_minutes = max(
        1,
        round((distance_km / 30) * 60)
    )

    # -----------------------------------------------------
    # RETURN TRACKING DATA
    # -----------------------------------------------------

    return {
        "request_id": request_id,
        "status": "accepted",

        "donor": {
            "id": donor.id,
            "name": donor.name,
            "blood_group": donor.blood_group
        },

        "donor_location": {
            "latitude": donor.latitude,
            "longitude": donor.longitude
        },

        "patient_location": {
            "latitude": blood_request.latitude,
            "longitude": blood_request.longitude
        },

        "distance_km": round(
            distance_km,
            2
        ),

        "estimated_minutes": estimated_minutes
    }
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.blood_request import BloodRequest
from app.schemas.blood_request import (
    BloodRequestCreate,
    BloodRequestResponse
)


router = APIRouter(
    prefix="/blood-requests",
    tags=["Blood Requests"]
)


# =========================================================
# CREATE BLOOD REQUEST
# =========================================================

@router.post(
    "/",
    response_model=BloodRequestResponse
)
def create_blood_request(
    request_data: BloodRequestCreate,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CHECK USER
    # -----------------------------------------------------

    patient = (
        db.query(User)
        .filter(User.id == request_data.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # -----------------------------------------------------
    # VALID BLOOD GROUPS
    # -----------------------------------------------------

    valid_blood_groups = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
    ]

    if request_data.blood_group not in valid_blood_groups:
        raise HTTPException(
            status_code=400,
            detail="Invalid blood group"
        )

    # -----------------------------------------------------
    # VALID URGENCY
    # -----------------------------------------------------

    valid_urgencies = [
        "critical",
        "medium",
        "planned"
    ]

    urgency = request_data.urgency.lower().strip()

    if urgency not in valid_urgencies:
        raise HTTPException(
            status_code=400,
            detail="Urgency must be critical, medium, or planned"
        )

    # -----------------------------------------------------
    # VALIDATE LOCATION
    # -----------------------------------------------------

    if (
        request_data.latitude is None
        or request_data.longitude is None
    ):
        raise HTTPException(
            status_code=400,
            detail="Location is required to create a blood request"
        )

    # -----------------------------------------------------
    # CREATE REQUEST
    # -----------------------------------------------------

    new_request = BloodRequest(
        patient_id=request_data.patient_id,
        blood_group=request_data.blood_group,
        hospital=request_data.hospital,
        urgency=urgency,
        details=request_data.details,
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        status="active"
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


# =========================================================
# GET ACTIVE BLOOD REQUESTS
# =========================================================

@router.get(
    "/active",
    response_model=list[BloodRequestResponse]
)
def get_active_blood_requests(
    db: Session = Depends(get_db)
):

    requests = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.status == "active"
        )
        .order_by(
            BloodRequest.created_at.desc()
        )
        .all()
    )

    return requests


# =========================================================
# GET PATIENT BLOOD REQUESTS
# =========================================================

@router.get(
    "/patient/{patient_id}",
    response_model=list[BloodRequestResponse]
)
def get_patient_requests(
    patient_id: int,
    db: Session = Depends(get_db)
):

    patient = (
        db.query(User)
        .filter(User.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    requests = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.patient_id == patient_id
        )
        .order_by(
            BloodRequest.created_at.desc()
        )
        .all()
    )

    return requests


# =========================================================
# GET SINGLE BLOOD REQUEST
# =========================================================

@router.get(
    "/{request_id}",
    response_model=BloodRequestResponse
)
def get_blood_request(
    request_id: int,
    db: Session = Depends(get_db)
):

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

    return blood_request
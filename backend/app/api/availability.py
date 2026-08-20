from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.donor_availability import DonorAvailability

router = APIRouter(
    prefix="/availability",
    tags=["Donor Availability"]
)


# ==========================================
# GET DONOR AVAILABILITY
# ==========================================

@router.get("/{user_id}")
def get_availability(
    user_id: int,
    db: Session = Depends(get_db)
):
    availability = (
        db.query(DonorAvailability)
        .filter(DonorAvailability.user_id == user_id)
        .first()
    )

    # No record yet = donor is offline
    if not availability:
        return {
            "user_id": user_id,
            "is_available": False
        }

    return {
        "user_id": availability.user_id,
        "is_available": availability.is_available
    }


# ==========================================
# TOGGLE DONOR AVAILABILITY
# ==========================================

@router.post("/toggle")
def toggle_availability(
    user_id: int,
    db: Session = Depends(get_db)
):
    availability = (
        db.query(DonorAvailability)
        .filter(DonorAvailability.user_id == user_id)
        .first()
    )

    # Create record if donor has never gone online
    if not availability:
        availability = DonorAvailability(
            user_id=user_id,
            is_available=True
        )

        db.add(availability)
        db.commit()
        db.refresh(availability)

        return {
            "message": "Donor is now available",
            "user_id": user_id,
            "is_available": True
        }

    # Toggle existing status
    availability.is_available = not availability.is_available

    db.commit()
    db.refresh(availability)

    return {
        "message": (
            "Donor is now available"
            if availability.is_available
            else "Donor is now unavailable"
        ),
        "user_id": availability.user_id,
        "is_available": availability.is_available
    }
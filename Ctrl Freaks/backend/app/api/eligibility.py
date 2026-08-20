from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.donor_eligibility import DonorEligibility

from app.schemas.eligibility import (
    EligibilityRequest,
    EligibilityResponse,
)


router = APIRouter(
    prefix="/eligibility",
    tags=["Donor Eligibility"]
)


# =========================================================
# CHECK DONOR ELIGIBILITY
# =========================================================

@router.post(
    "/check",
    response_model=EligibilityResponse
)
def check_eligibility(
    data: EligibilityRequest,
    db: Session = Depends(get_db)
):

    # =====================================================
    # CHECK USER
    # =====================================================

    user = (
        db.query(User)
        .filter(User.id == data.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # =====================================================
    # CHECK ROLE
    # =====================================================

    if data.role.lower() != "donor":
        raise HTTPException(
            status_code=400,
            detail="Eligibility test is available only in Donor mode"
        )

    # =====================================================
    # DETERMINE ELIGIBILITY
    # =====================================================

    if data.age < 18 or data.age > 65:
        result = "deferred"

    elif data.weight < 45:
        result = "deferred"

    elif data.hemoglobin < 12.5:
        result = "deferred"

    elif not data.healthy:
        result = "deferred"

    elif data.illness:
        result = "deferred"

    elif data.recent_donation:
        result = "deferred"

    elif data.alcohol:
        result = "deferred"

    elif data.pregnancy:
        result = "deferred"

    elif (
        data.major_surgery
        or data.tattoo_piercing
        or data.medication
        or data.medical_condition
    ):
        result = "review"

    else:
        result = "eligible"

    # =====================================================
    # SAVE RESULT
    # =====================================================

    eligibility = DonorEligibility(
        user_id=data.user_id,
        age=data.age,
        weight=data.weight,
        hemoglobin=data.hemoglobin,
        healthy=data.healthy,
        illness=data.illness,
        recent_donation=data.recent_donation,
        major_surgery=data.major_surgery,
        tattoo_piercing=data.tattoo_piercing,
        medication=data.medication,
        alcohol=data.alcohol,
        pregnancy=data.pregnancy,
        medical_condition=data.medical_condition,
        result=result
    )

    db.add(eligibility)

    try:
        db.commit()
        db.refresh(eligibility)

    except Exception as error:

        db.rollback()

        print(
            "❌ ELIGIBILITY DATABASE ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to save eligibility result"
        )

    return eligibility


# =========================================================
# GET LATEST ELIGIBILITY
# =========================================================

@router.get("/{user_id}")
def get_latest_eligibility(
    user_id: int,
    db: Session = Depends(get_db)
):

    # =====================================================
    # CHECK USER
    # =====================================================

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

    # =====================================================
    # GET LATEST RECORD
    # =====================================================

    try:

        eligibility = (
            db.query(DonorEligibility)
            .filter(
                DonorEligibility.user_id == user_id
            )
            .order_by(
                DonorEligibility.id.desc()
            )
            .first()
        )

    except Exception as error:

        print(
            "❌ ELIGIBILITY FETCH ERROR:",
            error
        )

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to fetch eligibility"
        )

    # =====================================================
    # NO RECORD
    # =====================================================

    if not eligibility:

        raise HTTPException(
            status_code=404,
            detail="No eligibility test found"
        )

    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {
        "id": eligibility.id,
        "user_id": eligibility.user_id,
        "result": str(eligibility.result).lower().strip(),
        "checked_at": eligibility.checked_at
    }
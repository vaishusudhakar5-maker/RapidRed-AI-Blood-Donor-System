from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.blood_request import BloodRequest
from app.models.donor_response import DonorResponse

from app.schemas.donor_response import (
    DonorResponseCreate,
    DonorResponseResult
)


router = APIRouter(
    prefix="/donor-responses",
    tags=["Donor Responses"]
)


# =========================================================
# DONOR ACCEPT / DECLINE
# =========================================================

@router.post(
    "/",
    response_model=DonorResponseResult
)
def respond_to_blood_request(
    data: DonorResponseCreate,
    db: Session = Depends(get_db)
):

    # =====================================================
    # 1. CHECK DONOR
    # =====================================================

    donor = (
        db.query(User)
        .filter(User.id == data.donor_id)
        .first()
    )

    if not donor:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    if donor.role != "donor":
        raise HTTPException(
            status_code=400,
            detail="Only donors can respond to blood requests"
        )

    # =====================================================
    # 2. CHECK BLOOD REQUEST
    # =====================================================

    blood_request = (
        db.query(BloodRequest)
        .filter(BloodRequest.id == data.request_id)
        .first()
    )

    if not blood_request:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found"
        )

    # =====================================================
    # 3. VALIDATE RESPONSE
    # =====================================================

    response_value = (
        data.response
        .lower()
        .strip()
    )

    if response_value not in [
        "accepted",
        "declined"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Response must be accepted or declined"
        )

    # =====================================================
    # 4. IF REQUEST IS ALREADY ACCEPTED
    # =====================================================

    if blood_request.status == "accepted":

        # Check whether THIS donor was the accepted donor
        accepted_response = (
            db.query(DonorResponse)
            .filter(
                DonorResponse.request_id == data.request_id,
                DonorResponse.response == "accepted"
            )
            .order_by(
                DonorResponse.created_at.asc()
            )
            .first()
        )

        if accepted_response:

            if accepted_response.donor_id == data.donor_id:

                return {
                    "message": "You have already accepted this request",
                    "request_id": data.request_id,
                    "donor_id": data.donor_id,
                    "response": "accepted"
                }

            raise HTTPException(
                status_code=400,
                detail="This blood request has already been accepted by another donor"
            )

        # Safety fallback
        raise HTTPException(
            status_code=400,
            detail="This blood request is no longer available"
        )

    # =====================================================
    # 5. OTHER NON-ACTIVE STATUS
    # =====================================================

    if blood_request.status != "active":

        raise HTTPException(
            status_code=400,
            detail="This blood request is no longer active"
        )

    # =====================================================
    # 6. CHECK EXISTING RESPONSE
    # =====================================================

    existing = (
        db.query(DonorResponse)
        .filter(
            DonorResponse.request_id == data.request_id,
            DonorResponse.donor_id == data.donor_id
        )
        .first()
    )

    # =====================================================
    # 7. ACCEPT REQUEST
    # =====================================================

    if response_value == "accepted":

        # -------------------------------------------------
        # Check whether another donor already accepted
        # -------------------------------------------------

        already_accepted = (
            db.query(DonorResponse)
            .filter(
                DonorResponse.request_id == data.request_id,
                DonorResponse.response == "accepted"
            )
            .first()
        )

        if already_accepted:

            raise HTTPException(
                status_code=400,
                detail="This blood request has already been accepted by another donor"
            )

        # -------------------------------------------------
        # Update existing response
        # -------------------------------------------------

        if existing:

            existing.response = "accepted"

            # LOCK REQUEST
            blood_request.status = "accepted"

            db.commit()
            db.refresh(existing)

            return {
                "message": "Donor response updated and request accepted",
                "request_id": existing.request_id,
                "donor_id": existing.donor_id,
                "response": existing.response
            }

        # -------------------------------------------------
        # Create new accepted response
        # -------------------------------------------------

        donor_response = DonorResponse(
            request_id=data.request_id,
            donor_id=data.donor_id,
            response="accepted"
        )

        db.add(donor_response)

        # -------------------------------------------------
        # LOCK BLOOD REQUEST
        # -------------------------------------------------

        blood_request.status = "accepted"

        db.commit()
        db.refresh(donor_response)

        return {
            "message": "Donor accepted request successfully",
            "request_id": donor_response.request_id,
            "donor_id": donor_response.donor_id,
            "response": donor_response.response
        }

    # =====================================================
    # 8. DECLINE REQUEST
    # =====================================================

    if response_value == "declined":

        if existing:

            existing.response = "declined"

            db.commit()
            db.refresh(existing)

            return {
                "message": "Donor response updated",
                "request_id": existing.request_id,
                "donor_id": existing.donor_id,
                "response": existing.response
            }

        donor_response = DonorResponse(
            request_id=data.request_id,
            donor_id=data.donor_id,
            response="declined"
        )

        db.add(donor_response)

        db.commit()
        db.refresh(donor_response)

        return {
            "message": "Donor response recorded",
            "request_id": donor_response.request_id,
            "donor_id": donor_response.donor_id,
            "response": donor_response.response
        }


# =========================================================
# GET RESPONSES FOR A BLOOD REQUEST
#
# NO PHONE NUMBERS ARE RETURNED HERE.
# =========================================================

@router.get(
    "/request/{request_id}"
)
def get_request_donor_responses(
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

    responses = (
        db.query(DonorResponse)
        .filter(
            DonorResponse.request_id == request_id
        )
        .order_by(
            DonorResponse.created_at.desc()
        )
        .all()
    )

    results = []

    for donor_response in responses:

        donor = (
            db.query(User)
            .filter(
                User.id == donor_response.donor_id
            )
            .first()
        )

        if not donor:
            continue

        results.append({
            "response_id": donor_response.id,
            "request_id": donor_response.request_id,
            "donor_id": donor.id,
            "donor_name": donor.name,
            "blood_group": donor.blood_group,
            "response": donor_response.response,
            "created_at": donor_response.created_at
        })

    return {
        "request_id": request_id,
        "total_responses": len(results),
        "responses": results
    }


# =========================================================
# GET ACCEPTED DONOR
#
# ONLY THE PATIENT WHO CREATED THE REQUEST
# CAN SEE THE DONOR CONTACT.
# =========================================================

@router.get(
    "/request/{request_id}/accepted"
)
def get_accepted_donor(
    request_id: int,
    viewer_id: int,
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

    # =====================================================
    # VERIFY PATIENT
    # =====================================================

    if blood_request.patient_id != viewer_id:

        raise HTTPException(
            status_code=403,
            detail="Only the patient who created this request can view the accepted donor"
        )

    # =====================================================
    # FIND ACCEPTED DONOR
    # =====================================================

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

    # =====================================================
    # NO ACCEPTED DONOR
    # =====================================================

    if not donor_response:

        return {
            "request_id": request_id,
            "status": "waiting",
            "donor": None
        }

    # =====================================================
    # GET DONOR
    # =====================================================

    donor = (
        db.query(User)
        .filter(
            User.id == donor_response.donor_id
        )
        .first()
    )

    if not donor:

        return {
            "request_id": request_id,
            "status": "waiting",
            "donor": None
        }

    # =====================================================
    # RETURN CONTACT AFTER ACCEPTANCE
    # =====================================================

    return {
        "request_id": request_id,
        "status": "accepted",
        "donor": {
            "id": donor.id,
            "name": donor.name,
            "blood_group": donor.blood_group,
            "phone": donor.phone
        }
    }


# =========================================================
# GET PATIENT CONTACT
#
# ONLY THE DONOR WHO ACCEPTED THE REQUEST
# CAN SEE THE PATIENT CONTACT.
# =========================================================

@router.get(
    "/request/{request_id}/patient-contact"
)
def get_patient_contact(
    request_id: int,
    donor_id: int,
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

    # =====================================================
    # CHECK DONOR
    # =====================================================

    donor = (
        db.query(User)
        .filter(
            User.id == donor_id
        )
        .first()
    )

    if not donor:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    if donor.role != "donor":

        raise HTTPException(
            status_code=403,
            detail="Only donors can access patient contact information"
        )

    # =====================================================
    # CHECK ACCEPTED RESPONSE
    # =====================================================

    accepted_response = (
        db.query(DonorResponse)
        .filter(
            DonorResponse.request_id == request_id,
            DonorResponse.donor_id == donor_id,
            DonorResponse.response == "accepted"
        )
        .first()
    )

    if not accepted_response:

        raise HTTPException(
            status_code=403,
            detail="Patient contact information is available only after you accept the request"
        )

    # =====================================================
    # GET PATIENT
    # =====================================================

    patient = (
        db.query(User)
        .filter(
            User.id == blood_request.patient_id
        )
        .first()
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # =====================================================
    # RETURN PATIENT CONTACT
    # =====================================================

    return {
        "request_id": request_id,
        "status": "accepted",
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "blood_group": patient.blood_group,
            "phone": patient.phone
        }
    }
    
    # =========================================================
# SYNC EXISTING ACCEPTED REQUEST
# Temporary helper for existing database records
# =========================================================

@router.post("/sync/{request_id}")
def sync_accepted_request(
    request_id: int,
    db: Session = Depends(get_db)
):

    # Find blood request
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

    # Find accepted donor
    accepted_response = (
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

    if not accepted_response:
        raise HTTPException(
            status_code=404,
            detail="No accepted donor found for this request"
        )

    # Update request status
    blood_request.status = "accepted"

    db.commit()
    db.refresh(blood_request)

    return {
        "message": "Request status synchronized successfully",
        "request_id": blood_request.id,
        "status": blood_request.status,
        "accepted_donor_id": accepted_response.donor_id
    }
    
    # ==========================================
# GET PATIENT CONTACT AFTER DONOR ACCEPTS
# ==========================================

@router.get(
    "/request/{request_id}/patient-contact"
)
def get_patient_contact(
    request_id: int,
    donor_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------
    # 1. Check blood request
    # --------------------------------------

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

    # --------------------------------------
    # 2. Check donor
    # --------------------------------------

    donor = (
        db.query(User)
        .filter(
            User.id == donor_id
        )
        .first()
    )

    if not donor:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    # --------------------------------------
    # 3. Make sure user is a donor
    # --------------------------------------

    if str(donor.role).lower() != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can access patient contact"
        )

    # --------------------------------------
    # 4. Check donor response
    # --------------------------------------

    donor_response = (
        db.query(DonorResponse)
        .filter(
            DonorResponse.request_id == request_id,
            DonorResponse.donor_id == donor_id
        )
        .order_by(
            DonorResponse.created_at.desc()
        )
        .first()
    )

    if not donor_response:
        raise HTTPException(
            status_code=403,
            detail="You have not responded to this blood request"
        )

    # --------------------------------------
    # 5. CONTACT ONLY AFTER ACCEPTANCE
    # --------------------------------------

    if donor_response.response != "accepted":
        raise HTTPException(
            status_code=403,
            detail="Patient contact is available only after accepting the request"
        )

    # --------------------------------------
    # 6. Get patient
    # --------------------------------------

    patient = (
        db.query(User)
        .filter(
            User.id == blood_request.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # --------------------------------------
    # 7. Return patient contact
    # --------------------------------------

    return {
        "request_id": request_id,
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "phone": patient.phone
        }
    }
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserResponse, UserLogin
from app.services.auth import hash_password, verify_password
from app.utils.security import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    # Check email
    existing_email = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Check phone
    existing_phone = (
        db.query(User)
        .filter(User.phone == user_data.phone)
        .first()
    )

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    # Create one account.
    # The actual application role is selected after login.

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password=hash_password(user_data.password),
        blood_group=user_data.blood_group,
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):

    # Find user
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(
        user_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT
    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "blood_group": user.blood_group
        }
    }


# =========================================================
# UPDATE USER ROLE
# =========================================================

@router.put("/role/{user_id}")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db)
):

    # Find user
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

    # Clean role value
    role_value = role.strip().lower()

    # RapidRed supported roles
    allowed_roles = {
        "donor",
        "patient",
        "hospital",
        "admin"
    }

    # Validate role
    if role_value not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail=(
                "Role must be donor, patient, "
                "hospital, or admin"
            )
        )

    # Update role
    user.role = role_value

    db.commit()
    db.refresh(user)

    print(
        f"✅ ROLE UPDATED | "
        f"User ID: {user.id} | "
        f"Role: {user.role}"
    )

    return {
        "message": "Role updated successfully",
        "user_id": user.id,
        "role": user.role
    }
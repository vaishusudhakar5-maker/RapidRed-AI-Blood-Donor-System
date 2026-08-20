from pydantic import BaseModel, EmailStr


# ==========================================
# REGISTER
# ==========================================

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    blood_group: str


# ==========================================
# LOGIN
# ==========================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==========================================
# USER RESPONSE
# ==========================================

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    blood_group: str

    class Config:
        from_attributes = True
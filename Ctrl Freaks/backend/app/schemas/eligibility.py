from pydantic import BaseModel


class EligibilityRequest(BaseModel):
    user_id: int
    role: str

    age: int
    weight: float
    hemoglobin: float

    healthy: bool
    illness: bool
    recent_donation: bool
    major_surgery: bool
    tattoo_piercing: bool
    medication: bool
    alcohol: bool
    pregnancy: bool
    medical_condition: bool


class EligibilityResponse(BaseModel):
    id: int
    user_id: int
    age: int
    weight: float
    hemoglobin: float
    healthy: bool
    illness: bool
    recent_donation: bool
    major_surgery: bool
    tattoo_piercing: bool
    medication: bool
    alcohol: bool
    pregnancy: bool
    medical_condition: bool
    result: str

    class Config:
        from_attributes = True
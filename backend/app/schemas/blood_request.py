from pydantic import BaseModel
from typing import Optional


class BloodRequestCreate(BaseModel):
    patient_id: int
    blood_group: str
    hospital: str
    urgency: str
    details: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BloodRequestResponse(BaseModel):
    id: int
    patient_id: int
    blood_group: str
    hospital: str
    urgency: str
    details: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str

    class Config:
        from_attributes = True
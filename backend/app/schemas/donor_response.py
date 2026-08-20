from pydantic import BaseModel


class DonorResponseCreate(BaseModel):
    request_id: int
    donor_id: int
    response: str


class DonorResponseResult(BaseModel):
    message: str
    request_id: int
    donor_id: int
    response: str
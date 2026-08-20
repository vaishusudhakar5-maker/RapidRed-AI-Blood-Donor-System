from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class DonorResponse(Base):
    __tablename__ = "donor_responses"

    id = Column(Integer, primary_key=True, index=True)

    request_id = Column(
        Integer,
        ForeignKey("blood_requests.id"),
        nullable=False,
        index=True
    )

    donor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    response = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class DonorEligibility(Base):
    __tablename__ = "donor_eligibility"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    age = Column(Integer, nullable=False)

    weight = Column(Float, nullable=False)

    hemoglobin = Column(Float, nullable=False)

    healthy = Column(Boolean, nullable=False)

    illness = Column(Boolean, nullable=False)

    recent_donation = Column(Boolean, nullable=False)

    major_surgery = Column(Boolean, nullable=False)

    tattoo_piercing = Column(Boolean, nullable=False)

    medication = Column(Boolean, nullable=False)

    alcohol = Column(Boolean, nullable=False)

    pregnancy = Column(Boolean, nullable=False)

    medical_condition = Column(Boolean, nullable=False)

    result = Column(String, nullable=False)

    checked_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
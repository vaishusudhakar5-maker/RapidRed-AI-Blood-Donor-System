from sqlalchemy import Column, Integer, Boolean
from app.database.database import Base


class DonorAvailability(Base):
    __tablename__ = "donor_availability"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        unique=True
    )

    is_available = Column(
        Boolean,
        default=False,
        nullable=False
    )
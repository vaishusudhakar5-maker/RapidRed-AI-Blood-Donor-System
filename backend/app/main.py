from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine

from app.models.user import User
from app.models.donor_eligibility import DonorEligibility
from app.models.donor_availability import DonorAvailability
from app.models.blood_request import BloodRequest
from app.models.donor_response import DonorResponse

from app.api.auth import router as auth_router
from app.api.eligibility import router as eligibility_router
from app.api.availability import router as availability_router
from app.api.blood_request import router as blood_request_router
from app.api.matching import router as matching_router
from app.api.location import router as location_router
from app.api.donor_response import router as donor_response_router


# ==========================================
# CREATE DATABASE TABLES
# ==========================================

#Base.metadata.create_all(bind=engine)


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="RapidRed API",
    description="AI-Powered Emergency Blood Finder & Donor Alert System",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# API ROUTES
# ==========================================

app.include_router(auth_router)
app.include_router(eligibility_router)
app.include_router(availability_router)
app.include_router(blood_request_router)
app.include_router(matching_router)
app.include_router(location_router)
app.include_router(donor_response_router)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": "Welcome to RapidRed API ❤️",
        "status": "Running Successfully"
    }
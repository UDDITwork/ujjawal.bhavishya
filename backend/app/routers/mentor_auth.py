import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Mentor, User
from app.auth import hash_password, verify_password, get_current_user, decode_token
from app.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_DAYS
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.schemas import (
    MentorRegisterRequest, MentorLoginRequest, MentorProfileUpdateRequest,
    MentorAuthResponse, MentorResponse, MentorPublicResponse, MentorListResponse,
    MentorVerifyRequest, ErrorResponse,
)

router = APIRouter(tags=["mentors"])

security = HTTPBearer(auto_error=False)


# ─── Helpers ──────────────────────────────────────────────


def _create_mentor_token(mentor: Mentor) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    payload = {
        "sub": mentor.id,
        "email": mentor.email,
        "role": "mentor",
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_mentor(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Mentor:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    payload = decode_token(credentials.credentials)
    if payload.get("role") != "mentor":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: not a mentor token",
        )
    mentor_id = payload.get("sub")
    if not mentor_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mentor not found",
        )
    return mentor


def _mentor_response(mentor: Mentor, token: str) -> MentorAuthResponse:
    return MentorAuthResponse(
        mentor=MentorResponse.model_validate(mentor),
        token=token,
    )


# ─── Endpoints ────────────────────────────────────────────


@router.post(
    "/mentor/register",
    response_model=MentorAuthResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse}},
)
def mentor_register(body: MentorRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Mentor).filter(Mentor.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A mentor with this email already exists",
        )

    mentor = Mentor(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        phone=body.phone,
        specialization=body.specialization,
        bio=body.bio,
        expertise_json=json.dumps(body.expertise) if body.expertise else None,
        linkedin_url=body.linkedin_url,
        experience_years=body.experience_years,
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)

    token = _create_mentor_token(mentor)
    return _mentor_response(mentor, token)


@router.post(
    "/mentor/login",
    response_model=MentorAuthResponse,
    responses={401: {"model": ErrorResponse}},
)
def mentor_login(body: MentorLoginRequest, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.email == body.email).first()
    if not mentor or not verify_password(body.password, mentor.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = _create_mentor_token(mentor)
    return _mentor_response(mentor, token)


@router.get("/mentor/me", response_model=MentorResponse)
def mentor_me(mentor: Mentor = Depends(get_current_mentor)):
    return MentorResponse.model_validate(mentor)


@router.patch("/mentor/profile", response_model=MentorResponse)
def mentor_profile_update(
    body: MentorProfileUpdateRequest,
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    update_data = body.model_dump(exclude_unset=True)

    # Convert expertise list → JSON string
    if "expertise" in update_data:
        expertise = update_data.pop("expertise")
        update_data["expertise_json"] = json.dumps(expertise) if expertise is not None else None

    for field, value in update_data.items():
        setattr(mentor, field, value)

    db.commit()
    db.refresh(mentor)
    return MentorResponse.model_validate(mentor)


@router.get("/mentors/verified", response_model=MentorListResponse)
def list_verified_mentors(db: Session = Depends(get_db)):
    mentors = db.query(Mentor).filter(Mentor.is_verified == 1).all()
    return MentorListResponse(
        mentors=[MentorPublicResponse.model_validate(m) for m in mentors]
    )


@router.post("/mentor/verify")
def verify_mentor(
    body: MentorVerifyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    mentor = db.query(Mentor).filter(Mentor.email == body.email).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found",
        )

    if body.action == "verify":
        mentor.is_verified = 1
        db.commit()
        return {"message": f"Mentor {mentor.email} has been verified"}
    else:
        db.delete(mentor)
        db.commit()
        return {"message": f"Mentor {mentor.email} has been rejected and removed"}


@router.get("/mentor/pending", response_model=list[MentorResponse])
def list_pending_mentors(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    mentors = db.query(Mentor).filter(Mentor.is_verified == 0).all()
    return [MentorResponse.model_validate(m) for m in mentors]


# ─── Seed Real Mentors (Admin) ───────────────────────────

REAL_MENTORS = [
    {
        "name": "Dr. Priya Sharma",
        "email": "priya.sharma@iklavya.in",
        "password": "Mentor@2026",
        "phone": "+91-9876543210",
        "specialization": "Career Counseling & HR Strategy",
        "bio": "Former CHRO at Tata Consultancy Services with 18 years of experience in talent development, campus recruitment, and career pathing for young professionals. Passionate about bridging the gap between academia and industry.",
        "expertise": ["Career Planning", "Interview Preparation", "Resume Building", "Corporate HR", "Campus Placements"],
        "linkedin_url": "https://linkedin.com/in/priyasharma-hr",
        "experience_years": 18,
    },
    {
        "name": "Rajesh Kumar Verma",
        "email": "rajesh.verma@iklavya.in",
        "password": "Mentor@2026",
        "phone": "+91-9988776655",
        "specialization": "Financial Literacy & Personal Finance",
        "bio": "Certified Financial Planner (CFP) and ex-VP at HDFC Bank. Specializes in teaching young adults about budgeting, taxation, investments, and building financial discipline from the start of their careers.",
        "expertise": ["Personal Finance", "Tax Planning", "Investment Basics", "EPF/PPF", "Insurance", "Budgeting"],
        "linkedin_url": "https://linkedin.com/in/rajeshverma-finance",
        "experience_years": 15,
    },
    {
        "name": "Ananya Desai",
        "email": "ananya.desai@iklavya.in",
        "password": "Mentor@2026",
        "phone": "+91-9123456789",
        "specialization": "Communication & Soft Skills Training",
        "bio": "Award-winning communication coach and TEDx speaker. Has trained over 10,000 students across IITs, NITs, and state universities on public speaking, workplace communication, and professional etiquette.",
        "expertise": ["Public Speaking", "Business Communication", "Email Etiquette", "Body Language", "Conflict Resolution", "Networking"],
        "linkedin_url": "https://linkedin.com/in/ananyaDesai-coach",
        "experience_years": 12,
    },
    {
        "name": "Vikram Singh Rathore",
        "email": "vikram.rathore@iklavya.in",
        "password": "Mentor@2026",
        "phone": "+91-8877665544",
        "specialization": "Digital Skills & Personal Branding",
        "bio": "Digital marketing strategist and founder of BrandYou Academy. Helps students build professional online presence through LinkedIn optimization, portfolio websites, and GitHub profiles. Former Google India team.",
        "expertise": ["LinkedIn Optimization", "Personal Branding", "Digital Marketing", "GitHub Portfolio", "Online Presence", "Content Strategy"],
        "linkedin_url": "https://linkedin.com/in/vikramrathore-digital",
        "experience_years": 10,
    },
    {
        "name": "Dr. Meera Iyer",
        "email": "meera.iyer@iklavya.in",
        "password": "Mentor@2026",
        "phone": "+91-7766554433",
        "specialization": "Leadership Development & Team Management",
        "bio": "Organizational psychologist with PhD from IIM Bangalore. Consults with Fortune 500 companies on leadership pipelines and team dynamics. Runs leadership bootcamps for college students transitioning to corporate roles.",
        "expertise": ["Leadership Skills", "Team Management", "Decision Making", "Emotional Intelligence", "Time Management", "Goal Setting"],
        "linkedin_url": "https://linkedin.com/in/meeraiyer-leadership",
        "experience_years": 14,
    },
    {
        "name": "Arjun Mehta",
        "email": "arjun.mehta@iklavya.in",
        "password": "Mentor@2026",
        "phone": "+91-9556677889",
        "specialization": "Placement Preparation & Technical Interviews",
        "bio": "Senior SDE at Amazon India and weekend mentor. Cracked interviews at 6 FAANG companies. Specializes in helping freshers prepare for technical and HR rounds, aptitude tests, and group discussions.",
        "expertise": ["Technical Interviews", "Aptitude Tests", "Group Discussion", "FAANG Prep", "DSA Basics", "Placement Strategy"],
        "linkedin_url": "https://linkedin.com/in/arjunmehta-sde",
        "experience_years": 8,
    },
    {
        "name": "Sunita Choudhary",
        "email": "sunita.choudhary@iklavya.in",
        "password": "Mentor@2026",
        "phone": "+91-8899001122",
        "specialization": "Workplace Etiquette & Professional Development",
        "bio": "Corporate trainer at Infosys BPO for 11 years. Expert in workplace readiness — dress code, meeting norms, email writing, hierarchy navigation, and first-90-days strategies for new hires.",
        "expertise": ["Workplace Etiquette", "Professional Dress Code", "Meeting Norms", "Email Writing", "Corporate Culture", "First Job Prep"],
        "linkedin_url": "https://linkedin.com/in/sunitachoudhary-trainer",
        "experience_years": 11,
    },
]


@router.post("/mentor/seed")
def seed_mentors(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Admin-only: Create real mentor profiles and auto-verify them."""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    created = []
    skipped = []

    for m in REAL_MENTORS:
        existing = db.query(Mentor).filter(Mentor.email == m["email"]).first()
        if existing:
            # Update and verify if already exists
            existing.is_verified = 1
            existing.name = m["name"]
            existing.specialization = m["specialization"]
            existing.bio = m["bio"]
            existing.expertise_json = json.dumps(m["expertise"])
            existing.linkedin_url = m["linkedin_url"]
            existing.experience_years = m["experience_years"]
            existing.phone = m["phone"]
            skipped.append(m["email"])
            continue

        mentor = Mentor(
            name=m["name"],
            email=m["email"],
            password_hash=hash_password(m["password"]),
            phone=m["phone"],
            specialization=m["specialization"],
            bio=m["bio"],
            expertise_json=json.dumps(m["expertise"]),
            linkedin_url=m["linkedin_url"],
            experience_years=m["experience_years"],
            is_verified=1,  # Auto-verified
            is_available=1,
        )
        db.add(mentor)
        created.append(m["email"])

    db.commit()

    return {
        "message": f"Seeded {len(created)} mentors, updated {len(skipped)} existing",
        "created": created,
        "updated": skipped,
    }

"""Mentorship hub — context-aware chatbot + activity timeline."""

import json
import logging

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User, UserProfile, ContextSummary,
    ChatSession, JobApplication, Job,
    ResumeSession,
)
from app.auth import get_current_user
from app.services.claude_service import stream_chat_response
from app.prompts import build_mentorship_system_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mentorship", tags=["mentorship"])


# ─── Schemas ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    messages: list[dict]


# ─── POST /mentorship/chat ──────────────────────────────────

@router.post("/chat")
async def mentorship_chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Stream a mentorship chat response with full user context."""

    # Gather user context
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    ctx_summary = db.query(ContextSummary).filter(
        ContextSummary.user_id == current_user.id
    ).first()

    # Recent career guidance sessions (last 3)
    recent_sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.started_at.desc())
        .limit(3)
        .all()
    )

    # Recent job clicks (last 10)
    recent_applications = (
        db.query(JobApplication, Job)
        .join(Job, JobApplication.job_id == Job.id)
        .filter(JobApplication.user_id == current_user.id)
        .order_by(JobApplication.created_at.desc())
        .limit(10)
        .all()
    )

    # Resume sessions count
    resume_count = (
        db.query(ResumeSession)
        .filter(ResumeSession.user_id == current_user.id)
        .count()
    )

    system_prompt = build_mentorship_system_prompt(
        user=current_user,
        profile=profile,
        context_summary=ctx_summary,
        recent_sessions=recent_sessions,
        recent_applications=recent_applications,
        resume_count=resume_count,
    )

    chat_history = [
        {"role": m["role"], "content": m["content"]}
        for m in body.messages
    ]

    async def event_generator():
        try:
            async for chunk in stream_chat_response(system_prompt, chat_history):
                yield f"event: message\ndata: {json.dumps({'text': chunk})}\n\n"
            yield "event: done\ndata: {}\n\n"
        except Exception as e:
            logger.error("[mentorship] stream error: %s", e)
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ─── GET /mentorship/context ────────────────────────────────

@router.get("/context")
def get_mentorship_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return user's activity summary for the mentorship timeline."""

    # Recent sessions
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.started_at.desc())
        .limit(5)
        .all()
    )

    # Job clicks
    job_apps = (
        db.query(JobApplication, Job)
        .join(Job, JobApplication.job_id == Job.id)
        .filter(
            JobApplication.user_id == current_user.id,
            JobApplication.status == "applied",
        )
        .order_by(JobApplication.created_at.desc())
        .limit(5)
        .all()
    )

    # Resume count
    resume_count = (
        db.query(ResumeSession)
        .filter(ResumeSession.user_id == current_user.id)
        .count()
    )

    # Profile completion
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    profile_fields = [
        profile.education_level if profile else None,
        profile.stream if profile else None,
        profile.city if profile else None,
        profile.summary if profile else None,
        profile.skills if profile else None,
        profile.career_aspiration_raw if profile else None,
    ]
    profile_completion = round(
        sum(1 for f in profile_fields if f) / len(profile_fields) * 100
    )

    return {
        "sessions": [
            {
                "title": s.title,
                "date": s.started_at,
                "status": s.status,
                "questions": s.questions_asked_count,
            }
            for s in sessions
        ],
        "job_clicks": [
            {
                "title": job.title,
                "company": job.company,
                "date": app.created_at,
            }
            for app, job in job_apps
        ],
        "resume_count": resume_count,
        "profile_completion": profile_completion,
    }

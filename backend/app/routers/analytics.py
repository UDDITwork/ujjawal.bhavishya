"""Student analytics summary — aggregates data from all existing tables."""

import json
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import (
    User, ChatSession, Message, ResumeSession,
    CourseModule, UserModuleProgress, Assessment, UserAssessment,
    Certificate, JobApplication, MentorSession,
)
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/student-summary")
def student_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    uid = user.id

    # ── Modules ──
    all_modules = db.query(CourseModule).filter(CourseModule.is_published == 1).all()
    progress_rows = (
        db.query(UserModuleProgress)
        .filter(UserModuleProgress.user_id == uid)
        .all()
    )
    progress_map = {p.module_id: p for p in progress_rows}

    modules_completed = 0
    modules_in_progress = 0
    total_quiz_score = 0
    modules_detail = []

    for m in all_modules:
        p = progress_map.get(m.id)
        if p and p.is_completed:
            status = "completed"
            modules_completed += 1
            progress_pct = 100
        elif p and p.last_position_seconds > 0:
            status = "in_progress"
            modules_in_progress += 1
            progress_pct = round((p.last_position_seconds / max(m.duration_seconds, 1)) * 100, 1)
        else:
            status = "not_started"
            progress_pct = 0

        score = p.score if p else 0
        total_quiz_score += score

        modules_detail.append({
            "id": m.id,
            "title": m.title,
            "category": m.category,
            "is_completed": 1 if (p and p.is_completed) else 0,
            "score": score,
            "max_score": 3,
            "progress_pct": progress_pct,
            "status": status,
        })

    total_modules = len(all_modules)

    # ── Assessments ──
    assessments = db.query(Assessment).filter(Assessment.is_published == 1).all()
    assessment_map = {a.id: a for a in assessments}

    user_attempts = (
        db.query(UserAssessment)
        .filter(UserAssessment.user_id == uid, UserAssessment.status == "submitted")
        .all()
    )

    # Best attempt per assessment
    best_by_assessment = {}
    for ua in user_attempts:
        aid = ua.assessment_id
        if aid not in best_by_assessment or (ua.score or 0) > (best_by_assessment[aid].score or 0):
            best_by_assessment[aid] = ua

    assessments_passed = 0
    assessments_failed = 0
    best_scores = []

    for aid, ua in best_by_assessment.items():
        a = assessment_map.get(aid)
        if not a:
            continue
        passed = ua.passed == 1
        if passed:
            assessments_passed += 1
        else:
            assessments_failed += 1

        pct = round((ua.score or 0) / max(a.total_questions, 1) * 100)
        grade = "A+" if pct >= 90 else "A" if pct >= 80 else "B+" if pct >= 70 else "B" if pct >= 60 else "C"
        best_scores.append({
            "title": a.title,
            "score": pct,
            "grade": grade,
            "passed": passed,
        })

    # ── Certificates ──
    certs = db.query(Certificate).filter(Certificate.user_id == uid).all()
    cert_list = []
    for c in certs:
        cert_data = json.loads(c.cert_data_json) if c.cert_data_json else {}
        cert_list.append({
            "title": cert_data.get("module_title", ""),
            "cert_number": c.cert_number,
            "issued_at": c.issued_at,
        })

    # ── Career Sessions ──
    career_sessions = db.query(ChatSession).filter(ChatSession.user_id == uid).all()
    career_completed = sum(1 for s in career_sessions if s.status == "completed")
    total_messages = sum(s.questions_asked_count for s in career_sessions)
    analyses_generated = sum(1 for s in career_sessions if s.analysis_generated)

    # ── Resumes ──
    resume_sessions = db.query(ResumeSession).filter(ResumeSession.user_id == uid).all()
    resumes_completed = sum(1 for s in resume_sessions if s.status == "completed")

    # ── Jobs ──
    job_apps = db.query(JobApplication).filter(JobApplication.user_id == uid).all()
    jobs_saved = sum(1 for j in job_apps if j.status == "saved")
    jobs_applied = sum(1 for j in job_apps if j.status == "applied")

    # ── Mentorship ──
    mentor_sessions = db.query(MentorSession).filter(MentorSession.student_id == uid).all()
    mentor_active = sum(1 for s in mentor_sessions if s.status == "accepted")
    mentor_completed = sum(1 for s in mentor_sessions if s.status == "completed")

    # ── Activity Heatmap (last 105 days) ──
    cutoff = (datetime.now(timezone.utc) - timedelta(days=105)).isoformat()

    activity_dates = defaultdict(int)

    # Count career session messages
    for s in career_sessions:
        if s.started_at and s.started_at >= cutoff:
            day = s.started_at[:10]
            activity_dates[day] += s.questions_asked_count or 1

    # Count resume session messages
    for s in resume_sessions:
        if s.started_at and s.started_at >= cutoff:
            day = s.started_at[:10]
            activity_dates[day] += s.message_count or 1

    # Count module progress updates
    for p in progress_rows:
        if p.updated_at and p.updated_at >= cutoff:
            day = p.updated_at[:10]
            activity_dates[day] += 1

    # Count assessment submissions
    for ua in user_attempts:
        if ua.submitted_at and ua.submitted_at >= cutoff:
            day = ua.submitted_at[:10]
            activity_dates[day] += 1

    heatmap = [{"date": d, "count": c} for d, c in sorted(activity_dates.items())]

    # ── Streak ──
    today = datetime.now(timezone.utc).date()
    all_dates = sorted(set(activity_dates.keys()), reverse=True)
    current_streak = 0
    for i, d_str in enumerate(all_dates):
        expected = (today - timedelta(days=i)).isoformat()
        if d_str == expected:
            current_streak += 1
        else:
            break

    return {
        "modules": {
            "total": total_modules,
            "completed": modules_completed,
            "in_progress": modules_in_progress,
            "not_started": total_modules - modules_completed - modules_in_progress,
            "completion_percentage": round(modules_completed / max(total_modules, 1) * 100, 1),
            "total_quiz_score": total_quiz_score,
            "max_possible_score": total_modules * 3,
            "modules_detail": modules_detail,
        },
        "assessments": {
            "total": len(assessments),
            "passed": assessments_passed,
            "failed": assessments_failed,
            "best_scores": best_scores,
        },
        "certificates": {
            "total": len(certs),
            "list": cert_list,
        },
        "career_sessions": {
            "total": len(career_sessions),
            "completed": career_completed,
            "total_messages": total_messages,
            "analyses_generated": analyses_generated,
        },
        "resumes": {
            "total": len(resume_sessions),
            "completed": resumes_completed,
        },
        "jobs": {
            "saved": jobs_saved,
            "applied": jobs_applied,
        },
        "mentorship": {
            "total_sessions": len(mentor_sessions),
            "active": mentor_active,
            "completed": mentor_completed,
        },
        "streak": {
            "current": current_streak,
        },
        "activity_heatmap": heatmap,
    }

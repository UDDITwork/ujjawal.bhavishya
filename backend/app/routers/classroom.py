import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, CourseModule, ModuleQuiz, UserModuleProgress
from app.schemas import (
    CourseModuleResponse,
    CourseModuleListResponse,
    ModuleQuizResponse,
    ModuleDetailResponse,
    UserProgressResponse,
    ProgressSyncRequest,
    QuizAnswerRequest,
    QuizAnswerResponse,
    ErrorResponse,
)
from app.auth import get_current_user

router = APIRouter(prefix="/modules", tags=["classroom"])


@router.get("", response_model=CourseModuleListResponse)
def list_modules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    modules = (
        db.query(CourseModule)
        .filter(CourseModule.is_published == 1)
        .order_by(CourseModule.order_index.asc())
        .all()
    )
    return CourseModuleListResponse(
        modules=[CourseModuleResponse.model_validate(m) for m in modules]
    )


@router.get(
    "/{module_id}",
    response_model=ModuleDetailResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_module(
    module_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    module = db.query(CourseModule).filter(
        CourseModule.id == module_id,
        CourseModule.is_published == 1,
    ).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )

    quizzes = (
        db.query(ModuleQuiz)
        .filter(ModuleQuiz.module_id == module_id)
        .order_by(ModuleQuiz.trigger_at_seconds.asc())
        .all()
    )

    # Strip correct_index from quiz responses (don't leak answers to frontend)
    quiz_responses = []
    for q in quizzes:
        qr = ModuleQuizResponse.model_validate(q)
        quiz_responses.append(qr)

    return ModuleDetailResponse(
        module=CourseModuleResponse.model_validate(module),
        quizzes=quiz_responses,
    )


@router.get(
    "/{module_id}/progress",
    response_model=UserProgressResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_progress(
    module_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress = db.query(UserModuleProgress).filter(
        UserModuleProgress.user_id == current_user.id,
        UserModuleProgress.module_id == module_id,
    ).first()
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No progress found for this module",
        )
    return UserProgressResponse.model_validate(progress)


@router.post(
    "/sync",
    response_model=UserProgressResponse,
)
def sync_progress(
    data: ProgressSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify module exists
    module = db.query(CourseModule).filter(
        CourseModule.id == data.module_id
    ).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )

    # Upsert progress
    progress = db.query(UserModuleProgress).filter(
        UserModuleProgress.user_id == current_user.id,
        UserModuleProgress.module_id == data.module_id,
    ).first()

    if not progress:
        progress = UserModuleProgress(
            user_id=current_user.id,
            module_id=data.module_id,
            last_position_seconds=data.last_position_seconds,
            quizzes_passed_json=data.quizzes_passed_json,
            score=data.score or 0,
            is_completed=data.is_completed or 0,
        )
        db.add(progress)
    else:
        # Only update position forward (don't regress)
        if data.last_position_seconds > progress.last_position_seconds:
            progress.last_position_seconds = data.last_position_seconds
        if data.quizzes_passed_json:
            progress.quizzes_passed_json = data.quizzes_passed_json
        if data.score is not None and data.score > progress.score:
            progress.score = data.score
        if data.is_completed == 1:
            progress.is_completed = 1

    db.commit()
    db.refresh(progress)

    return UserProgressResponse.model_validate(progress)


@router.get("/progress/all", response_model=list[UserProgressResponse])
def get_all_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress_list = (
        db.query(UserModuleProgress)
        .filter(UserModuleProgress.user_id == current_user.id)
        .all()
    )
    return [UserProgressResponse.model_validate(p) for p in progress_list]


@router.post(
    "/quiz/answer",
    response_model=QuizAnswerResponse,
    responses={404: {"model": ErrorResponse}},
)
def answer_quiz(
    data: QuizAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(ModuleQuiz).filter(
        ModuleQuiz.id == data.quiz_id
    ).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    is_correct = data.selected_index == quiz.correct_index

    return QuizAnswerResponse(
        correct=is_correct,
        correct_index=quiz.correct_index,
        hint=quiz.hint if not is_correct else None,
    )


@router.get(
    "/seed/init",
    responses={200: {"description": "Seed data created"}},
)
def seed_modules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Seed initial course modules and quizzes. Only works if no modules exist."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    existing = db.query(CourseModule).count()
    if existing > 0:
        return {"message": f"Already have {existing} modules, skipping seed"}

    modules_data = [
        {
            "title": "Time Management",
            "slug": "time-management",
            "description": "Master the Deep Work method — from Pareto Principle to Pomodoro, learn to protect your focus time and stop multitasking.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/time-management.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/time-management-thumb.jpg",
            "duration_seconds": 600,
            "category": "soft-skills",
            "order_index": 0,
            "segments_json": json.dumps([
                {"title": "The Myth of Multitasking", "start_sec": 0, "end_sec": 150},
                {"title": "Prioritization Matrices", "start_sec": 150, "end_sec": 300},
                {"title": "Time Blocking & Pomodoro", "start_sec": 300, "end_sec": 450},
                {"title": "Saying No & Setting Boundaries", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "According to the Pareto Principle, what percentage of your results come from 20% of your efforts?",
                    "options": ["50%", "60%", "80%", "90%"],
                    "correct_index": 2,
                    "hint": "Think 80/20 — the principle is named after this ratio!",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "If a task is Urgent but NOT Important, where does it go in the Eisenhower Matrix?",
                    "options": ["Do", "Delegate", "Delete", "Schedule"],
                    "correct_index": 1,
                    "hint": "Urgent but not important tasks should be handed off to someone else.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "In the Pomodoro Technique, how long is one focus session?",
                    "options": ["15 minutes", "25 minutes", "30 minutes", "45 minutes"],
                    "correct_index": 1,
                    "hint": "It's named after a tomato-shaped kitchen timer — think short, focused bursts.",
                },
            ],
        },
        {
            "title": "Workplace Etiquette",
            "slug": "workplace-etiquette",
            "description": "Navigate the corporate world — from email hygiene and meeting discipline to giving & receiving feedback professionally.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/workplace-etiquette.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/workplace-etiquette-thumb.jpg",
            "duration_seconds": 600,
            "category": "soft-skills",
            "order_index": 1,
            "segments_json": json.dumps([
                {"title": "First Impressions", "start_sec": 0, "end_sec": 150},
                {"title": "Meeting Room Discipline", "start_sec": 150, "end_sec": 300},
                {"title": "Feedback Loops", "start_sec": 300, "end_sec": 450},
                {"title": "Digital Citizenship", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "What is the most professional way to start a formal email?",
                    "options": ["Hey!", "Hi there,", "Dear [Name],", "Yo,"],
                    "correct_index": 2,
                    "hint": "In formal contexts, using 'Dear' followed by the recipient's name is standard.",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "During a virtual meeting, what should you do when someone else is speaking?",
                    "options": ["Mute yourself and listen actively", "Check your phone", "Type in the chat", "Interrupt with your point"],
                    "correct_index": 0,
                    "hint": "Active listening means giving your full, undivided attention.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "What is the best response to constructive criticism from your manager?",
                    "options": ["Get defensive", "Ignore it completely", "Thank them and ask for specifics", "Complain to colleagues"],
                    "correct_index": 2,
                    "hint": "Feedback is a gift — showing gratitude and seeking clarity shows maturity.",
                },
            ],
        },
        {
            "title": "Social Communication Skills",
            "slug": "social-communication",
            "description": "From active listening to assertiveness — learn the art of connection, networking, and voicing your opinion without conflict.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/social-communication.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/social-communication-thumb.jpg",
            "duration_seconds": 600,
            "category": "soft-skills",
            "order_index": 2,
            "segments_json": json.dumps([
                {"title": "Active Listening", "start_sec": 0, "end_sec": 150},
                {"title": "Non-Verbal Cues", "start_sec": 150, "end_sec": 300},
                {"title": "Small Talk to Big Talk", "start_sec": 300, "end_sec": 450},
                {"title": "Assertiveness", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "What is 'mirroring' in the context of active listening?",
                    "options": ["Copying someone's accent", "Reflecting back what someone said", "Looking at a mirror while talking", "Repeating your own points"],
                    "correct_index": 1,
                    "hint": "Mirroring shows the speaker you've understood by paraphrasing their message.",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "Which body language signal indicates openness and confidence?",
                    "options": ["Crossed arms", "Avoiding eye contact", "Open palms and steady eye contact", "Fidgeting"],
                    "correct_index": 2,
                    "hint": "Open, relaxed posture and eye contact show you're engaged and confident.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "What is the best way to transition from small talk to meaningful conversation at a networking event?",
                    "options": ["Ask about salary", "Ask what challenges they're working on", "Talk only about yourself", "Avoid personal topics entirely"],
                    "correct_index": 1,
                    "hint": "Asking about challenges shows genuine interest and invites deeper conversation.",
                },
            ],
        },
    ]

    for mod_data in modules_data:
        quizzes = mod_data.pop("quizzes")
        module = CourseModule(**mod_data)
        db.add(module)
        db.flush()

        for idx, quiz_data in enumerate(quizzes):
            quiz = ModuleQuiz(
                module_id=module.id,
                trigger_at_seconds=quiz_data["trigger_at_seconds"],
                question=quiz_data["question"],
                options_json=json.dumps(quiz_data["options"]),
                correct_index=quiz_data["correct_index"],
                hint=quiz_data["hint"],
                order_index=idx,
            )
            db.add(quiz)

    db.commit()
    return {"message": f"Seeded {len(modules_data)} modules with quizzes"}

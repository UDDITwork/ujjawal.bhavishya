from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Notification
from app.auth import get_current_user
from app.models import User
from app.routers.mentor_auth import get_current_mentor
from app.models import Mentor
from app.schemas import NotificationResponse, NotificationListResponse, UnreadCountResponse

router = APIRouter(tags=["notifications"])


# ─── Helpers ──────────────────────────────────────────────


def create_notification(
    db: Session,
    recipient_type: str,
    recipient_id: str,
    notif_type: str,
    title: str,
    message: str = "",
    link: str = None,
):
    """Create a notification. Does NOT commit — caller controls transaction."""
    notif = Notification(
        recipient_type=recipient_type,
        recipient_id=recipient_id,
        type=notif_type,
        title=title,
        message=message,
        link=link,
    )
    db.add(notif)
    return notif


# ─── Student Endpoints ────────────────────────────────────


@router.get("/notifications", response_model=NotificationListResponse)
def list_notifications(
    limit: int = Query(default=30, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = (
        db.query(Notification)
        .filter(
            Notification.recipient_type == "student",
            Notification.recipient_id == user.id,
        )
        .count()
    )
    notifs = (
        db.query(Notification)
        .filter(
            Notification.recipient_type == "student",
            Notification.recipient_id == user.id,
        )
        .order_by(desc(Notification.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )
    return NotificationListResponse(
        notifications=[NotificationResponse.model_validate(n) for n in notifs],
        total=total,
    )


@router.get("/notifications/unread-count", response_model=UnreadCountResponse)
def notification_unread_count(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Notification)
        .filter(
            Notification.recipient_type == "student",
            Notification.recipient_id == user.id,
            Notification.is_read == 0,
        )
        .count()
    )
    return UnreadCountResponse(count=count)


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.recipient_type == "student",
            Notification.recipient_id == user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = 1
    db.commit()
    return {"message": "Marked as read"}


@router.post("/notifications/read-all")
def mark_all_read(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.recipient_type == "student",
        Notification.recipient_id == user.id,
        Notification.is_read == 0,
    ).update({"is_read": 1})
    db.commit()
    return {"message": "All marked as read"}


@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.recipient_type == "student",
            Notification.recipient_id == user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"message": "Deleted"}


# ─── Mentor Endpoints ─────────────────────────────────────


@router.get("/notifications/mentor", response_model=NotificationListResponse)
def list_mentor_notifications(
    limit: int = Query(default=30, le=100),
    offset: int = Query(default=0, ge=0),
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    total = (
        db.query(Notification)
        .filter(
            Notification.recipient_type == "mentor",
            Notification.recipient_id == mentor.id,
        )
        .count()
    )
    notifs = (
        db.query(Notification)
        .filter(
            Notification.recipient_type == "mentor",
            Notification.recipient_id == mentor.id,
        )
        .order_by(desc(Notification.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )
    return NotificationListResponse(
        notifications=[NotificationResponse.model_validate(n) for n in notifs],
        total=total,
    )


@router.get("/notifications/mentor/unread-count", response_model=UnreadCountResponse)
def mentor_notification_unread_count(
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Notification)
        .filter(
            Notification.recipient_type == "mentor",
            Notification.recipient_id == mentor.id,
            Notification.is_read == 0,
        )
        .count()
    )
    return UnreadCountResponse(count=count)


@router.post("/notifications/mentor/{notification_id}/read")
def mark_mentor_notification_read(
    notification_id: str,
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.recipient_type == "mentor",
            Notification.recipient_id == mentor.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = 1
    db.commit()
    return {"message": "Marked as read"}

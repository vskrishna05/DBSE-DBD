import logging
from sqlalchemy.orm import Session
from backend.app.models.notification import Notification

logger = logging.getLogger("fincore.notifications")

def create_notification(
    db: Session,
    customer_id: int,
    title: str,
    message: str,
    notification_type: str = "SYSTEM"
) -> Notification:
    try:
        notif = Notification(
            customer_id=customer_id,
            title=title,
            message=message,
            type=notification_type,
            status="UNREAD"
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif
    except Exception as e:
        logger.error(f"Failed to create notification: {str(e)}")
        db.rollback()
        raise

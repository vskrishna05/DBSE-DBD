from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.notification import Notification
from backend.app.models.customer import Customer
from backend.app.schemas.notification import NotificationResponse
from backend.app.auth.security import get_current_customer

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_my_notifications(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    return db.query(Notification).filter(
        Notification.customer_id == customer.id
    ).order_by(Notification.id.desc()).limit(50).all()

@router.put("/{id}/read", response_model=dict)
def mark_read(
    id: int,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.customer_id == customer.id
    ).first()

    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.status = "READ"
    db.commit()
    return {"success": True, "message": "Notification marked as read"}

@router.put("/read-all", response_model=dict)
def mark_all_read(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.customer_id == customer.id,
        Notification.status == "UNREAD"
    ).update({"status": "READ"})
    db.commit()
    return {"success": True, "message": "All notifications marked as read"}

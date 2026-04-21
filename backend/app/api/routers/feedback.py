from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...database import get_db
from ...models import User, Feedback, Report, UserRole
from ...schemas.core import FeedbackCreate, FeedbackOut
from ...auth import get_current_user, require_role
from .notifications import create_notification_record
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter()

@router.post("/feedback", response_model=FeedbackOut)
def provide_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["mentor", "admin"]))
):
    # Verify report exists
    report = db.query(Report).filter(Report.id == feedback.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    try:
        new_feedback = Feedback(
            **feedback.model_dump(),
            mentor_id=str(current_user.id)
        )
        report.status = "reviewed"
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        create_notification_record(
            db=db,
            user_id=report.intern_id,
            notification_type="feedback",
            message=f"New feedback received for week {report.week_number}.",
        )
        return new_feedback
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Unable to submit feedback")

@router.get("/feedback", response_model=List[FeedbackOut])
def get_all_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.INTERN:
        # Get all reports by this intern
        report_ids = [r.id for r in db.query(Report).filter(Report.intern_id == current_user.id).all()]
        return db.query(Feedback).filter(Feedback.report_id.in_(report_ids)).all()
    return db.query(Feedback).all()

@router.get("/feedback/{report_id}", response_model=List[FeedbackOut])
def get_report_feedback(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user.role == UserRole.INTERN and report.intern_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Feedback).filter(Feedback.report_id == report_id).all()

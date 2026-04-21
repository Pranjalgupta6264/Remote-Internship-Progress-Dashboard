from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ...database import get_db
from ...models import User, Report, UserRole
from ...schemas.core import ReportCreate, ReportOut
from ...auth import get_current_user, require_role
from .notifications import create_notification_record
import markdown
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter()

@router.post("/reports", response_model=ReportOut)
def submit_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["intern"]))
):
    # Check if report for this week already exists
    existing = db.query(Report).filter(
        Report.intern_id == current_user.id,
        Report.week_number == report.week_number
    ).first()
    
    if existing:
        # Update existing draft
        existing.markdown_content = report.markdown_content
        existing.html_content = markdown.markdown(report.markdown_content)
        existing.status = "submitted"
        existing.submitted_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    try:
        html = markdown.markdown(report.markdown_content)
        new_report = Report(
            **report.model_dump(),
            intern_id=str(current_user.id),
            html_content=html,
            status="submitted",
            submitted_at=datetime.utcnow(),
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return new_report
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Unable to submit report")

@router.get("/reports", response_model=List[ReportOut])
def get_reports(
    status: Optional[str] = None,
    week_number: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)
    if week_number:
        query = query.filter(Report.week_number == week_number)

    if current_user.role == UserRole.INTERN:
        return query.filter(Report.intern_id == current_user.id).all()
    elif current_user.role == UserRole.MENTOR:
        return query.all()
    else:
        return query.all()

@router.get("/reports/{report_id}", response_model=ReportOut)
def get_report_by_id(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if current_user.role == UserRole.INTERN and report.intern_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return report

@router.post("/reports/{report_id}/mark-reviewed", response_model=ReportOut)
def mark_report_reviewed(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["mentor", "admin"])),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    report.status = "reviewed"
    db.commit()
    db.refresh(report)

    create_notification_record(
        db=db,
        user_id=report.intern_id,
        notification_type="report_reviewed",
        message=f"Your week {report.week_number} report has been marked as reviewed.",
    )
    return report

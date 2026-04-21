from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...database import get_db
from ...models import User, Task, Report, Feedback, UserRole, TaskStatus
from ...auth import require_role
from ...schemas.core import AdminAnalyticsOut, MentorAnalyticsOut, InternAnalyticsOut

router = APIRouter()

@router.get("/analytics/admin", response_model=AdminAnalyticsOut)
def admin_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(["admin"])),
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active.is_(True)).count()
    total_tasks = db.query(Task).count()
    total_reports = db.query(Report).count()
    total_feedback = db.query(Feedback).count()

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "admins": db.query(User).filter(User.role == UserRole.ADMIN).count(),
            "mentors": db.query(User).filter(User.role == UserRole.MENTOR).count(),
            "interns": db.query(User).filter(User.role == UserRole.INTERN).count(),
        },
        "tasks": {
            "total": total_tasks,
            "todo": db.query(Task).filter(Task.status == TaskStatus.TODO).count(),
            "in_progress": db.query(Task).filter(Task.status == TaskStatus.IN_PROGRESS).count(),
            "review": db.query(Task).filter(Task.status == TaskStatus.REVIEW).count(),
            "done": db.query(Task).filter(Task.status == TaskStatus.DONE).count(),
        },
        "reports": {
            "total": total_reports,
            "submitted": db.query(Report).filter(Report.status == "submitted").count(),
            "reviewed": db.query(Report).filter(Report.status == "reviewed").count(),
        },
        "feedback": {"total": total_feedback},
    }

@router.get("/analytics/mentor", response_model=MentorAnalyticsOut)
def mentor_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["mentor", "admin"])),
):
    mentor_task_query = db.query(Task)
    mentor_feedback_query = db.query(Feedback)
    if current_user.role == UserRole.MENTOR:
        mentor_task_query = mentor_task_query.filter(Task.mentor_id == current_user.id)
        mentor_feedback_query = mentor_feedback_query.filter(Feedback.mentor_id == current_user.id)

    total_tasks = mentor_task_query.count()
    done_tasks = mentor_task_query.filter(Task.status == TaskStatus.DONE).count()
    completion_rate = round((done_tasks / total_tasks) * 100, 2) if total_tasks else 0.0

    return {
        "interns_count": db.query(User).filter(User.role == UserRole.INTERN, User.is_active.is_(True)).count(),
        "tasks": {
            "total": total_tasks,
            "done": done_tasks,
            "in_progress": mentor_task_query.filter(Task.status == TaskStatus.IN_PROGRESS).count(),
            "todo": mentor_task_query.filter(Task.status == TaskStatus.TODO).count(),
            "completion_rate": completion_rate,
        },
        "reports": {
            "pending_review": db.query(Report).filter(Report.status == "submitted").count(),
            "reviewed": db.query(Report).filter(Report.status == "reviewed").count(),
        },
        "feedback_count": mentor_feedback_query.count(),
    }

@router.get("/analytics/intern", response_model=InternAnalyticsOut)
def intern_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["intern"])),
):
    task_query = db.query(Task).filter(Task.assignee_id == current_user.id)
    total_tasks = task_query.count()
    done_tasks = task_query.filter(Task.status == TaskStatus.DONE).count()
    completion_rate = round((done_tasks / total_tasks) * 100, 2) if total_tasks else 0.0

    report_query = db.query(Report).filter(Report.intern_id == current_user.id)
    reports_submitted = report_query.count()
    reports_reviewed = report_query.filter(Report.status == "reviewed").count()

    ratings = [
        feedback.rating
        for feedback in db.query(Feedback).join(Report, Feedback.report_id == Report.id).filter(Report.intern_id == current_user.id).all()
    ]
    average_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0

    return {
        "tasks": {
            "total": total_tasks,
            "done": done_tasks,
            "in_progress": task_query.filter(Task.status == TaskStatus.IN_PROGRESS).count(),
            "todo": task_query.filter(Task.status == TaskStatus.TODO).count(),
            "completion_rate": completion_rate,
        },
        "reports": {
            "submitted": reports_submitted,
            "reviewed": reports_reviewed,
        },
        "feedback": {
            "count": len(ratings),
            "average_rating": average_rating,
        },
    }

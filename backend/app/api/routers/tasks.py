from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...database import get_db
from ...models import User, Task, TaskStatus, UserRole
from ...schemas.core import TaskCreate, TaskUpdate, TaskOut
from ...auth import get_current_user, require_role
from .notifications import create_notification_record
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter()

@router.post("/tasks", response_model=TaskOut)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "mentor"]))
):
    try:
        new_task = Task(
            **task.model_dump(),
            mentor_id=str(current_user.id)
        )
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        create_notification_record(
            db=db,
            user_id=new_task.assignee_id,
            notification_type="task_assigned",
            message=f"You have been assigned a new task: {new_task.title}",
        )
        return new_task
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create task"
        )

@router.get("/tasks", response_model=List[TaskOut])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.ADMIN:
        return db.query(Task).all()
    elif current_user.role == UserRole.MENTOR:
        return db.query(Task).filter(Task.mentor_id == current_user.id).all()
    else:
        return db.query(Task).filter(Task.assignee_id == current_user.id).all()

@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Permission check: Only mentor who assigned or admin can modify basic info
    # Intern can only update status if assigned
    is_admin = current_user.role == UserRole.ADMIN
    is_mentor_owner = current_user.role == UserRole.MENTOR and db_task.mentor_id == current_user.id
    is_assignee = db_task.assignee_id == current_user.id
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    if not is_admin and not is_mentor_owner and not is_assignee:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    if not is_admin and not is_mentor_owner and any(k != "status" for k in update_data.keys()):
        raise HTTPException(status_code=403, detail="Interns can only update task status")

    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    if db_task.status == TaskStatus.DONE and not db_task.completed_at:
        from datetime import datetime
        db_task.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "mentor"]))
):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == UserRole.MENTOR and db_task.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from ..models import UserRole, TaskStatus, TaskPriority

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=5000)
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    assignee_id: str
    due_date: date

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[str] = None
    due_date: Optional[date] = None

class TaskOut(TaskBase):
    id: str
    mentor_id: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    week_number: int = Field(ge=1, le=52)
    markdown_content: str = Field(min_length=1, max_length=50000)

class ReportCreate(ReportBase):
    pass

class ReportOut(ReportBase):
    id: str
    intern_id: str
    html_content: Optional[str] = None
    status: str
    submitted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    report_id: str
    comment: str = Field(min_length=1, max_length=5000)
    rating: int = Field(ge=1, le=5)

class FeedbackOut(FeedbackCreate):
    id: str
    mentor_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationReadAllResponse(BaseModel):
    message: str

class AdminUsersAnalytics(BaseModel):
    total: int
    active: int
    admins: int
    mentors: int
    interns: int

class AdminTasksAnalytics(BaseModel):
    total: int
    todo: int
    in_progress: int
    review: int
    done: int

class AdminReportsAnalytics(BaseModel):
    total: int
    submitted: int
    reviewed: int

class AdminFeedbackAnalytics(BaseModel):
    total: int

class AdminAnalyticsOut(BaseModel):
    users: AdminUsersAnalytics
    tasks: AdminTasksAnalytics
    reports: AdminReportsAnalytics
    feedback: AdminFeedbackAnalytics

class MentorTasksAnalytics(BaseModel):
    total: int
    done: int
    in_progress: int
    todo: int
    completion_rate: float

class MentorReportsAnalytics(BaseModel):
    pending_review: int
    reviewed: int

class MentorAnalyticsOut(BaseModel):
    interns_count: int
    tasks: MentorTasksAnalytics
    reports: MentorReportsAnalytics
    feedback_count: int

class InternTasksAnalytics(BaseModel):
    total: int
    done: int
    in_progress: int
    todo: int
    completion_rate: float

class InternReportsAnalytics(BaseModel):
    submitted: int
    reviewed: int

class InternFeedbackAnalytics(BaseModel):
    count: int
    average_rating: float

class InternAnalyticsOut(BaseModel):
    tasks: InternTasksAnalytics
    reports: InternReportsAnalytics
    feedback: InternFeedbackAnalytics

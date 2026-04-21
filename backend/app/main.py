from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import auth, users
from app.api.routers import tasks, reports, feedback, notifications, analytics

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Internship Dashboard API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(tasks.router, prefix="/api/v1", tags=["tasks"])
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
app.include_router(feedback.router, prefix="/api/v1", tags=["feedback"])
app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])
app.include_router(notifications.router, tags=["ws"])

@app.get("/")
def root():
    return {"message": "Internship Dashboard API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}
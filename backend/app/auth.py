from fastapi import APIRouter, HTTPException, Depends, status, Form, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from .database import get_db
from .models import User, UserRole
import os

# ✅ Router MUST be defined before usage
router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is required in environment")

# =======================
# SCHEMAS
# =======================

class LoginResponse(BaseModel):
    access_token: str
    user: dict
    role: str

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=6)
    role: UserRole = UserRole.INTERN

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=6)
    new_password: str = Field(min_length=6)

# =======================
# UTILS
# =======================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# =======================
# AUTH MIDDLEWARE
# =======================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        if not user.is_active:
            raise HTTPException(status_code=401, detail="Account disabled")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(roles: list):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# =======================
# LOGIN (IMPORTANT FIXED)
# =======================

@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    db: Session = Depends(get_db),
    username: str | None = Form(default=None),
    password: str | None = Form(default=None),
):
    # ✅ Normalize input
    email = username.strip().lower() if username else None
    submitted_password = password.strip() if password else None

    # ✅ Support JSON fallback
    if not email or not submitted_password:
        try:
            json_payload = await request.json()
        except Exception:
            json_payload = {}

        email = (json_payload.get("email") or json_payload.get("username") or "").strip().lower()
        submitted_password = (json_payload.get("password") or "").strip()

    if not email or not submitted_password:
        raise HTTPException(status_code=422, detail="username and password are required")

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(submitted_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account disabled")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    user.last_login = datetime.utcnow()
    db.commit()

    return {
        "access_token": token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        },
        "role": user.role
    }

# =======================
# REGISTER
# =======================

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # ❌ Admin register allowed nahi
    if request.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin cannot register")

    user = User(
        email=request.email,
        full_name=request.full_name,
        role=request.role,
        hashed_password=get_password_hash(request.password),
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully"}

# =======================
# CHANGE PASSWORD
# =======================

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password incorrect")

    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    return {"message": "Password changed successfully"}
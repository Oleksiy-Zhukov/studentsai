"""
Authentication module for StudentsAI.
Handles user registration, login, and JWT token management.
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from database import get_db
from models import User
from config import config

# Router
router = APIRouter()

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    subscription_tier: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    subscription_tier: Optional[str] = None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# JWT functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password."""
    return pwd_context.hash(password)


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials, config.SECRET_KEY, algorithms=[config.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


# Routes
@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        subscription_tier="free",
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create access token
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(db_user.id),
            email=db_user.email,
            username=db_user.username,
            subscription_tier=db_user.subscription_tier,
            created_at=db_user.created_at,
        ),
    )


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user."""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            subscription_tier=user.subscription_tier,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        subscription_tier=current_user.subscription_tier,
        created_at=current_user.created_at,
    )


@router.post("/refresh-token", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token."""
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(current_user.id)}, expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(current_user.id),
            email=current_user.email,
            username=current_user.username,
            subscription_tier=current_user.subscription_tier,
            created_at=current_user.created_at,
        ),
    )


@router.patch("/me", response_model=UserResponse)
async def update_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user information."""
    if user_data.subscription_tier is not None:
        current_user.subscription_tier = user_data.subscription_tier

    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        subscription_tier=current_user.subscription_tier,
        created_at=current_user.created_at,
    )

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserLogin(BaseModel):
    """User login request schema with camelCase."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class UserRegister(BaseModel):
    """User registration request schema with camelCase."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=1, max_length=100)


class TokenResponse(BaseModel):
    """Token response schema with camelCase."""
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    expiresIn: int  # seconds


class TokenRefresh(BaseModel):
    """Token refresh request schema."""
    refreshToken: str


class UserResponse(BaseModel):
    """User response schema with camelCase."""
    id: str  # ULID as string
    email: EmailStr
    name: str
    isActive: bool
    createdAt: datetime


class LoginResponse(BaseModel):
    """Login response schema combining token and user info."""
    user: UserResponse
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    expiresIn: int


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request schema."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request schema."""
    token: str = Field(..., min_length=1)
    newPassword: str = Field(..., min_length=8, max_length=100)


class ChangePasswordRequest(BaseModel):
    """Change password request schema for authenticated users."""
    currentPassword: str = Field(..., min_length=1, max_length=100)
    newPassword: str = Field(..., min_length=8, max_length=100)

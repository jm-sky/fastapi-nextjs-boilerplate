import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr
from ulid import ULID

from app.core.auth import get_password_hash, verify_password
from app.core.exceptions import UserAlreadyExistsError


class User(BaseModel):
    """User model with camelCase fields for API responses."""
    id: str  # ULID as string
    email: EmailStr
    name: str
    hashedPassword: str
    isActive: bool = True
    createdAt: datetime
    resetToken: Optional[str] = None
    resetTokenExpiry: Optional[datetime] = None

    def verify_password(self, password: str) -> bool:
        """Verify password against stored hash."""
        return verify_password(password, self.hashedPassword)

    def set_password(self, password: str) -> None:
        """Set new password hash."""
        self.hashedPassword = get_password_hash(password)

    def set_reset_token(self, token: str, expiry: datetime) -> None:
        """Set password reset token and expiry."""
        self.resetToken = token
        self.resetTokenExpiry = expiry

    def clear_reset_token(self) -> None:
        """Clear password reset token."""
        self.resetToken = None
        self.resetTokenExpiry = None

    def is_reset_token_valid(self, token: str) -> bool:
        """Check if reset token is valid and not expired."""
        if not self.resetToken or not self.resetTokenExpiry:
            return False
        if self.resetToken != token:
            return False
        if datetime.now(timezone.utc) > self.resetTokenExpiry:
            return False
        return True

    def to_response(self) -> Dict[str, Any]:
        """Convert to camelCase response format."""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "isActive": self.isActive,
            "createdAt": self.createdAt
        }


# Temporary in-memory user store (replace with database later)
class UserStore:
    def __init__(self) -> None:
        self._users: Dict[str, User] = {}  # ULID -> User
        self._email_index: Dict[str, str] = {}  # email -> ULID

    def create_user(self, email: str, password: str, full_name: str) -> User:
        """Create a new user."""
        # Normalize email to lowercase for case-insensitive storage
        normalized_email = email.lower().strip()

        if normalized_email in self._email_index:
            raise UserAlreadyExistsError()

        # Generate new ULID for user
        user_id = str(ULID())

        user = User(
            id=user_id,
            email=normalized_email,
            name=full_name,
            hashedPassword=get_password_hash(password),
            createdAt=datetime.now(timezone.utc)
        )

        self._users[user_id] = user
        self._email_index[normalized_email] = user_id

        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        # Normalize email for case-insensitive lookup
        normalized_email = email.lower().strip()
        user_id = self._email_index.get(normalized_email)
        if user_id:
            return self._users.get(user_id)
        return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ULID."""
        return self._users.get(user_id)

    def get_all_users(self) -> List[User]:
        """Get all users."""
        return list(self._users.values())

    def update_user(self, user: User) -> User:
        """Update user in store."""
        self._users[user.id] = user
        return user

    def generate_reset_token(self, email: str) -> Optional[str]:
        """Generate and store password reset token for user."""
        user = self.get_user_by_email(email)
        if not user or not user.isActive:
            return None

        # Generate reset token (in production, use cryptographically secure token)
        import secrets
        token = secrets.token_urlsafe(32)

        # Token expires in 1 hour
        from datetime import timedelta
        expiry = datetime.now(timezone.utc) + timedelta(hours=1)

        # Set reset token
        user.set_reset_token(token, expiry)
        self.update_user(user)

        return token

    def reset_password_with_token(self, token: str, new_password: str) -> bool:
        """Reset password using token."""
        # Find user with this token
        for user in self._users.values():
            if user.is_reset_token_valid(token):
                user.set_password(new_password)
                user.clear_reset_token()
                self.update_user(user)
                return True
        return False


# Global user store instance
user_store = UserStore()


def seed_development_user():
    """Create a default test user for development environment only."""
    try:
        user_store.create_user(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )
    except UserAlreadyExistsError:
        pass  # User already exists


# Only seed user in development environment
if os.getenv("ENVIRONMENT", "development").lower() == "development":
    seed_development_user()

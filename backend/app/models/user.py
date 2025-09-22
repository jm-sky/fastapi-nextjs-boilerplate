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

    def verify_password(self, password: str) -> bool:
        """Verify password against stored hash."""
        return verify_password(password, self.hashedPassword)

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

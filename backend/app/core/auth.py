from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext

from app.core.settings import settings
from app.core.token_blacklist import token_blacklist

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.security.access_token_expires_minutes)

    to_encode.update({
        "exp": expire,
        "type": "access",
        "iat": datetime.now(timezone.utc)
    })
    encoded_jwt = jwt.encode(to_encode, settings.security.secret_key, algorithm=settings.security.jwt_algorithm)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """Verify and decode a JWT token."""
    # Check if token is blacklisted first
    if token_blacklist.is_blacklisted(token):
        from app.core.exceptions import InvalidTokenError
        raise InvalidTokenError("Token has been revoked")

    try:
        payload = jwt.decode(token, settings.security.secret_key, algorithms=[settings.security.jwt_algorithm])
        return payload
    except jwt.ExpiredSignatureError:
        from app.core.exceptions import ExpiredTokenError
        raise ExpiredTokenError()
    except jwt.InvalidTokenError:
        from app.core.exceptions import InvalidTokenError
        raise InvalidTokenError()


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a JWT refresh token with longer expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.security.refresh_token_expires_days)
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "iat": datetime.now(timezone.utc)
    })
    encoded_jwt = jwt.encode(to_encode, settings.security.secret_key, algorithm=settings.security.jwt_algorithm)
    return encoded_jwt


def create_password_reset_token(data: Dict[str, Any]) -> str:
    """Create a JWT password reset token with 1-hour expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    to_encode.update({
        "exp": expire,
        "type": "password_reset",
        "iat": datetime.now(timezone.utc)
    })
    encoded_jwt = jwt.encode(to_encode, settings.security.secret_key, algorithm=settings.security.jwt_algorithm)
    return encoded_jwt

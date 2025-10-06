from typing import Annotated, Optional

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.auth import verify_token
from app.core.exceptions import InvalidTokenError, UserNotFoundError, InactiveUserError
from app.models.user import User, user_store

# Security scheme for Bearer token
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Get current authenticated user from JWT token."""
    # Validate Bearer scheme
    if credentials.scheme.lower() != "bearer":
        raise InvalidTokenError("Invalid authentication scheme")

    # Verify token (let specific exceptions bubble up)
    payload = verify_token(credentials.credentials)

    # Get user ID from token (ULID as string)
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise InvalidTokenError("Invalid token payload")

    # Basic validation that it looks like a ULID (26 characters, alphanumeric)
    if not isinstance(user_id, str) or len(user_id) != 26:
        raise InvalidTokenError("Invalid user ID format in token")

    # Get user from store
    user = user_store.get_user_by_id(user_id)
    if user is None:
        raise UserNotFoundError()

    if not user.isActive:
        raise InactiveUserError()

    # TODO: Add token blacklist check here
    # if is_token_blacklisted(credentials.credentials):
    #     raise InvalidTokenError("Token has been revoked")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user (alias for clarity)."""
    return current_user


# ============================================================================
# Centralized Dependency Registry
# ============================================================================
# Type aliases for cleaner endpoint signatures

CurrentUser = Annotated[User, Depends(get_current_user)]
"""Type alias for current authenticated user dependency."""

CurrentActiveUser = Annotated[User, Depends(get_current_active_user)]
"""Type alias for current active user dependency."""

BearerCredentials = Annotated[HTTPAuthorizationCredentials, Depends(security)]
"""Type alias for HTTP Bearer token credentials."""


class Dependencies:
    """
    Central dependency registry for common dependencies.

    Provides static methods that return dependency functions for use in endpoints.

    Usage:
        from app.core.dependencies import CurrentActiveUser

        @router.get("/me")
        async def get_me(user: CurrentActiveUser) -> UserResponse:
            return UserResponse(**user.to_response())
    """

    @staticmethod
    def current_user() -> User:
        """Get current authenticated user."""
        return Depends(get_current_user)

    @staticmethod
    def active_user() -> User:
        """Get current active user."""
        return Depends(get_current_active_user)

    @staticmethod
    def bearer_credentials() -> HTTPAuthorizationCredentials:
        """Get Bearer token credentials."""
        return Depends(security)

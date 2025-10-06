"""Custom exception classes for the application."""

from fastapi import Request, status
from fastapi.responses import JSONResponse


class AuthenticationError(Exception):
    """Base exception for authentication-related errors."""

    def __init__(self, message: str, status_code: int = status.HTTP_401_UNAUTHORIZED):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class UserNotFoundError(AuthenticationError):
    """Raised when a user is not found."""

    def __init__(self, message: str = "User not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class UserAlreadyExistsError(AuthenticationError):
    """Raised when trying to create a user that already exists."""

    def __init__(self, message: str = "User with this email already exists"):
        super().__init__(message, status.HTTP_409_CONFLICT)


class InvalidCredentialsError(AuthenticationError):
    """Raised when login credentials are invalid."""

    def __init__(self, message: str = "Incorrect email or password"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class InvalidTokenError(AuthenticationError):
    """Raised when a token is invalid or malformed."""

    def __init__(self, message: str = "Invalid token"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class ExpiredTokenError(AuthenticationError):
    """Raised when a token has expired."""

    def __init__(self, message: str = "Token has expired"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class InactiveUserError(AuthenticationError):
    """Raised when trying to authenticate an inactive user."""

    def __init__(self, message: str = "User account is inactive"):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)


class InvalidTokenTypeError(AuthenticationError):
    """Raised when a token type is not appropriate for the operation."""

    def __init__(self, message: str = "Invalid token type"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class InvalidResetTokenError(AuthenticationError):
    """Raised when a password reset token is invalid or expired."""

    def __init__(self, message: str = "Invalid or expired reset token"):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)


# Global exception handlers
async def authentication_exception_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
    """Handle authentication exceptions globally."""
    headers = {}

    # Add WWW-Authenticate header for 401 responses
    if exc.status_code == 401:
        headers["WWW-Authenticate"] = "Bearer"

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
        headers=headers
    )

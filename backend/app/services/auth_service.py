"""Authentication service layer containing business logic."""

import secrets
from typing import Optional

from app.core.auth import create_access_token, create_refresh_token, verify_token
from app.core.exceptions import (
    InvalidCredentialsError,
    InvalidTokenError,
    InvalidTokenTypeError,
    UserNotFoundError,
    InactiveUserError,
    InvalidResetTokenError,
)
from app.core.settings import settings
from app.core.token_blacklist import token_blacklist
from app.models.user import User, user_store
from app.schemas.auth import LoginResponse, TokenResponse, UserResponse


class AuthService:
    """
    Authentication service handling business logic for user authentication.

    Separates business logic from API endpoints for better testability
    and code organization.
    """

    @staticmethod
    def _create_login_response(user: User) -> LoginResponse:
        """
        Create login response with tokens for authenticated user.

        Args:
            user: Authenticated user object

        Returns:
            LoginResponse with user data and tokens
        """
        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})

        return LoginResponse(
            user=UserResponse(**user.to_response()),
            accessToken=access_token,
            refreshToken=refresh_token,
            expiresIn=settings.security.access_token_expires_minutes * 60
        )

    @staticmethod
    async def register_user(email: str, password: str, name: str) -> LoginResponse:
        """
        Register new user and return authentication tokens.

        Args:
            email: User email address
            password: User password (will be hashed)
            name: User full name

        Returns:
            LoginResponse with user data and tokens

        Raises:
            UserAlreadyExistsError: If email is already registered
        """
        # Create user (let UserAlreadyExistsError bubble up)
        user = user_store.create_user(
            email=email,
            password=password,
            full_name=name
        )

        return AuthService._create_login_response(user)

    @staticmethod
    async def authenticate_user(email: str, password: str) -> LoginResponse:
        """
        Authenticate user with email and password.

        Args:
            email: User email address
            password: User password

        Returns:
            LoginResponse with user data and tokens

        Raises:
            InvalidCredentialsError: If credentials are invalid
            InactiveUserError: If user account is inactive
        """
        # Get user by email
        user = user_store.get_user_by_email(email)
        if not user or not user.verify_password(password):
            raise InvalidCredentialsError()

        # Check if user is active
        if not user.isActive:
            raise InactiveUserError()

        return AuthService._create_login_response(user)

    @staticmethod
    async def refresh_tokens(refresh_token: str) -> TokenResponse:
        """
        Refresh access token using refresh token.

        Args:
            refresh_token: Valid refresh token

        Returns:
            TokenResponse with new access and refresh tokens

        Raises:
            InvalidTokenError: If token is invalid
            InvalidTokenTypeError: If token is not a refresh token
            UserNotFoundError: If user doesn't exist
            InactiveUserError: If user account is inactive
        """
        # Verify refresh token
        payload = verify_token(refresh_token)

        # Check if it's actually a refresh token
        if payload.get("type") != "refresh":
            raise InvalidTokenTypeError()

        # Get user ID (ULID as string)
        user_id = payload.get("sub")
        if not user_id:
            raise InvalidTokenError("Invalid token payload")

        # Basic validation that it looks like a ULID (26 characters)
        if not isinstance(user_id, str) or len(user_id) != 26:
            raise InvalidTokenError("Invalid user ID format in token")

        # Verify user exists and is active
        user = user_store.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError()

        if not user.isActive:
            raise InactiveUserError()

        # Create new tokens
        new_access_token = create_access_token({"sub": user.id})
        new_refresh_token = create_refresh_token({"sub": user.id})

        return TokenResponse(
            accessToken=new_access_token,
            refreshToken=new_refresh_token,
            expiresIn=settings.security.access_token_expires_minutes * 60
        )

    @staticmethod
    async def logout_user(access_token: str, user: User) -> None:
        """
        Logout user by blacklisting their access token.

        Args:
            access_token: User's access token to blacklist
            user: Current authenticated user
        """
        token_blacklist.add(access_token)

    @staticmethod
    async def get_user_profile(user: User) -> UserResponse:
        """
        Get user profile information.

        Args:
            user: Current authenticated user

        Returns:
            UserResponse with user data
        """
        return UserResponse(**user.to_response())

    @staticmethod
    async def request_password_reset(email: str) -> Optional[str]:
        """
        Generate password reset token for user.

        Args:
            email: User email address

        Returns:
            Reset token if user exists and is active, None otherwise
        """
        return user_store.generate_reset_token(email)

    @staticmethod
    async def reset_password(token: str, new_password: str) -> bool:
        """
        Reset user password using reset token.

        Args:
            token: Password reset token
            new_password: New password to set

        Returns:
            True if password was reset successfully

        Raises:
            InvalidResetTokenError: If token is invalid or expired
        """
        success = user_store.reset_password_with_token(token, new_password)
        if not success:
            raise InvalidResetTokenError()
        return True

    @staticmethod
    async def change_password(user_id: str, current_password: str, new_password: str) -> bool:
        """
        Change user password after verifying current password.

        Args:
            user_id: User ID
            current_password: Current password for verification
            new_password: New password to set

        Returns:
            True if password was changed successfully

        Raises:
            InvalidCredentialsError: If current password is incorrect
        """
        success = user_store.change_password(user_id, current_password, new_password)
        if not success:
            raise InvalidCredentialsError("Current password is incorrect")
        return True

    @staticmethod
    async def authenticate_with_google(email: str, name: str, google_id: str) -> LoginResponse:
        """
        Authenticate user with Google OAuth.

        Creates new user if doesn't exist, or authenticates existing user.

        Args:
            email: User email from Google
            name: User name from Google
            google_id: Google user ID

        Returns:
            LoginResponse with user data and tokens

        Raises:
            InactiveUserError: If user account is inactive
        """
        # Check if user exists
        user = user_store.get_user_by_email(email)

        if not user:
            # Create new user with Google OAuth
            # Generate a random password since OAuth users don't need it
            random_password = secrets.token_urlsafe(32)

            user = user_store.create_user(
                email=email,
                password=random_password,
                full_name=name
            )

        # Check if user is active
        if not user.isActive:
            raise InactiveUserError()

        return AuthService._create_login_response(user)

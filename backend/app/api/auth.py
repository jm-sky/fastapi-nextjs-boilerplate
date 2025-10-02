from fastapi import APIRouter, Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from authlib.integrations.starlette_client import OAuthError  # type: ignore[import-untyped]

from app.core.auth import create_access_token, create_refresh_token, verify_token
from app.core.dependencies import get_current_active_user
from app.core.exceptions import (
    InvalidCredentialsError,
    InvalidTokenError,
    InvalidTokenTypeError,
    UserNotFoundError,
    InactiveUserError,
    InvalidResetTokenError,
)
from app.core.rate_limit import limiter
from app.core.settings import settings
from app.core.oauth import oauth
from app.models.user import User, user_store
from app.schemas.auth import (
    LoginResponse,
    MessageResponse,
    TokenRefresh,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
)

router = APIRouter(prefix="/auth", tags=["authentication"])

# Security scheme for extracting Bearer token
security = HTTPBearer()


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.rate_limit.auth_register)
async def register(request: Request, user_data: UserRegister) -> LoginResponse:
    """Register a new user."""
    # Verify reCAPTCHA
    from app.core.recaptcha import verify_recaptcha
    await verify_recaptcha(user_data.recaptchaToken or "", action="register")

    # Create user (let UserAlreadyExistsError bubble up to global handler)
    user = user_store.create_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.name
    )

    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return LoginResponse(
        user=UserResponse(**user.to_response()),
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresIn=settings.security.access_token_expires_minutes * 60
    )


@router.post("/login", response_model=LoginResponse)
@limiter.limit(settings.rate_limit.auth_login)
async def login(request: Request, user_credentials: UserLogin) -> LoginResponse:
    """Authenticate user and return tokens."""
    # Verify reCAPTCHA
    from app.core.recaptcha import verify_recaptcha
    await verify_recaptcha(user_credentials.recaptchaToken or "", action="login")

    # Get user by email
    user = user_store.get_user_by_email(user_credentials.email)
    if not user:
        raise InvalidCredentialsError()

    # Verify password
    if not user.verify_password(user_credentials.password):
        raise InvalidCredentialsError()

    # Check if user is active
    if not user.isActive:
        raise InactiveUserError()

    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return LoginResponse(
        user=UserResponse(**user.to_response()),
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresIn=settings.security.access_token_expires_minutes * 60
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit(settings.rate_limit.auth_refresh)
async def refresh_token(request: Request, token_data: TokenRefresh) -> TokenResponse:
    """Refresh access token using refresh token."""
    # Verify refresh token (let exceptions bubble up)
    payload = verify_token(token_data.refreshToken)

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
    new_access_token = create_access_token(data={"sub": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.id})

    return TokenResponse(
        accessToken=new_access_token,
        refreshToken=new_refresh_token,
        expiresIn=settings.security.access_token_expires_minutes * 60
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: User = Depends(get_current_active_user)
) -> MessageResponse:
    """Logout user and blacklist their access token."""
    from app.core.token_blacklist import token_blacklist

    # Add the access token to blacklist
    token_blacklist.add(credentials.credentials)

    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
) -> UserResponse:
    """Get current user information."""
    return UserResponse(**current_user.to_response())


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit(settings.rate_limit.auth_register)  # Reuse register rate limit for security
async def forgot_password(request: Request, forgot_request: ForgotPasswordRequest) -> MessageResponse:
    """Request password reset token."""
    # Verify reCAPTCHA
    from app.core.recaptcha import verify_recaptcha
    await verify_recaptcha(forgot_request.recaptchaToken or "", action="forgot_password")

    # Generate reset token (always return success for security - don't reveal if email exists)
    token = user_store.generate_reset_token(forgot_request.email)

    if token:
        # In production, send email with reset link containing the token
        # TODO: Send email with reset link
        # await send_password_reset_email(forgot_request.email, token)

        # For development only - log the reset link
        if settings.app.environment == "development":
            import logging
            logger = logging.getLogger(__name__)
            reset_link = f"{settings.frontend_url}/reset-password/{token}"
            logger.info(f"Password reset link for {forgot_request.email}: {reset_link}")

    # Always return success message for security (don't reveal if email exists)
    return MessageResponse(message="If the email exists, a password reset link has been sent")


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit(settings.rate_limit.auth_register)  # Reuse register rate limit for security
async def reset_password(request: Request, reset_request: ResetPasswordRequest) -> MessageResponse:
    """Reset password using token."""
    success = user_store.reset_password_with_token(
        reset_request.token,
        reset_request.newPassword
    )

    if not success:
        raise InvalidResetTokenError()

    return MessageResponse(message="Password has been successfully reset")


@router.post("/change-password", response_model=MessageResponse)
@limiter.limit(settings.rate_limit.auth_password_change)
async def change_password(
    request: Request,
    change_request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user)
) -> MessageResponse:
    """Change password for authenticated user."""
    # Attempt to change password
    success = user_store.change_password(
        user_id=current_user.id,
        current_password=change_request.currentPassword,
        new_password=change_request.newPassword
    )

    if not success:
        raise InvalidCredentialsError("Current password is incorrect")

    # TODO: Invalidate all user tokens after password change
    # This requires implementing a token blacklist system:
    # 1. Create a token blacklist store (Redis or database)
    # 2. Add all current user tokens to blacklist
    # 3. Update get_current_user dependency to check blacklist
    # For now, users should log out and log back in after password change

    return MessageResponse(message="Password has been successfully changed")


# OAuth Google Authentication


@router.get("/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth login flow."""
    # Build redirect URI dynamically from request
    redirect_uri = str(request.url_for('google_callback'))
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request) -> LoginResponse:
    """Handle Google OAuth callback and authenticate user."""
    try:
        # Exchange authorization code for access token
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as error:
        # OAuth failed - redirect to login with error
        raise InvalidCredentialsError(f"Google authentication failed: {error.error}")

    # Extract user info from token
    user_info = token.get('userinfo')
    if not user_info:
        raise InvalidCredentialsError("Failed to get user information from Google")

    email = user_info.get('email')
    name = user_info.get('name', '')
    google_id = user_info.get('sub')  # Google user ID

    if not email or not google_id:
        raise InvalidCredentialsError("Incomplete user information from Google")

    # Check if user exists
    user = user_store.get_user_by_email(email)

    if not user:
        # Create new user with Google OAuth
        # Generate a random password since OAuth users don't need it
        import secrets
        random_password = secrets.token_urlsafe(32)

        user = user_store.create_user(
            email=email,
            password=random_password,  # User won't use this, they'll use OAuth
            full_name=name
        )

    # Check if user is active
    if not user.isActive:
        raise InactiveUserError()

    # Generate JWT tokens
    access_token = create_access_token({"sub": user.id, "type": "access"})
    refresh_token = create_refresh_token({"sub": user.id, "type": "refresh"})

    return LoginResponse(
        user=UserResponse(**user.to_response()),
        accessToken=access_token,
        refreshToken=refresh_token,
        tokenType="Bearer",
        expiresIn=settings.security.access_token_expires_minutes * 60
    )

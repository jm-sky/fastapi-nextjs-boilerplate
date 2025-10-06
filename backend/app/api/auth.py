from fastapi import APIRouter, Request, status
from authlib.integrations.starlette_client import OAuthError  # type: ignore[import-untyped]

from app.core.decorators import rate_limit, recaptcha_protected
from app.core.dependencies import BearerCredentials, CurrentActiveUser
from app.core.exceptions import InvalidCredentialsError
from app.core.settings import settings
from app.core.oauth import oauth
from app.models.user import User
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
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@rate_limit(settings.rate_limit.auth_register)
@recaptcha_protected("register")
async def register(request: Request, user_data: UserRegister) -> LoginResponse:
    """Register a new user."""
    return await AuthService.register_user(
        email=user_data.email,
        password=user_data.password,
        name=user_data.name
    )


@router.post("/login", response_model=LoginResponse)
@rate_limit(settings.rate_limit.auth_login)
@recaptcha_protected("login")
async def login(request: Request, user_credentials: UserLogin) -> LoginResponse:
    """Authenticate user and return tokens."""
    return await AuthService.authenticate_user(
        email=user_credentials.email,
        password=user_credentials.password
    )


@router.post("/refresh", response_model=TokenResponse)
@rate_limit(settings.rate_limit.auth_refresh)
async def refresh_token(request: Request, token_data: TokenRefresh) -> TokenResponse:
    """Refresh access token using refresh token."""
    return await AuthService.refresh_tokens(token_data.refreshToken)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    credentials: BearerCredentials,
    current_user: CurrentActiveUser
) -> MessageResponse:
    """Logout user and blacklist their access token."""
    await AuthService.logout_user(credentials.credentials, current_user)
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: CurrentActiveUser) -> UserResponse:
    """Get current user information."""
    return await AuthService.get_user_profile(current_user)


@router.post("/forgot-password", response_model=MessageResponse)
@rate_limit(settings.rate_limit.auth_register)
@recaptcha_protected("forgot_password")
async def forgot_password(request: Request, forgot_request: ForgotPasswordRequest) -> MessageResponse:
    """Request password reset token."""
    # Generate reset token (always return success for security - don't reveal if email exists)
    token = await AuthService.request_password_reset(forgot_request.email)

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
@rate_limit(settings.rate_limit.auth_register)
async def reset_password(request: Request, reset_request: ResetPasswordRequest) -> MessageResponse:
    """Reset password using token."""
    await AuthService.reset_password(reset_request.token, reset_request.newPassword)
    return MessageResponse(message="Password has been successfully reset")


@router.post("/change-password", response_model=MessageResponse)
@rate_limit(settings.rate_limit.auth_password_change)
async def change_password(
    request: Request,
    change_request: ChangePasswordRequest,
    current_user: CurrentActiveUser
) -> MessageResponse:
    """Change password for authenticated user."""
    await AuthService.change_password(
        user_id=current_user.id,
        current_password=change_request.currentPassword,
        new_password=change_request.newPassword
    )

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

    return await AuthService.authenticate_with_google(email, name, google_id)

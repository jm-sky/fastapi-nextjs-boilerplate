from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    # Application
    app_name: str = Field(default="SaaS Boilerplate API", description="Application name")
    app_version: str = Field(default="1.0.0", description="Application version")
    debug: bool = Field(default=False, description="Debug mode")

    # Server
    host: str = Field(default="127.0.0.1", description="Server host")
    port: int = Field(default=8000, description="Server port")
    environment: str = Field(default="development", description="Environment (development, production)")

    # CORS
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "https://yourdomain.com"],
        description="Allowed CORS origins"
    )

    # Security
    secret_key: str = Field(
        default="your-secret-key-change-this-in-production",
        description="Secret key for JWT and other crypto operations"
    )

    # JWT Configuration
    jwt_algorithm: str = Field(default="HS256", description="JWT signing algorithm")
    access_token_expires_minutes: int = Field(default=30, description="Access token expiration in minutes")
    refresh_token_expires_days: int = Field(default=7, description="Refresh token expiration in days")

    # Rate Limiting Configuration
    rate_limit_default_per_day: int = Field(default=1000, description="Default rate limit per day")
    rate_limit_default_per_hour: int = Field(default=100, description="Default rate limit per hour")
    auth_register_rate_limit: str = Field(default="5/minute", description="Registration rate limit")
    auth_login_rate_limit: str = Field(default="10/minute", description="Login rate limit")
    auth_refresh_rate_limit: str = Field(default="20/minute", description="Token refresh rate limit")
    auth_password_change_rate_limit: str = Field(default="3/minute", description="Password change rate limit")

    # Frontend URL Configuration
    frontend_url: str = Field(
        default="http://localhost:3000",
        description="Frontend application URL for reset links and redirects"
    )

    # Google reCAPTCHA Configuration
    recaptcha_enabled: bool = Field(
        default=False,
        description="Enable reCAPTCHA verification (set to False for development/testing)"
    )
    recaptcha_secret_key: str = Field(
        default="",
        description="Google reCAPTCHA v3 secret key"
    )
    recaptcha_site_key: str = Field(
        default="",
        description="Google reCAPTCHA v3 site key (for frontend)"
    )
    recaptcha_min_score: float = Field(
        default=0.5,
        description="Minimum reCAPTCHA score to accept (0.0-1.0)"
    )
    recaptcha_verify_url: str = Field(
        default="https://www.google.com/recaptcha/api/siteverify",
        description="reCAPTCHA verification endpoint"
    )

    # Google OAuth Configuration
    google_client_id: str = Field(
        default="",
        description="Google OAuth client ID"
    )
    google_client_secret: str = Field(
        default="",
        description="Google OAuth client secret"
    )
    google_redirect_uri: str = Field(
        default="http://localhost:3000/auth/google/callback",
        description="Google OAuth redirect URI (must match Google Console configuration)"
    )

    @field_validator('secret_key')
    def validate_secret_key(cls, v: str) -> str:
        """Validate secret key strength and security."""
        if v == "your-secret-key-change-this-in-production":
            raise ValueError(
                "Secret key must be changed from default value in production. "
                "Set SECRET_KEY environment variable with a secure random string."
            )

        if len(v) < 32:
            raise ValueError(
                "Secret key must be at least 32 characters long for security. "
                "Use a cryptographically secure random string."
            )

        # Check for basic entropy (not all same character)
        if len(set(v)) < 8:
            raise ValueError(
                "Secret key must have sufficient entropy. "
                "Use a truly random string with varied characters."
            )

        return v

    # Database (for future use)
    database_url: str = Field(
        default="sqlite:///./app.db",
        description="Database connection URL"
    )


settings = Settings()

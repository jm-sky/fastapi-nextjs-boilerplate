from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Shared config for all nested settings
_base_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    case_sensitive=False,
    extra="ignore"
)


class AppSettings(BaseSettings):
    model_config = _base_config
    """Application configuration."""

    name: str = Field(
        default="SaaS Boilerplate API",
        validation_alias="APP_NAME",
        description="Application name"
    )
    version: str = Field(
        default="1.0.0",
        validation_alias="APP_VERSION",
        description="Application version"
    )
    debug: bool = Field(
        default=False,
        validation_alias="DEBUG",
        description="Debug mode"
    )
    environment: str = Field(
        default="development",
        validation_alias="ENVIRONMENT",
        description="Environment (development, staging, production)"
    )

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Validate environment is one of allowed values."""
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"Environment must be one of {allowed}, got: {v}")
        return v


class ServerSettings(BaseSettings):
    """Server configuration."""

    model_config = _base_config

    host: str = Field(
        default="127.0.0.1",
        validation_alias="HOST",
        description="Server host"
    )
    port: int = Field(
        default=8000,
        validation_alias="PORT",
        description="Server port"
    )
    cors_origins: list[str] = Field(
        default=["http://localhost:3000"],
        validation_alias="CORS_ORIGINS",
        description="Allowed CORS origins"
    )

    @field_validator("port")
    @classmethod
    def validate_port(cls, v: int) -> int:
        """Validate port is in valid range."""
        if not 1 <= v <= 65535:
            raise ValueError(f"Port must be between 1 and 65535, got: {v}")
        return v


class SecuritySettings(BaseSettings):
    """Security and authentication configuration."""

    model_config = _base_config

    secret_key: str = Field(
        default="your-secret-key-change-this-in-production",
        validation_alias="SECRET_KEY",
        description="Secret key for JWT and other crypto operations"
    )
    jwt_algorithm: str = Field(
        default="HS256",
        validation_alias="JWT_ALGORITHM",
        description="JWT signing algorithm"
    )
    access_token_expires_minutes: int = Field(
        default=30,
        validation_alias="ACCESS_TOKEN_EXPIRES_MINUTES",
        description="Access token expiration in minutes"
    )
    refresh_token_expires_days: int = Field(
        default=7,
        validation_alias="REFRESH_TOKEN_EXPIRES_DAYS",
        description="Refresh token expiration in days"
    )

    @field_validator("secret_key")
    @classmethod
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


class RateLimitSettings(BaseSettings):
    """Rate limiting configuration."""

    model_config = _base_config

    default_per_day: int = Field(
        default=1000,
        validation_alias="RATE_LIMIT_DEFAULT_PER_DAY",
        description="Default rate limit per day"
    )
    default_per_hour: int = Field(
        default=100,
        validation_alias="RATE_LIMIT_DEFAULT_PER_HOUR",
        description="Default rate limit per hour"
    )
    auth_register: str = Field(
        default="5/minute",
        validation_alias="AUTH_REGISTER_RATE_LIMIT",
        description="Registration rate limit"
    )
    auth_login: str = Field(
        default="10/minute",
        validation_alias="AUTH_LOGIN_RATE_LIMIT",
        description="Login rate limit"
    )
    auth_refresh: str = Field(
        default="20/minute",
        validation_alias="AUTH_REFRESH_RATE_LIMIT",
        description="Token refresh rate limit"
    )
    auth_password_change: str = Field(
        default="3/minute",
        validation_alias="AUTH_PASSWORD_CHANGE_RATE_LIMIT",
        description="Password change rate limit"
    )


class DatabaseSettings(BaseSettings):
    """Database configuration."""

    model_config = _base_config

    url: str = Field(
        default="sqlite:///./app.db",
        validation_alias="DATABASE_URL",
        description="Database connection URL"
    )


class RedisSettings(BaseSettings):
    """Redis configuration."""

    model_config = _base_config

    url: str = Field(
        default="redis://localhost:6379/0",
        validation_alias="REDIS_URL",
        description="Redis connection URL"
    )


class RecaptchaSettings(BaseSettings):
    """Google reCAPTCHA configuration."""

    model_config = _base_config

    enabled: bool = Field(
        default=False,
        validation_alias="RECAPTCHA_ENABLED",
        description="Enable reCAPTCHA verification"
    )
    secret_key: str = Field(
        default="",
        validation_alias="RECAPTCHA_SECRET_KEY",
        description="Google reCAPTCHA v3 secret key"
    )
    site_key: str = Field(
        default="",
        validation_alias="RECAPTCHA_SITE_KEY",
        description="Google reCAPTCHA v3 site key"
    )
    min_score: float = Field(
        default=0.5,
        validation_alias="RECAPTCHA_MIN_SCORE",
        description="Minimum reCAPTCHA score to accept (0.0-1.0)"
    )
    verify_url: str = Field(
        default="https://www.google.com/recaptcha/api/siteverify",
        validation_alias="RECAPTCHA_VERIFY_URL",
        description="reCAPTCHA verification endpoint"
    )

    @field_validator("min_score")
    @classmethod
    def validate_min_score(cls, v: float) -> float:
        """Validate reCAPTCHA score is in valid range."""
        if not 0.0 <= v <= 1.0:
            raise ValueError(f"reCAPTCHA min_score must be between 0.0 and 1.0, got: {v}")
        return v


class GoogleOAuthSettings(BaseSettings):
    """Google OAuth configuration."""

    model_config = _base_config

    client_id: str = Field(
        default="",
        validation_alias="GOOGLE_CLIENT_ID",
        description="Google OAuth client ID"
    )
    client_secret: str = Field(
        default="",
        validation_alias="GOOGLE_CLIENT_SECRET",
        description="Google OAuth client secret"
    )
    redirect_uri: str = Field(
        default="http://localhost:3000/auth/google/callback",
        validation_alias="GOOGLE_REDIRECT_URI",
        description="Google OAuth redirect URI"
    )


class Settings(BaseSettings):
    """Main application settings composed of nested configuration classes."""

    model_config = _base_config

    # Nested settings
    app: AppSettings = Field(default_factory=AppSettings)
    server: ServerSettings = Field(default_factory=ServerSettings)
    security: SecuritySettings = Field(default_factory=SecuritySettings)
    rate_limit: RateLimitSettings = Field(default_factory=RateLimitSettings)
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    redis: RedisSettings = Field(default_factory=RedisSettings)
    recaptcha: RecaptchaSettings = Field(default_factory=RecaptchaSettings)
    google_oauth: GoogleOAuthSettings = Field(default_factory=GoogleOAuthSettings)

    # Legacy flat fields for backward compatibility
    frontend_url: str = Field(
        default="http://localhost:3000",
        validation_alias="FRONTEND_URL",
        description="Frontend application URL for reset links and redirects"
    )


settings = Settings()

from pydantic import Field
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

    # Database (for future use)
    database_url: str = Field(
        default="sqlite:///./app.db",
        description="Database connection URL"
    )


settings = Settings()
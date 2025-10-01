from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.settings import Settings
from app.core.rate_limit import limiter, rate_limit_handler
from app.core.exceptions import AuthenticationError, authentication_exception_handler


def create_app(settings: Settings) -> FastAPI:
    """Create and configure FastAPI application."""

    app = FastAPI(
        title=settings.app_name,
        description="Modern SaaS application backend with FastAPI",
        version=settings.app_version,
        debug=settings.debug,
    )

    # Start background task for token blacklist cleanup
    @app.on_event("startup")
    async def startup_event():
        """Start background tasks on application startup."""
        import threading
        from app.core.token_blacklist import cleanup_blacklist_periodically

        # Run cleanup in background thread
        cleanup_thread = threading.Thread(
            target=cleanup_blacklist_periodically,
            daemon=True,
            name="blacklist-cleanup"
        )
        cleanup_thread.start()

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Configure rate limiting middleware and handlers
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)
    app.add_exception_handler(RateLimitExceeded, rate_limit_handler)  # type: ignore

    # Configure custom exception handlers
    app.add_exception_handler(AuthenticationError, authentication_exception_handler)  # type: ignore

    # Register routes
    from app.api.health import router as health_router
    from app.api.auth import router as auth_router

    app.include_router(health_router)
    app.include_router(auth_router)

    return app

"""Rate limiting configuration and utilities."""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.settings import settings


def get_client_ip(request: Request) -> str:
    """
    Get client IP address with support for proxy headers.
    Checks X-Forwarded-For and X-Real-IP headers commonly used by reverse proxies.
    """
    # Check proxy headers first
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    # Fallback to direct client IP
    return get_remote_address(request)


# Create limiter instance with custom key function
limiter = Limiter(
    key_func=get_client_ip,
    default_limits=[
        f"{settings.rate_limit_default_per_day} per day",
        f"{settings.rate_limit_default_per_hour} per hour"
    ]
)


# Custom rate limit exceeded handler
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Custom handler for rate limit exceeded errors."""
    content = {"detail": f"Rate limit exceeded: {exc.detail}"}
    headers = {}

    # Safely handle retry_after
    if hasattr(exc, 'retry_after') and exc.retry_after is not None:
        content["retry_after"] = exc.retry_after
        headers["Retry-After"] = str(exc.retry_after)

    response = JSONResponse(
        status_code=429,
        content=content,
        headers=headers
    )
    return response

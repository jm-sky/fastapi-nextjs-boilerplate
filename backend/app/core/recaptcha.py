"""Google reCAPTCHA v3 verification service."""

import logging
from typing import Dict, Any
import httpx

from app.core.settings import settings

logger = logging.getLogger(__name__)


class RecaptchaError(Exception):
    """Exception raised for reCAPTCHA verification errors."""
    pass


async def verify_recaptcha(token: str, action: str = "submit") -> Dict[str, Any]:
    """
    Verify reCAPTCHA token with Google's API.

    Args:
        token: The reCAPTCHA token from the client
        action: The expected action name (should match client-side action)

    Returns:
        Dict containing verification results with keys:
        - success: bool
        - score: float (0.0-1.0)
        - action: str
        - challenge_ts: str
        - hostname: str

    Raises:
        RecaptchaError: If verification fails or score is too low
    """
    # Skip verification if reCAPTCHA is disabled (for development/testing)
    if not settings.recaptcha_enabled:
        logger.debug("reCAPTCHA verification skipped (disabled in settings)")
        return {
            "success": True,
            "score": 1.0,
            "action": action,
            "skipped": True
        }

    if not token:
        raise RecaptchaError("reCAPTCHA token is required")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.recaptcha_verify_url,
                data={
                    "secret": settings.recaptcha_secret_key,
                    "response": token,
                },
                timeout=10.0
            )
            response.raise_for_status()
            result = response.json()

        # Log the result for debugging
        logger.info(
            f"reCAPTCHA verification: success={result.get('success')}, "
            f"score={result.get('score')}, action={result.get('action')}"
        )

        # Check if verification was successful
        if not result.get("success"):
            error_codes = result.get("error-codes", [])
            logger.warning(f"reCAPTCHA verification failed: {error_codes}")
            raise RecaptchaError(f"reCAPTCHA verification failed: {error_codes}")

        # Verify action matches (prevents token reuse across different forms)
        if result.get("action") != action:
            logger.warning(
                f"reCAPTCHA action mismatch: expected '{action}', "
                f"got '{result.get('action')}'"
            )
            raise RecaptchaError("reCAPTCHA action mismatch")

        # Check score threshold
        score = result.get("score", 0.0)
        if score < settings.recaptcha_min_score:
            logger.warning(
                f"reCAPTCHA score too low: {score} < {settings.recaptcha_min_score}"
            )
            raise RecaptchaError(
                f"reCAPTCHA verification failed: score too low ({score})"
            )

        return result

    except httpx.HTTPError as e:
        logger.error(f"reCAPTCHA HTTP error: {e}")
        raise RecaptchaError(f"reCAPTCHA service error: {e}")
    except Exception as e:
        logger.error(f"reCAPTCHA verification error: {e}")
        raise RecaptchaError(f"reCAPTCHA verification error: {e}")

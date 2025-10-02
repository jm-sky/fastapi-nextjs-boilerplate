"""Token blacklist service for JWT invalidation.

This module provides an in-memory token blacklist for development.
For production, consider using Redis for distributed systems.
"""

from datetime import datetime, timezone
from typing import Dict
import threading
import jwt
from app.core.settings import settings


class TokenBlacklist:
    """In-memory token blacklist with automatic cleanup of expired tokens."""

    def __init__(self) -> None:
        # Store token with its expiration timestamp
        self._blacklist: Dict[str, float] = {}
        self._lock = threading.Lock()

    def add(self, token: str) -> None:
        """Add a token to the blacklist with its expiration time."""
        try:
            # Decode token to get expiration time (without verification since it might be expired)
            payload = jwt.decode(
                token,
                settings.security.secret_key,
                algorithms=[settings.security.jwt_algorithm],
                options={"verify_signature": False, "verify_exp": False}
            )
            exp_timestamp = payload.get("exp", 0)

            with self._lock:
                self._blacklist[token] = exp_timestamp
        except Exception:
            # If we can't decode the token, blacklist it with a far future expiration
            # This ensures malformed tokens are still blacklisted
            with self._lock:
                self._blacklist[token] = datetime.now(timezone.utc).timestamp() + 86400  # 24h

    def is_blacklisted(self, token: str) -> bool:
        """Check if a token is blacklisted."""
        with self._lock:
            return token in self._blacklist

    def remove(self, token: str) -> None:
        """Remove a token from the blacklist."""
        with self._lock:
            self._blacklist.pop(token, None)

    def cleanup_expired(self) -> int:
        """Remove expired tokens from the blacklist. Returns count of removed tokens."""
        current_time = datetime.now(timezone.utc).timestamp()
        removed_count = 0

        with self._lock:
            expired_tokens = [
                token for token, exp_time in self._blacklist.items()
                if exp_time < current_time
            ]
            for token in expired_tokens:
                del self._blacklist[token]
                removed_count += 1

        return removed_count

    def clear(self) -> None:
        """Clear all tokens from the blacklist."""
        with self._lock:
            self._blacklist.clear()

    def size(self) -> int:
        """Get the number of blacklisted tokens."""
        with self._lock:
            return len(self._blacklist)


# Global blacklist instance
token_blacklist = TokenBlacklist()


def cleanup_blacklist_periodically() -> None:
    """Background task to cleanup expired tokens periodically."""
    import time
    import logging

    logger = logging.getLogger(__name__)

    while True:
        try:
            time.sleep(3600)  # Run every hour
            removed = token_blacklist.cleanup_expired()
            if removed > 0:
                logger.info(f"Cleaned up {removed} expired tokens from blacklist")
        except Exception as e:
            logger.error(f"Error cleaning up blacklist: {e}")

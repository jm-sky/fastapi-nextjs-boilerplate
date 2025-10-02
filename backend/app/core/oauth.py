"""OAuth client configuration for Google authentication."""

from authlib.integrations.starlette_client import OAuth  # type: ignore[import-untyped]
from app.core.settings import settings

# Initialize OAuth client
oauth = OAuth()

# Google OpenID discovery endpoint
GOOGLE_CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'

# Register Google OAuth provider
oauth.register(
    name='google',
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url=GOOGLE_CONF_URL,
    client_kwargs={
        'scope': 'openid email profile',
        'prompt': 'select_account',  # Force account selection for better UX
    }
)

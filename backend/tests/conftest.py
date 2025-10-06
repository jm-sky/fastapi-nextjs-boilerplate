import os
import pytest
from fastapi.testclient import TestClient

from app.core.factory import create_app
from app.core.settings import Settings
from app.models.user import UserStore

# Set environment variables for tests BEFORE importing any app modules
os.environ["AUTH_REGISTER_RATE_LIMIT"] = "100000/minute"
os.environ["AUTH_LOGIN_RATE_LIMIT"] = "100000/minute"
os.environ["AUTH_REFRESH_RATE_LIMIT"] = "100000/minute"
os.environ["AUTH_PASSWORD_CHANGE_RATE_LIMIT"] = "100000/minute"
os.environ["RATE_LIMIT_DEFAULT_PER_DAY"] = "100000"
os.environ["RATE_LIMIT_DEFAULT_PER_HOUR"] = "100000"


@pytest.fixture
def test_settings():
    """Test settings."""
    return Settings(
        app_name="Test SaaS Boilerplate API",
        debug=True,
        secret_key="test-secret-key-for-testing-only-12345678",
        cors_origins=["http://localhost:3000"],
        # Disable rate limiting for tests (very high limits)
        auth_register_rate_limit="100000/minute",
        auth_login_rate_limit="100000/minute",
        auth_refresh_rate_limit="100000/minute",
        auth_password_change_rate_limit="100000/minute"
    )


@pytest.fixture
def clean_user_store():
    """Clean user store for isolated tests."""
    store = UserStore()
    return store


@pytest.fixture
def test_app(test_settings):
    """Create test FastAPI app."""
    app = create_app(test_settings)
    return app


@pytest.fixture
def client(test_app):
    """Test client."""
    return TestClient(test_app)


@pytest.fixture
def test_user_data():
    """Common test user data."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",  # Meets password requirements: uppercase, lowercase, digit, special char
        "name": "Test User"
    }

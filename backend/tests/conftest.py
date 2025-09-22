import pytest
from fastapi.testclient import TestClient

from app.core.factory import create_app
from app.core.settings import Settings
from app.models.user import UserStore


@pytest.fixture
def test_settings():
    """Test settings."""
    return Settings(
        app_name="Test SaaS Boilerplate API",
        debug=True,
        secret_key="test-secret-key-for-testing-only-12345678",
        cors_origins=["http://localhost:3000"],
        # Increase rate limiting for tests
        auth_register_rate_limit="1000/minute",
        auth_login_rate_limit="1000/minute",
        auth_refresh_rate_limit="1000/minute"
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
        "password": "testpassword123",
        "name": "Test User"
    }
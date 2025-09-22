import pytest
from datetime import datetime

from app.core.auth import create_access_token, verify_token, get_password_hash, verify_password
from app.models.user import User
from app.core.exceptions import UserAlreadyExistsError


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_password_hashing(self):
        """Test password hashing."""
        password = "testpassword123"
        hashed = get_password_hash(password)

        assert hashed != password
        assert len(hashed) > 0

    def test_password_verification_success(self):
        """Test successful password verification."""
        password = "testpassword123"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_password_verification_failure(self):
        """Test failed password verification."""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)

        assert verify_password(wrong_password, hashed) is False


class TestJWTTokens:
    """Test JWT token creation and verification."""

    def test_create_access_token(self, test_settings):
        """Test access token creation."""
        user_id = "01ARZ3NDEKTSV4RRFFQ69G5FAV"
        data = {"sub": user_id}

        # Mock settings
        import app.core.auth
        original_settings = app.core.auth.settings
        app.core.auth.settings = test_settings

        try:
            token = create_access_token(data)
            assert isinstance(token, str)
            assert len(token) > 0
        finally:
            app.core.auth.settings = original_settings

    def test_verify_valid_token(self, test_settings):
        """Test valid token verification."""
        user_id = "01ARZ3NDEKTSV4RRFFQ69G5FAV"
        data = {"sub": user_id}

        # Mock settings
        import app.core.auth
        original_settings = app.core.auth.settings
        app.core.auth.settings = test_settings

        try:
            token = create_access_token(data)
            payload = verify_token(token)
            assert payload["sub"] == user_id
        finally:
            app.core.auth.settings = original_settings

    def test_verify_invalid_token(self, test_settings):
        """Test invalid token verification."""
        invalid_token = "invalid.token.here"

        # Mock settings
        import app.core.auth
        original_settings = app.core.auth.settings
        app.core.auth.settings = test_settings

        try:
            with pytest.raises(Exception):
                verify_token(invalid_token)
        finally:
            app.core.auth.settings = original_settings


class TestUserStore:
    """Test user store operations."""

    def test_create_user(self, clean_user_store):
        """Test user creation."""
        user = clean_user_store.create_user(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )

        assert isinstance(user, User)
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.isActive is True
        assert isinstance(user.createdAt, datetime)

    def test_create_duplicate_user_raises_error(self, clean_user_store):
        """Test that creating duplicate user raises error."""
        clean_user_store.create_user(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )

        with pytest.raises(UserAlreadyExistsError):
            clean_user_store.create_user(
                email="test@example.com",
                password="anotherpassword",
                full_name="Another User"
            )

    def test_get_user_by_email(self, clean_user_store):
        """Test getting user by email."""
        created_user = clean_user_store.create_user(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )

        found_user = clean_user_store.get_user_by_email("test@example.com")
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == created_user.email

    def test_get_user_by_email_case_insensitive(self, clean_user_store):
        """Test case-insensitive email lookup."""
        created_user = clean_user_store.create_user(
            email="Test@Example.com",
            password="testpassword123",
            full_name="Test User"
        )

        # Should find user with different case
        found_user = clean_user_store.get_user_by_email("TEST@EXAMPLE.COM")
        assert found_user is not None
        assert found_user.id == created_user.id

    def test_get_user_by_id(self, clean_user_store):
        """Test getting user by ID."""
        created_user = clean_user_store.create_user(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )

        found_user = clean_user_store.get_user_by_id(created_user.id)
        assert found_user is not None
        assert found_user.id == created_user.id

    def test_get_nonexistent_user_returns_none(self, clean_user_store):
        """Test getting non-existent user returns None."""
        user = clean_user_store.get_user_by_email("nonexistent@example.com")
        assert user is None

        user = clean_user_store.get_user_by_id("nonexistent-id")
        assert user is None


class TestUserModel:
    """Test User model methods."""

    def test_verify_password_success(self, clean_user_store):
        """Test successful password verification."""
        user = clean_user_store.create_user(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )

        assert user.verify_password("testpassword123") is True

    def test_verify_password_failure(self, clean_user_store):
        """Test failed password verification."""
        user = clean_user_store.create_user(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )

        assert user.verify_password("wrongpassword") is False

    def test_to_response(self, clean_user_store):
        """Test user response format."""
        user = clean_user_store.create_user(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )

        response = user.to_response()
        expected_keys = {"id", "email", "name", "isActive", "createdAt"}

        assert set(response.keys()) == expected_keys
        assert "hashedPassword" not in response  # Should not include password
        assert response["email"] == "test@example.com"
        assert response["name"] == "Test User"
        assert response["isActive"] is True
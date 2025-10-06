from unittest.mock import patch



class TestAuthAPI:
    """Test authentication API endpoints."""

    def test_register_success(self, client, test_user_data):
        """Test successful user registration."""
        # Clear the user store first
        with patch('app.models.user.user_store._users', {}), \
             patch('app.models.user.user_store._email_index', {}):

            response = client.post("/auth/register", json=test_user_data)

            assert response.status_code == 201
            data = response.json()

            assert "accessToken" in data
            assert "refreshToken" in data
            assert "user" in data

            user = data["user"]
            assert user["email"] == test_user_data["email"]
            assert user["name"] == test_user_data["name"]
            assert user["isActive"] is True
            assert "hashedPassword" not in user

    def test_register_duplicate_email(self, client, test_user_data):
        """Test registration with duplicate email."""
        # Clear and register first user
        with patch('app.models.user.user_store._users', {}), \
             patch('app.models.user.user_store._email_index', {}):

            # First registration
            response1 = client.post("/auth/register", json=test_user_data)
            assert response1.status_code == 201

            # Second registration with same email
            response2 = client.post("/auth/register", json=test_user_data)
            assert response2.status_code == 409  # Conflict
            assert "already exists" in response2.json()["detail"]

    def test_register_invalid_data(self, client):
        """Test registration with invalid data."""
        invalid_data = {
            "email": "invalid-email",
            "password": "short",
            "name": ""
        }

        response = client.post("/auth/register", json=invalid_data)
        assert response.status_code == 422

    def test_login_success(self, client, test_user_data):
        """Test successful login."""
        # Clear and register user first
        with patch('app.models.user.user_store._users', {}), \
             patch('app.models.user.user_store._email_index', {}):

            # Register user
            register_response = client.post("/auth/register", json=test_user_data)
            assert register_response.status_code == 201

            # Login
            login_data = {
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            }

            response = client.post("/auth/login", json=login_data)
            assert response.status_code == 200

            data = response.json()
            assert "accessToken" in data
            assert "refreshToken" in data
            assert "user" in data

            user = data["user"]
            assert user["email"] == test_user_data["email"]

    def test_login_invalid_credentials(self, client, test_user_data):
        """Test login with invalid credentials."""
        # Clear and register user first
        with patch('app.models.user.user_store._users', {}), \
             patch('app.models.user.user_store._email_index', {}):

            # Register user
            register_response = client.post("/auth/register", json=test_user_data)
            assert register_response.status_code == 201

            # Login with wrong password
            login_data = {
                "email": test_user_data["email"],
                "password": "wrongpassword"
            }

            response = client.post("/auth/login", json=login_data)
            assert response.status_code == 401
            assert "Incorrect email or password" in response.json()["detail"]

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        with patch('app.models.user.user_store._users', {}), \
             patch('app.models.user.user_store._email_index', {}):

            login_data = {
                "email": "nonexistent@example.com",
                "password": "password123"
            }

            response = client.post("/auth/login", json=login_data)
            assert response.status_code == 401
            assert "Incorrect email or password" in response.json()["detail"]

    def test_get_current_user_success(self, client, test_user_data):
        """Test getting current user with valid token."""
        # Clear and register user first
        with patch('app.models.user.user_store._users', {}), \
             patch('app.models.user.user_store._email_index', {}):

            # Register and login
            register_response = client.post("/auth/register", json=test_user_data)
            assert register_response.status_code == 201

            token = register_response.json()["accessToken"]

            # Get current user
            headers = {"Authorization": f"Bearer {token}"}
            response = client.get("/auth/me", headers=headers)

            assert response.status_code == 200
            data = response.json()

            assert data["email"] == test_user_data["email"]
            assert data["name"] == test_user_data["name"]
            assert "hashedPassword" not in data

    def test_get_current_user_no_token(self, client):
        """Test getting current user without token."""
        response = client.get("/auth/me")
        assert response.status_code == 403  # HTTPBearer returns 403 when credentials are missing

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 401

    def test_logout_success(self, client, test_user_data):
        """Test successful logout."""
        # Clear and register user first
        with patch('app.models.user.user_store._users', {}), \
             patch('app.models.user.user_store._email_index', {}):

            # Register and login
            register_response = client.post("/auth/register", json=test_user_data)
            assert register_response.status_code == 201

            token = register_response.json()["accessToken"]

            # Logout
            headers = {"Authorization": f"Bearer {token}"}
            response = client.post("/auth/logout", headers=headers)

            assert response.status_code == 200
            assert response.json()["message"] == "Successfully logged out"

    def test_logout_no_token(self, client):
        """Test logout without token."""
        response = client.post("/auth/logout")
        assert response.status_code == 403  # HTTPBearer returns 403 when credentials are missing

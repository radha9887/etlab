"""
API tests for app/routers/auth.py
"""
import pytest


@pytest.mark.asyncio
class TestAuthRegister:
    """Tests for POST /api/auth/register."""

    async def test_register_success(self, client):
        """Test successful user registration."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "securepassword123",
                "name": "New User"
            }
        )

        assert response.status_code == 201
        data = response.json()

        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        assert data["user"]["email"] == "newuser@example.com"
        assert data["user"]["name"] == "New User"
        assert "password" not in data["user"]
        assert "password_hash" not in data["user"]

    async def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email fails."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",  # Same as test_user
                "password": "anotherpassword",
                "name": "Another User"
            }
        )

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    async def test_register_invalid_email(self, client):
        """Test registration with invalid email fails."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "not-an-email",
                "password": "password123",
                "name": "Test User"
            }
        )

        assert response.status_code == 422  # Validation error

    async def test_register_missing_fields(self, client):
        """Test registration with missing fields fails."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com"
                # Missing password and name
            }
        )

        assert response.status_code == 422


@pytest.mark.asyncio
class TestAuthLogin:
    """Tests for POST /api/auth/login."""

    async def test_login_success(self, client, test_user):
        """Test successful login."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": test_user["password"]
            }
        )

        assert response.status_code == 200
        data = response.json()

        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@example.com"

    async def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )

        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    async def test_login_nonexistent_user(self, client):
        """Test login with non-existent user fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "anypassword"
            }
        )

        assert response.status_code == 401

    async def test_login_missing_fields(self, client):
        """Test login with missing fields fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com"
                # Missing password
            }
        )

        assert response.status_code == 422


@pytest.mark.asyncio
class TestAuthRefresh:
    """Tests for POST /api/auth/refresh."""

    async def test_refresh_token_success(self, client, test_user):
        """Test successful token refresh."""
        response = await client.post(
            "/api/auth/refresh",
            json={
                "refresh_token": test_user["refresh_token"]
            }
        )

        assert response.status_code == 200
        data = response.json()

        assert "access_token" in data
        # Verify token is a valid JWT format (header.payload.signature)
        assert len(data["access_token"].split(".")) == 3

    async def test_refresh_token_invalid(self, client):
        """Test refresh with invalid token fails."""
        response = await client.post(
            "/api/auth/refresh",
            json={
                "refresh_token": "invalid.token.here"
            }
        )

        assert response.status_code == 401

    async def test_refresh_with_access_token_fails(self, client, test_user):
        """Test refresh with access token (wrong type) fails."""
        response = await client.post(
            "/api/auth/refresh",
            json={
                "refresh_token": test_user["access_token"]  # Using access token instead
            }
        )

        assert response.status_code == 401


@pytest.mark.asyncio
class TestAuthMe:
    """Tests for GET /api/auth/me."""

    async def test_get_me_authenticated(self, client, auth_headers):
        """Test getting current user when authenticated."""
        response = await client.get(
            "/api/auth/me",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        assert "email" in data
        assert "name" in data
        assert "id" in data
        assert data["email"] == "test@example.com"

    async def test_get_me_unauthenticated(self, client):
        """Test getting current user without auth fails."""
        response = await client.get("/api/auth/me")

        assert response.status_code == 401

    async def test_get_me_invalid_token(self, client):
        """Test getting current user with invalid token fails."""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid.token"}
        )

        assert response.status_code == 401


@pytest.mark.asyncio
class TestAuthUpdateMe:
    """Tests for PUT /api/auth/me."""

    async def test_update_me_name(self, client, auth_headers):
        """Test updating current user's name."""
        response = await client.put(
            "/api/auth/me",
            headers=auth_headers,
            json={"name": "Updated Name"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"

    async def test_update_me_avatar(self, client, auth_headers):
        """Test updating current user's avatar."""
        response = await client.put(
            "/api/auth/me",
            headers=auth_headers,
            json={"avatar_url": "https://example.com/avatar.png"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["avatar_url"] == "https://example.com/avatar.png"

    async def test_update_me_unauthenticated(self, client):
        """Test updating user without auth fails."""
        response = await client.put(
            "/api/auth/me",
            json={"name": "New Name"}
        )

        assert response.status_code == 401


@pytest.mark.asyncio
class TestAuthLogout:
    """Tests for POST /api/auth/logout."""

    async def test_logout_success(self, client, auth_headers):
        """Test successful logout."""
        response = await client.post(
            "/api/auth/logout",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_logout_unauthenticated(self, client):
        """Test logout without auth fails."""
        response = await client.post("/api/auth/logout")

        assert response.status_code == 401

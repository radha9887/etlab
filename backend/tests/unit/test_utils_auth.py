"""
Unit tests for app/utils/auth.py
"""
import pytest
from datetime import timedelta, datetime, timezone
from unittest.mock import patch
import time


class TestPasswordHashing:
    """Tests for password hashing functions."""

    def test_hash_password(self):
        """Test that password hashing produces a hash."""
        from app.utils.auth import hash_password

        password = "mysecretpassword"
        hashed = hash_password(password)

        assert hashed is not None
        assert hashed != password
        assert len(hashed) > 20  # bcrypt hashes are long
        assert hashed.startswith("$2b$")  # bcrypt prefix

    def test_hash_password_different_each_time(self):
        """Test that hashing same password produces different hashes (salt)."""
        from app.utils.auth import hash_password

        password = "mysecretpassword"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2  # Different salts

    def test_verify_password_correct(self):
        """Test that correct password verifies successfully."""
        from app.utils.auth import hash_password, verify_password

        password = "mysecretpassword"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test that incorrect password fails verification."""
        from app.utils.auth import hash_password, verify_password

        password = "mysecretpassword"
        hashed = hash_password(password)

        assert verify_password("wrongpassword", hashed) is False

    def test_verify_password_empty(self):
        """Test verification with empty password."""
        from app.utils.auth import hash_password, verify_password

        password = "mysecretpassword"
        hashed = hash_password(password)

        assert verify_password("", hashed) is False


class TestJWTTokens:
    """Tests for JWT token functions."""

    def test_create_access_token(self):
        """Test creating an access token."""
        from app.utils.auth import create_access_token, decode_token

        data = {"sub": "user123"}
        token = create_access_token(data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 50  # JWT tokens are long

        # Decode and verify
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["type"] == "access"
        assert "exp" in payload

    def test_create_access_token_with_custom_expiry(self):
        """Test creating access token with custom expiry."""
        from app.utils.auth import create_access_token, decode_token

        data = {"sub": "user123"}
        expires = timedelta(hours=1)
        token = create_access_token(data, expires_delta=expires)

        payload = decode_token(token)
        assert payload is not None

        # Check expiry is approximately 1 hour from now
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        diff = exp_time - now

        assert 3500 < diff.total_seconds() < 3700  # ~1 hour

    def test_create_refresh_token(self):
        """Test creating a refresh token."""
        from app.utils.auth import create_refresh_token, decode_token

        data = {"sub": "user123"}
        token = create_refresh_token(data)

        assert token is not None
        assert isinstance(token, str)

        # Decode and verify
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["type"] == "refresh"
        assert "exp" in payload

    def test_decode_token_valid(self):
        """Test decoding a valid token."""
        from app.utils.auth import create_access_token, decode_token

        data = {"sub": "user123", "role": "admin"}
        token = create_access_token(data)

        payload = decode_token(token)

        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["role"] == "admin"

    def test_decode_token_invalid(self):
        """Test decoding an invalid token returns None."""
        from app.utils.auth import decode_token

        invalid_token = "not.a.valid.jwt.token"
        payload = decode_token(invalid_token)

        assert payload is None

    def test_decode_token_tampered(self):
        """Test decoding a tampered token returns None."""
        from app.utils.auth import create_access_token, decode_token

        token = create_access_token({"sub": "user123"})
        # Tamper with the token
        tampered = token[:-5] + "XXXXX"

        payload = decode_token(tampered)
        assert payload is None

    def test_decode_token_expired(self):
        """Test decoding an expired token returns None."""
        from app.utils.auth import create_access_token, decode_token

        # Create token that expires in -1 seconds (already expired)
        data = {"sub": "user123"}
        expires = timedelta(seconds=-1)
        token = create_access_token(data, expires_delta=expires)

        # Small delay to ensure expiry
        time.sleep(0.1)

        payload = decode_token(token)
        assert payload is None

    def test_access_and_refresh_tokens_different(self):
        """Test that access and refresh tokens are different."""
        from app.utils.auth import create_access_token, create_refresh_token

        data = {"sub": "user123"}
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)

        assert access_token != refresh_token


class TestShareToken:
    """Tests for share token generation."""

    def test_generate_share_token(self):
        """Test generating a share token."""
        from app.utils.auth import generate_share_token

        token = generate_share_token()

        assert token is not None
        assert isinstance(token, str)
        assert len(token) >= 32  # URL-safe base64 of 32 bytes

    def test_generate_share_token_unique(self):
        """Test that share tokens are unique."""
        from app.utils.auth import generate_share_token

        tokens = [generate_share_token() for _ in range(100)]
        unique_tokens = set(tokens)

        assert len(unique_tokens) == 100  # All should be unique

    def test_generate_share_token_url_safe(self):
        """Test that share tokens are URL-safe."""
        from app.utils.auth import generate_share_token

        token = generate_share_token()

        # URL-safe characters only
        import re
        assert re.match(r'^[A-Za-z0-9_-]+$', token)

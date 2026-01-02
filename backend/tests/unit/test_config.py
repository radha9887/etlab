"""
Unit tests for app/config.py
"""
import pytest
import os
from unittest.mock import patch


class TestSettings:
    """Tests for Settings configuration."""

    def test_default_settings(self):
        """Test that default settings are loaded correctly."""
        # Clear cache to get fresh settings
        from app.config import get_settings
        get_settings.cache_clear()

        settings = get_settings()

        assert settings.app_name == "ETLab"
        assert settings.app_env in ["development", "testing"]
        assert settings.debug is False
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000

    def test_database_url_default(self):
        """Test default database URL."""
        from app.config import get_settings
        get_settings.cache_clear()

        settings = get_settings()

        # Default is SQLite
        assert "sqlite" in settings.database_url or settings.database_url.startswith("sqlite")

    def test_cors_origins_default(self):
        """Test default CORS origins."""
        from app.config import get_settings
        get_settings.cache_clear()

        settings = get_settings()

        assert settings.cors_origins is not None
        assert len(settings.cors_origins) > 0

    def test_spark_defaults(self):
        """Test Spark configuration defaults."""
        from app.config import get_settings
        get_settings.cache_clear()

        settings = get_settings()

        assert settings.spark_master == "local[*]"
        assert settings.spark_app_name == "ETLab"
        assert settings.spark_driver_memory == "2g"
        assert settings.spark_executor_memory == "2g"

    def test_jwt_settings(self):
        """Test JWT configuration."""
        from app.config import get_settings
        get_settings.cache_clear()

        settings = get_settings()

        assert settings.jwt_algorithm == "HS256"
        assert settings.access_token_expire_minutes > 0
        assert settings.refresh_token_expire_days > 0
        assert settings.jwt_secret_key is not None

    def test_optional_settings_none_by_default(self):
        """Test that optional settings are None by default."""
        from app.config import get_settings
        get_settings.cache_clear()

        settings = get_settings()

        # Livy is optional
        assert settings.livy_url is None

        # Databricks is optional
        assert settings.databricks_host is None
        assert settings.databricks_token is None
        assert settings.databricks_cluster_id is None

    def test_settings_from_env(self):
        """Test that settings can be loaded from environment variables."""
        from app.config import Settings

        # Create settings with env override
        with patch.dict(os.environ, {
            "APP_NAME": "Test App",
            "APP_ENV": "production",
            "PORT": "9000",
        }):
            settings = Settings()

            assert settings.app_name == "Test App"
            assert settings.app_env == "production"
            assert settings.port == 9000

    def test_settings_cached(self):
        """Test that get_settings returns cached instance."""
        from app.config import get_settings
        get_settings.cache_clear()

        settings1 = get_settings()
        settings2 = get_settings()

        assert settings1 is settings2  # Same instance

    def test_log_level_default(self):
        """Test default log level."""
        from app.config import get_settings
        get_settings.cache_clear()

        settings = get_settings()

        assert settings.log_level in ["INFO", "DEBUG", "WARNING", "ERROR"]


class TestSettingsValidation:
    """Tests for settings validation."""

    def test_port_as_integer(self):
        """Test that port is converted to integer."""
        from app.config import Settings

        with patch.dict(os.environ, {"PORT": "8080"}):
            settings = Settings()
            assert settings.port == 8080
            assert isinstance(settings.port, int)

    def test_debug_as_boolean(self):
        """Test that debug is converted to boolean."""
        from app.config import Settings

        with patch.dict(os.environ, {"DEBUG": "true"}):
            settings = Settings()
            assert settings.debug is True

        with patch.dict(os.environ, {"DEBUG": "false"}):
            settings = Settings()
            assert settings.debug is False

    def test_access_token_expire_as_integer(self):
        """Test that access token expire is converted to integer."""
        from app.config import Settings

        with patch.dict(os.environ, {"ACCESS_TOKEN_EXPIRE_MINUTES": "60"}):
            settings = Settings()
            assert settings.access_token_expire_minutes == 60
            assert isinstance(settings.access_token_expire_minutes, int)

from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache
import secrets
import warnings


# Generate a random secret for development (regenerated on each restart)
_DEFAULT_DEV_SECRET = secrets.token_urlsafe(32)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "ETLab"
    app_env: str = "development"
    debug: bool = False
    log_level: str = "INFO"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/etlab.db"

    # Spark defaults
    spark_master: str = "local[*]"
    spark_app_name: str = "ETLab"
    spark_driver_memory: str = "2g"
    spark_executor_memory: str = "2g"

    # Livy (optional)
    livy_url: Optional[str] = None

    # Databricks (optional)
    databricks_host: Optional[str] = None
    databricks_token: Optional[str] = None
    databricks_cluster_id: Optional[str] = None

    # CORS
    cors_origins: str = "*"

    # JWT Authentication - No insecure default, uses random dev secret
    jwt_secret_key: str = _DEFAULT_DEV_SECRET
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    settings = Settings()

    # Warn if using auto-generated dev secret
    if settings.jwt_secret_key == _DEFAULT_DEV_SECRET:
        warnings.warn(
            "JWT_SECRET_KEY not set. Using auto-generated secret. "
            "Sessions will be invalidated on server restart. "
            "Set JWT_SECRET_KEY in .env for production.",
            UserWarning
        )

    return settings

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinCore"
    PROJECT_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database Settings
    DB_USER: str = Field(default="root", alias="DB_USER")
    DB_PASSWORD: str = Field(default="Sai5678", alias="DB_PASSWORD")
    DB_HOST: str = Field(default="localhost", alias="DB_HOST")
    DB_PORT: int = Field(default=3306, alias="DB_PORT")
    DB_NAME: str = Field(default="fincore_db", alias="DB_NAME")
    DATABASE_URL: str = Field(
        default="mysql+pymysql://root:Sai5678@localhost:3306/fincore_db?charset=utf8mb4",
        alias="DATABASE_URL"
    )

    # JWT & Security
    SECRET_KEY: str = Field(
        default="fincore-super-secure-jwt-key-2026-production-ready-32-chars",
        alias="SECRET_KEY"
    )
    JWT_SECRET: str = Field(
        default="fincore-jwt-token-secret-signature-2026-financial-suite-32chars",
        alias="JWT_SECRET"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Frontend CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_PORT: int = 8000

    # Google OAuth Architecture
    GOOGLE_CLIENT_ID: str = Field(default="", alias="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="", alias="GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = "http://localhost:5173/auth/google/callback"

    # SMTP / OTP Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com", alias="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, alias="SMTP_PORT")
    SMTP_USERNAME: str = Field(default="vsktupakula05@gmail.com", alias="SMTP_USERNAME")
    SMTP_PASSWORD: str = Field(default="weyqzqvfslwbeutr", alias="SMTP_PASSWORD")
    SMTP_FROM_NAME: str = "FinCore Banking Security"
    DEV_OTP_MODE: bool = True

    # Real SMS Gateway Configurations (Fast2SMS for India, Twilio Global)
    FAST2SMS_API_KEY: str = Field(default="", alias="FAST2SMS_API_KEY")
    TWILIO_ACCOUNT_SID: str = Field(default="", alias="TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = Field(default="", alias="TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: str = Field(default="", alias="TWILIO_PHONE_NUMBER")

    # HTTPS Email Relay Configurations for Cloud Hosts with blocked SMTP ports (e.g. Render Free Tier)
    EMAIL_HTTP_GATEWAY_URL: str = Field(default="", alias="EMAIL_HTTP_GATEWAY_URL")
    BREVO_API_KEY: str = Field(default="", alias="BREVO_API_KEY")
    RESEND_API_KEY: str = Field(default="", alias="RESEND_API_KEY")


    # Payment Gateway Sandbox Configuration
    PAYMENT_PROVIDER: str = "sandbox"
    PAYMENT_PROVIDER_KEY: str = Field(default="rzp_test_mock_key", alias="PAYMENT_PROVIDER_KEY")
    PAYMENT_PROVIDER_SECRET: str = Field(default="rzp_test_mock_secret", alias="PAYMENT_PROVIDER_SECRET")

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    email: str
    full_name: str
    finance_company_id: int
    finance_company_name: Optional[str] = None

class CustomerRegisterRequest(BaseModel):
    finance_company_id: int
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = "India"

class CustomerLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    email: str
    purpose: str = "REGISTRATION"  # REGISTRATION or PASSWORD_RESET

class OTPVerifyRequest(BaseModel):
    email: str
    otp_code: str
    purpose: str = "REGISTRATION"

class GmailOTPRequest(BaseModel):
    email: EmailStr
    role: str = "customer"  # customer or admin

class GmailOTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str
    role: str = "customer"  # customer or admin

class MobileOTPRequest(BaseModel):
    phone_number: str
    role: str = "customer"  # customer or admin

class MobileOTPVerifyRequest(BaseModel):
    phone_number: str
    otp_code: str
    role: str = "customer"  # customer or admin

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    google_id: Optional[str] = None
    role: str = "customer"  # customer or admin
    finance_company_id: Optional[int] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

class OAuthLoginRequest(BaseModel):
    provider: str = "google"
    token: str
    finance_company_id: Optional[int] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

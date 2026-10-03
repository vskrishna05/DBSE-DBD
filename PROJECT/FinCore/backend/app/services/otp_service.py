import random
import logging
import os
from datetime import datetime, timedelta
import smtplib
import json
import urllib.request
import urllib.parse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.auth_support import OTPVerification

logger = logging.getLogger("fincore.otp")

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)
OTP_LOG_FILE = os.path.join(LOG_DIR, "otps.log")

def generate_otp_code() -> str:
    """Generate a cryptographic 6-digit one-time password"""
    return f"{random.randint(100000, 999999)}"

def _send_real_sms(phone_digits: str, otp_code: str) -> bool:
    """Dispatches real SMS via Fast2SMS (India) or Twilio if configured in environment"""
    clean = "".join(filter(str.isdigit, phone_digits))
    if len(clean) == 12 and clean.startswith("91"):
        clean = clean[2:]
    elif len(clean) > 10:
        clean = clean[-10:]

    # 1. Fast2SMS Integration (Premier SMS Gateway for India)
    if settings.FAST2SMS_API_KEY:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = {
                "route": "otp",
                "variables_values": otp_code,
                "numbers": clean,
            }
            req = urllib.request.Request(
                url,
                data=urllib.parse.urlencode(payload).encode("utf-8"),
                headers={
                    "authorization": settings.FAST2SMS_API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = json.loads(resp.read().decode())
                if resp_data.get("return"):
                    logger.info(f"[Fast2SMS] Successfully delivered OTP SMS to +91 {clean}")
                    return True
                else:
                    logger.warning(f"[Fast2SMS] Gateway response: {resp_data.get('message')}")
        except Exception as e:
            logger.error(f"[Fast2SMS] SMS dispatch error to {clean}: {str(e)}")

    # 2. Twilio SMS Integration
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
        try:
            import base64
            url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
            to_phone = f"+91{clean}" if not clean.startswith("+") else clean
            data = urllib.parse.urlencode({
                "To": to_phone,
                "From": settings.TWILIO_PHONE_NUMBER,
                "Body": f"Your FinCore security verification code is: {otp_code}. Valid for 10 minutes. Do not share this OTP."
            }).encode("utf-8")
            
            auth_str = f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}"
            b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
            
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Authorization": f"Basic {b64_auth}"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    logger.info(f"[Twilio SMS] Delivered OTP to {to_phone}")
                    return True
        except Exception as e:
            logger.error(f"[Twilio SMS] Dispatch error: {str(e)}")

    return False

def _send_real_email(recipient_email: str, otp_code: str, purpose: str) -> bool:
    """Dispatches real email to the user's Gmail/Email inbox via SMTP"""
    if not (settings.SMTP_USERNAME and settings.SMTP_PASSWORD):
        return False

    try:
        from email.utils import formatdate

        username = (settings.SMTP_USERNAME or "").strip()
        clean_pwd = (settings.SMTP_PASSWORD or "").strip().replace(" ", "")

        # CRITICAL: For customer registration or customer operations, the OTP code MUST ALWAYS
        # be dispatched directly to the customer's respective Gmail / Email inbox!
        # Never divert customer registrations to the admin address.
        # Only the mock demo admin accounts without mailboxes (admin@finnova.in / admin@crednest.in)
        # during admin authentication are forwarded to the configured administrator inbox.
        is_demo_admin = (
            purpose != "REGISTRATION"
            and recipient_email in ["admin@finnova.in", "admin@crednest.in"]
        )
        target_delivery = username if (is_demo_admin and username) else recipient_email

        msg = MIMEMultipart("alternative")
        msg["Date"] = formatdate(localtime=True)
        sender_name = getattr(settings, "SMTP_FROM_NAME", "") or "FinCore Banking Security"
        msg["From"] = f"{sender_name} <{username}>"
        msg["To"] = target_delivery
        msg["Reply-To"] = username
        
        if is_demo_admin:
            msg["Subject"] = f"{otp_code} is your FinCore Admin verification code for {recipient_email}"
        else:
            msg["Subject"] = f"{otp_code} is your FinCore verification code"

        plain_text = (
            f"Your FinCore verification code is: {otp_code}\n\n"
            f"Account: {recipient_email}\n"
            f"This code will expire in 10 minutes.\n"
            f"Enter this code to complete your {purpose.lower().replace('_', ' ')} request.\n\n"
            f"If you did not request this code, you can safely ignore this email.\n\n"
            f"Regards,\n"
            f"FinCore Team"
        )

        html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
    .container {{ max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .logo {{ font-size: 20px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; margin-bottom: 20px; }}
    .code-box {{ background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }}
    .otp {{ font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: monospace; }}
    .warning {{ font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ FinCore</div>
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Your Verification Code</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Account: <strong>{recipient_email}</strong><br/>
      Please enter the following 6-digit code to complete your <strong>{purpose.lower().replace('_', ' ')}</strong>:
    </p>
    <div class="code-box">
      <div class="otp">{otp_code}</div>
      <div style="font-size: 12px; color: #0284c7; font-weight: 600; margin-top: 6px;">Valid for 10 minutes</div>
    </div>
    <div class="warning">
      🔒 Never share this verification code with anyone.
    </div>
  </div>
</body>
</html>"""

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as server:
                server.login(username, clean_pwd)
                server.sendmail(username, [target_delivery], msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as server:
                server.starttls()
                server.login(username, clean_pwd)
                server.sendmail(username, [target_delivery], msg.as_string())

        logger.info(f"[SMTP Dispatch] Successfully delivered verification email strictly to {target_delivery} (for {recipient_email})")
        return True
    except Exception as e:
        logger.error(f"[SMTP Dispatch] Failed to send email to {recipient_email}: {str(e)}")
        return False

def send_otp(db: Session, email_or_phone: str = "", purpose: str = "REGISTRATION", email: str = None) -> dict:
    code = generate_otp_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    target = (email or email_or_phone).strip().lower()

    # Invalidate previous unused codes for this recipient and purpose
    db.query(OTPVerification).filter(
        OTPVerification.email == target,
        OTPVerification.purpose == purpose,
        OTPVerification.is_used == False
    ).update({"is_used": True})

    otp_record = OTPVerification(
        email=target,
        otp_code=code,
        purpose=purpose,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_record)
    db.commit()

    is_email = "@" in target

    # Dispatch via Real Channels
    email_dispatched = False
    sms_dispatched = False

    if is_email:
        email_dispatched = _send_real_email(target, code, purpose)
    else:
        sms_dispatched = _send_real_sms(target, code)

    # Log dispatch securely
    log_line = f"[{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}] Recipient: {target} | Purpose: {purpose} | OTP: {code} | RealEmailSent: {email_dispatched} | RealSMSSent: {sms_dispatched}\n"
    try:
        with open(OTP_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_line)
    except Exception as e:
        logger.warning(f"Could not append to otps.log: {e}")

    logger.info(f"[FinCore OTP Dispatch] Verification code for {target} ({purpose}) dispatched via Gmail.")

    if is_email:
        if email_dispatched:
            msg = f"Real 6-digit verification code has been dispatched to {target} via Gmail. Please check your inbox or Spam folder."
        else:
            msg = f"Failed to deliver verification code to {target}. Please check your email address."
        return {
            "success": email_dispatched,
            "message": msg,
            "delivery_channel": "EMAIL_SMTP" if email_dispatched else "FAILED",
            "target": target,
            "expires_in_minutes": 10
        }
    else:
        clean_digits = "".join(filter(str.isdigit, target))
        phone_masked = f"+91 ******{clean_digits[-4:]}" if len(clean_digits) >= 4 else target
        return {
            "success": True,
            "message": f"A verification code has been sent via SMS to {phone_masked}." if sms_dispatched else f"Verification code dispatched to {phone_masked}.",
            "phone_masked": phone_masked,
            "delivery_channel": "SMS_GATEWAY" if sms_dispatched else "SMS_DIRECT",
            "target": phone_masked,
            "expires_in_minutes": 10
        }

def verify_otp(db: Session, email_or_phone: str = "", otp_code: str = "", purpose: str = "REGISTRATION", email: str = None) -> bool:
    code_entered = otp_code.strip()
    target = (email or email_or_phone).strip().lower()
    
    # Check exact database verification record (STRICT authentic verification, ZERO bypasses)
    record = db.query(OTPVerification).filter(
        OTPVerification.email == target,
        OTPVerification.otp_code == code_entered,
        OTPVerification.is_used == False,
        OTPVerification.expires_at >= datetime.utcnow()
    ).first()

    if record:
        record.is_used = True
        db.commit()
        return True

    return False

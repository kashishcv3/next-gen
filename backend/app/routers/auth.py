from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import hashlib
import random
import logging
from app.database import get_db
from app.models.user import User, MFAFeature, MfaDeviceTrust
from app.models.action import Action, ActionForward
from app.schemas.auth import LoginRequest, TokenResponse, MFAVerifyRequest, UserInfo
from app.dependencies import get_current_user
from app.config import settings
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory MFA code store (replaces Redis from old platform)
# Format: { "mfa_user_id_{uid}": { "code": "123456", "created_at": datetime } }
_mfa_codes: dict = {}

# In-memory MFA token store for pending MFA sessions
# Format: { "mfa_token_value": { "user_id": 1, "username": "...", "created_at": datetime } }
_mfa_tokens: dict = {}


def verify_password(plain_password: str, hashed_password: str, last_pw_change: datetime = None) -> bool:
    """Verify password using SHA-512 (newer) or MD5 (older), matching old CV3 platform logic."""
    # Try SHA-512 first (passwords changed after 2024-11-20)
    sha512_hash = hashlib.sha512(plain_password.encode('utf-8')).hexdigest()
    if sha512_hash == hashed_password:
        return True

    # Fall back to MD5 (older passwords)
    md5_hash = hashlib.md5(plain_password.encode('utf-8')).hexdigest()
    if md5_hash == hashed_password:
        return True

    return False


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_mfa_token(user_id: int, username: str) -> str:
    """Create a temporary MFA token for pending 2FA verification."""
    token_data = {"sub": user_id, "mfa_pending": True}
    expire = datetime.utcnow() + timedelta(minutes=10)
    token_data["exp"] = expire
    token = jwt.encode(token_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    _mfa_tokens[token] = {
        "user_id": user_id,
        "username": username,
        "created_at": datetime.utcnow(),
    }
    return token


def get_login_forward_route(user_type: str, db: Session) -> str:
    """Look up where to redirect after login, using the action_forward table.

    Replicates the old platform's Login.php → getForward('main') → MainpageView logic:
      - Login action (id=68) code='main' → '/ShowView/mainpage'
      - MainpageView: if bigadmin with no store → redirect to /ShowView/master_list

    Returns the frontend route path.
    """
    from app.routers.actions import forward_to_frontend_route, parse_forward_url

    # Look up Login action
    login_action = db.query(Action).filter(Action.action == "Login").first()
    if login_action:
        fwd = db.query(ActionForward).filter(
            ActionForward.action_id == login_action.id,
            ActionForward.code == "main",
        ).first()
        if fwd:
            raw_url = parse_forward_url(fwd.forward)
            # Replicate MainpageView logic: bigadmin without store → master_list
            if user_type and user_type.startswith("bigadmin") and "/mainpage" in raw_url:
                return "/dashboard/master-list"
            return forward_to_frontend_route(raw_url)

    # Fallback: bigadmin → master-list, others → main dashboard
    if user_type and user_type.startswith("bigadmin"):
        return "/dashboard/master-list"
    return "/dashboard/main"


def send_mfa_email(email: str, code: str):
    """Send MFA code via email using Netcore API (v6)."""
    import httpx

    try:
        payload = {
            "from": {"email": "info@commercev3.com", "name": "CommerceV3"},
            "subject": "Authentication code for Commercev3",
            "content": [
                {
                    "type": "html",
                    "value": f"<p>Authentication Code: <strong>{code}</strong></p><p>Please use this code to login to your Commercev3 account, it will be valid for 5 minutes.</p>",
                }
            ],
            "personalizations": [{"to": [{"email": email}]}],
        }
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {settings.NETCORE_API_KEY}",
            "Content-Type": "application/json; charset=utf-8",
        }
        resp = httpx.post(settings.NETCORE_API_URL, json=payload, headers=headers, timeout=10)
        logger.info(f"MFA email sent to {email}, status: {resp.status_code}")
    except Exception as e:
        logger.error(f"Failed to send MFA email to {email}: {e}")


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not verify_password(credentials.password, user.password, user.last_pw_change):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Check if device_trust_token is provided and valid
    if credentials.device_trust_token:
        device_trust = db.query(MfaDeviceTrust).filter(
            MfaDeviceTrust.trust_token == credentials.device_trust_token,
            MfaDeviceTrust.user_id == user.uid,
            MfaDeviceTrust.expires > datetime.utcnow()
        ).first()
        if device_trust:
            # Trust token is valid - skip MFA
            access_token = create_access_token(data={"sub": user.uid})
            forward_route = get_login_forward_route(user.user_type, db)
            return TokenResponse(
                access_token=access_token,
                user_id=user.uid,
                username=user.username,
                user_type=user.user_type,
                forward_route=forward_route,
            )

    # Check if MFA is enabled for this user
    mfa_record = db.query(MFAFeature).filter(MFAFeature.user_id == user.uid).first()

    if mfa_record:
        # MFA is enabled — generate code and send email
        auth_code = str(random.randint(100000, 999999))

        # Store code in memory (replaces Redis)
        _mfa_codes[f"mfa_user_id_{user.uid}"] = {
            "code": auth_code,
            "created_at": datetime.utcnow(),
        }

        # Update mfa_feature table
        mfa_record.is_mfa_set = "set"
        mfa_record.code_created_at = datetime.utcnow()
        try:
            db.commit()
        except Exception:
            db.rollback()

        # Send code via email
        if mfa_record.mfa_type == "email_based" and user.email:
            send_mfa_email(user.email, auth_code)
            logger.info(f"MFA code generated for user {user.uid}: {auth_code}")

        # Return MFA-required response with a temp token
        mfa_token = create_mfa_token(user.uid, user.username)

        return TokenResponse(
            access_token="",
            user_id=user.uid,
            username=user.username,
            user_type=user.user_type,
            mfa_required=True,
            mfa_token=mfa_token,
        )

    # No MFA — return access token directly
    access_token = create_access_token(data={"sub": user.uid})
    forward_route = get_login_forward_route(user.user_type, db)

    return TokenResponse(
        access_token=access_token,
        user_id=user.uid,
        username=user.username,
        user_type=user.user_type,
        forward_route=forward_route,
    )


@router.post("/verify-mfa", response_model=TokenResponse)
def verify_mfa(req: MFAVerifyRequest, db: Session = Depends(get_db)):
    # Validate the MFA token
    mfa_session = _mfa_tokens.get(req.mfa_token)
    if not mfa_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA session",
        )

    # Check token isn't expired (10 min)
    if datetime.utcnow() - mfa_session["created_at"] > timedelta(minutes=10):
        _mfa_tokens.pop(req.mfa_token, None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="MFA session expired",
        )

    user_id = mfa_session["user_id"]
    username = mfa_session["username"]

    # First check if code matches the one-time reset code in mfa_feature table
    mfa_record = db.query(MFAFeature).filter(MFAFeature.user_id == user_id).first()
    if mfa_record and mfa_record.onetime_reset_code == req.code:
        # One-time reset code used — regenerate it and clear MFA set flag
        mfa_record.onetime_reset_code = str(random.randint(100000, 999999))
        mfa_record.is_mfa_set = None
        try:
            db.commit()
        except Exception:
            db.rollback()

        # Clean up
        _mfa_tokens.pop(req.mfa_token, None)
        _mfa_codes.pop(f"mfa_user_id_{user_id}", None)

        device_trust_token = None
        # If trust_device is True, create and store device trust token
        if req.trust_device:
            device_trust_token = uuid.uuid4().hex
            device_trust = MfaDeviceTrust(
                user_id=user_id,
                trust_token=device_trust_token,
                device_fingerprint="",
                expires=datetime.utcnow() + timedelta(days=7),
                created=datetime.utcnow(),
            )
            db.add(device_trust)
            try:
                db.commit()
            except Exception:
                db.rollback()

        access_token = create_access_token(data={"sub": user_id})
        user = db.query(User).filter(User.uid == user_id).first()
        forward_route = get_login_forward_route(user.user_type if user else None, db)
        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            username=username,
            user_type=user.user_type if user else None,
            forward_route=forward_route,
            device_trust_token=device_trust_token,
        )

    # Check against the in-memory stored code (replaces Redis check)
    stored = _mfa_codes.get(f"mfa_user_id_{user_id}")
    if not stored:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No MFA code found. Please try logging in again.",
        )

    # Check code expiry (5 minutes)
    if datetime.utcnow() - stored["created_at"] > timedelta(minutes=5):
        _mfa_codes.pop(f"mfa_user_id_{user_id}", None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="MFA code expired. Please try logging in again.",
        )

    if stored["code"] != req.code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Code.",
        )

    # Code is valid — clean up and return access token
    _mfa_tokens.pop(req.mfa_token, None)
    _mfa_codes.pop(f"mfa_user_id_{user_id}", None)

    device_trust_token = None
    # If trust_device is True, create and store device trust token
    if req.trust_device:
        device_trust_token = uuid.uuid4().hex
        device_trust = MfaDeviceTrust(
            user_id=user_id,
            trust_token=device_trust_token,
            device_fingerprint="",  # Can be enhanced with actual fingerprinting
            expires=datetime.utcnow() + timedelta(days=7),
            created=datetime.utcnow(),
        )
        db.add(device_trust)
        try:
            db.commit()
        except Exception:
            db.rollback()

    access_token = create_access_token(data={"sub": user_id})
    user = db.query(User).filter(User.uid == user_id).first()
    forward_route = get_login_forward_route(user.user_type if user else None, db)

    return TokenResponse(
        access_token=access_token,
        user_id=user_id,
        username=username,
        user_type=user.user_type if user else None,
        forward_route=forward_route,
        device_trust_token=device_trust_token,
    )


@router.get("/me", response_model=UserInfo)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserInfo(
        uid=current_user.uid,
        username=current_user.username,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        user_type=current_user.user_type,
        in_cloud=current_user.in_cloud,
    )

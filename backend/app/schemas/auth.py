from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    username: str
    password: str
    device_trust_token: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    user_type: Optional[str] = None
    mfa_required: bool = False
    mfa_token: Optional[str] = None
    # action_forward routing: tells the frontend where to redirect after login
    forward_route: Optional[str] = None
    device_trust_token: Optional[str] = None


class MFAVerifyRequest(BaseModel):
    mfa_token: str
    code: str
    trust_device: bool = False


class UserInfo(BaseModel):
    uid: int
    username: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    user_type: Optional[str] = None
    in_cloud: bool = False

    class Config:
        from_attributes = True

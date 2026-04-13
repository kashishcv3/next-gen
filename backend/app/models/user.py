from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, LargeBinary
from app.database import Base


class User(Base):
    __tablename__ = "users"

    uid = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    user_type = Column(String(50))
    first_name = Column(String(100))
    last_name = Column(String(100))
    co_name = Column(String(255))
    email = Column(String(255), index=True)
    phone = Column(String(20))
    last_four = Column(String(4))
    hint = Column(String(255))
    timestamp = Column(DateTime)
    remote_ip = Column(String(45))
    browser = Column(String(255))
    parent_id = Column(Integer)
    perms = Column(Text)
    admin_id = Column(Integer)
    support_email = Column(String(255))
    terms_time = Column(DateTime)
    inactive = Column(Boolean, default=False)
    last_login = Column(DateTime)
    help_setting = Column(String(50))
    lockout_count = Column(Integer, default=0)
    lockout_datetime = Column(DateTime)
    lockout_passwords = Column(Text)
    last_pw_change = Column(DateTime)
    last_pw = Column(String(255))
    service_password = Column(String(255))
    service_pw_change = Column(DateTime)
    ip_restriction = Column(Text)
    allow_cc_access = Column(Boolean, default=False)
    in_cloud = Column(Boolean, default=False)
    access_token = Column(String(255))
    otp = Column(String(50))


class MFAFeature(Base):
    __tablename__ = "mfa_feature"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, index=True)
    secret_key = Column(String(255))
    mfa_type = Column(String(50))  # email_based or auth_based
    is_mfa_set = Column(String(10))
    code_created_at = Column(DateTime)
    onetime_reset_code = Column(String(50))
    expiry_time_mins = Column(Integer)
    last_3_failed_login_times = Column(String(255))


class MfaDeviceTrust(Base):
    __tablename__ = "mfa_device_trust"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, index=True)
    trust_token = Column(String(64))
    device_fingerprint = Column(String(64))
    expires = Column(DateTime)
    created = Column(DateTime)

"""CRUD for `mfa_device_trust`."""
from app.crud.base import CRUDBase
from app.models.user import MfaDeviceTrust


class CRUDMfaDeviceTrust(CRUDBase[MfaDeviceTrust]):
    pass


crud_mfa_device_trust = CRUDMfaDeviceTrust(MfaDeviceTrust)

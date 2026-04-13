from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class StoreOut(BaseModel):
    site_id: int
    name: Optional[str] = ""
    display_name: Optional[str] = ""
    date_created: Optional[datetime] = None
    is_live: Optional[str] = "n"
    secure_domain: Optional[str] = ""
    bill: Optional[str] = "n"
    bill_note: Optional[str] = ""
    in_cloud: Optional[int] = 0

    class Config:
        from_attributes = True


class DeveloperOut(BaseModel):
    uid: int
    username: str
    user_type: str
    co_name: Optional[str]
    total_stores: int
    stores: List[StoreOut]
    subusers: List["SubuserOut"]

    class Config:
        from_attributes = True


class SubuserOut(BaseModel):
    uid: int
    username: str
    user_type: str
    co_name: Optional[str]
    stores: List[StoreOut]

    class Config:
        from_attributes = True


class MasterListResponse(BaseModel):
    developers: List[DeveloperOut]

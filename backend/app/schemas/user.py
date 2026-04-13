from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserOut(BaseModel):
    uid: int
    username: str
    user_type: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    co_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    last_login: Optional[datetime]
    inactive: bool
    in_cloud: bool

    class Config:
        from_attributes = True


class UserList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[UserOut]

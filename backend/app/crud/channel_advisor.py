"""CRUD for `channel_advisor`."""
from app.crud.base import CRUDBase
from app.models.channel_advisor import ChannelAdvisor


class CRUDChannelAdvisor(CRUDBase[ChannelAdvisor]):
    pass


crud_channel_advisor = CRUDChannelAdvisor(ChannelAdvisor)

"""CRUD for `cms_info`."""
from app.crud.base import CRUDBase
from app.models.cms_info import CmsInfo


class CRUDCmsInfo(CRUDBase[CmsInfo]):
    pass


crud_cms_info = CRUDCmsInfo(CmsInfo)

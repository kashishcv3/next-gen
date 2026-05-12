"""CRUD for `cms_version`."""
from app.crud.base import CRUDBase
from app.models.cms_version import CmsVersion


class CRUDCmsVersion(CRUDBase[CmsVersion]):
    pass


crud_cms_version = CRUDCmsVersion(CmsVersion)

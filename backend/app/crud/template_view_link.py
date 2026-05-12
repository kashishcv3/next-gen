"""CRUD for `template_view_link`."""
from app.crud.base import CRUDBase
from app.models.template_view_link import TemplateViewLink


class CRUDTemplateViewLink(CRUDBase[TemplateViewLink]):
    pass


crud_template_view_link = CRUDTemplateViewLink(TemplateViewLink)

"""CRUD for `template_names`."""
from app.crud.base import CRUDBase
from app.models.template_names import TemplateNames


class CRUDTemplateNames(CRUDBase[TemplateNames]):
    pass


crud_template_names = CRUDTemplateNames(TemplateNames)

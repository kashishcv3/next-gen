"""CRUD for `template_names_admin`."""
from app.crud.base import CRUDBase
from app.models.template_names_admin import TemplateNamesAdmin


class CRUDTemplateNamesAdmin(CRUDBase[TemplateNamesAdmin]):
    pass


crud_template_names_admin = CRUDTemplateNamesAdmin(TemplateNamesAdmin)

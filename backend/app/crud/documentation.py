"""CRUD for `documentation`."""
from app.crud.base import CRUDBase
from app.models.documentation import Documentation


class CRUDDocumentation(CRUDBase[Documentation]):
    pass


crud_documentation = CRUDDocumentation(Documentation)

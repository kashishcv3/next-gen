"""CRUD for `documentation_fields`."""
from app.crud.base import CRUDBase
from app.models.documentation_fields import DocumentationFields


class CRUDDocumentationFields(CRUDBase[DocumentationFields]):
    pass


crud_documentation_fields = CRUDDocumentationFields(DocumentationFields)

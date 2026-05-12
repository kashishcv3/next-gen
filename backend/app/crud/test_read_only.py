"""CRUD for `test_read_only`."""
from app.crud.base import CRUDBase
from app.models.test_read_only import TestReadOnly


class CRUDTestReadOnly(CRUDBase[TestReadOnly]):
    pass


crud_test_read_only = CRUDTestReadOnly(TestReadOnly)

"""CRUD for `block_list`."""
from app.crud.base import CRUDBase
from app.models.block_list import BlockList


class CRUDBlockList(CRUDBase[BlockList]):
    pass


crud_block_list = CRUDBlockList(BlockList)

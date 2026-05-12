"""CRUD for `image_resize`."""
from app.crud.base import CRUDBase
from app.models.image_resize import ImageResize


class CRUDImageResize(CRUDBase[ImageResize]):
    pass


crud_image_resize = CRUDImageResize(ImageResize)

"""CRUD for `s3_file_uploads`."""
from app.crud.base import CRUDBase
from app.models.s3_file_uploads import S3FileUploads


class CRUDS3FileUploads(CRUDBase[S3FileUploads]):
    pass


crud_s3_file_uploads = CRUDS3FileUploads(S3FileUploads)

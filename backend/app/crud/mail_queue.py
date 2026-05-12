"""CRUD for `mail_queue`."""
from app.crud.base import CRUDBase
from app.models.mail_queue import MailQueue


class CRUDMailQueue(CRUDBase[MailQueue]):
    pass


crud_mail_queue = CRUDMailQueue(MailQueue)

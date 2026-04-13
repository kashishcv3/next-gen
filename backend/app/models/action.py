from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class Action(Base):
    """Maps to the `actions` table — the core routing registry from the old CV3 platform.

    Each row is a named action (e.g. 'Login', 'ShowView', 'MasterList') with
    its associated form validator, type (admin/site), and CSRF flag.
    """
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255), index=True)
    form = Column(String(255))
    type = Column(String(50))
    csrf_check = Column(String(1), default="")


class ActionForward(Base):
    """Maps to the `action_forwards` table — the routing forward rules.

    Each row maps an (action_id, code) pair to a forward URL path.

    Examples from the old platform:
      action_id=68 (Login), code='main'    → '/ShowView/mainpage'
      action_id=68 (Login), code='login'   → '/ShowView/login'
      action_id=1  (ShowView), code='notauth' → '/ShowView/login'
      action_id=427 (MasterList), code='finish' → '/ShowView/master_list/all'

    The old platform eval()'d the forward column as PHP. In the new platform
    we parse them as static URL paths (session vars are injected server-side).
    """
    __tablename__ = "action_forwards"

    id = Column(Integer, primary_key=True, index=True)
    action_id = Column(Integer, nullable=False, index=True)
    code = Column(String(50), nullable=False, default="")
    forward = Column(String(100), nullable=False, default="")

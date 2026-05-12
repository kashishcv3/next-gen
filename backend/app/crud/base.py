"""Generic CRUD base class.

Provides standard create / read / update / delete operations for any model.
Tables with composite or non-integer PKs can use get_by(...) / list(...).
"""
from __future__ import annotations

from typing import Any, Generic, List, Optional, Type, TypeVar
from sqlalchemy.orm import Session
from app.database import Base


ModelType = TypeVar("ModelType", bound=Base)


class CRUDBase(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    # ---- READ ----
    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).get(id)

    def get_by(self, db: Session, **filters) -> Optional[ModelType]:
        return db.query(self.model).filter_by(**filters).first()

    def list(self, db: Session, skip: int = 0, limit: int = 100, **filters) -> List[ModelType]:
        q = db.query(self.model)
        if filters:
            q = q.filter_by(**filters)
        return q.offset(skip).limit(limit).all()

    def count(self, db: Session, **filters) -> int:
        q = db.query(self.model)
        if filters:
            q = q.filter_by(**filters)
        return q.count()

    # ---- CREATE ----
    def create(self, db: Session, obj_in: dict) -> ModelType:
        obj = self.model(**obj_in)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def bulk_create(self, db: Session, objs_in: List[dict]) -> List[ModelType]:
        objs = [self.model(**data) for data in objs_in]
        db.add_all(objs)
        db.commit()
        for o in objs:
            db.refresh(o)
        return objs

    # ---- UPDATE ----
    def update(self, db: Session, db_obj: ModelType, obj_in: dict) -> ModelType:
        for k, v in obj_in.items():
            if hasattr(db_obj, k):
                setattr(db_obj, k, v)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_by_id(self, db: Session, id: Any, obj_in: dict) -> Optional[ModelType]:
        db_obj = self.get(db, id)
        if not db_obj:
            return None
        return self.update(db, db_obj, obj_in)

    # ---- DELETE ----
    def delete(self, db: Session, id: Any) -> Optional[ModelType]:
        obj = self.get(db, id)
        if not obj:
            return None
        db.delete(obj)
        db.commit()
        return obj

    def delete_where(self, db: Session, **filters) -> int:
        q = db.query(self.model).filter_by(**filters)
        deleted = q.delete(synchronize_session=False)
        db.commit()
        return deleted

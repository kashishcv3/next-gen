"""CRUD for `contract_activities`."""
from app.crud.base import CRUDBase
from app.models.contract_activities import ContractActivities


class CRUDContractActivities(CRUDBase[ContractActivities]):
    pass


crud_contract_activities = CRUDContractActivities(ContractActivities)

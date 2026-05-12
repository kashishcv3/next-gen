"""CRUD for `rewards_program`."""
from app.crud.base import CRUDBase
from app.models.rewards_program import RewardsProgram


class CRUDRewardsProgram(CRUDBase[RewardsProgram]):
    pass


crud_rewards_program = CRUDRewardsProgram(RewardsProgram)

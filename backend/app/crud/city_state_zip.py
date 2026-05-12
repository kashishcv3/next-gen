"""CRUD for `city_state_zip`."""
from app.crud.base import CRUDBase
from app.models.city_state_zip import CityStateZip


class CRUDCityStateZip(CRUDBase[CityStateZip]):
    pass


crud_city_state_zip = CRUDCityStateZip(CityStateZip)

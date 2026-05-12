"""CRUD for `recipe_options`."""
from app.crud.base import CRUDBase
from app.models.recipe_options import RecipeOptions


class CRUDRecipeOptions(CRUDBase[RecipeOptions]):
    pass


crud_recipe_options = CRUDRecipeOptions(RecipeOptions)

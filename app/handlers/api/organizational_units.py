from app.handlers.core.base import BaseHandler
from app.utils.google_api import get_all_org_units


class OrganizationalUnitsHandler(BaseHandler):
    async def get(self):
        organizational_units = get_all_org_units()
        self.write({"status": "success", "organizational_units": organizational_units})

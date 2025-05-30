from app.handlers.core.base import BaseHandler
from app.utils.users_cache import users_cache


class UsersHandler(BaseHandler):
    async def get(self):
        user_id = self.get_argument("id")
        if not user_id:
            self.write({"status": "success", "users": users_cache})
        else:
            for user in users_cache:
                if user["id"] == user_id:
                    self.write({"status": "success", "user": user})
                    return

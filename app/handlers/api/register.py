from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role
from app.utils import google_api


class RegisterAPIHandler(BaseHandler):
    def prepare(self):
        role = self.current_role
        if not role:
            self.write_error(403, error_message="Unauthorized")
        if role not in ("admin", "super_admin"):
            self.write_error(403, error_message="Unauthorized")

    @require_role("admin", "super_admin")
    async def post(self):
        first_name = self.get_body_argument("first_name")
        last_name = self.get_body_argument("last_name")
        username = f"{first_name.title()} {last_name.title()}"
        password = f"{last_name.title()}{first_name.title()}123!"
        colony = self.get_body_argument("colony")
        colony_code = colony.split("-")[-1].upper()
        domain_name = "hbnitv.net"
        email = f"{colony_code.lower()}-{first_name.lower()}@{domain_name}"

        user_info = {
            "email": email,
            "given_name": username,
            "family_name": colony_code,
            "password": password,
        }

        try:
            directory = google_api.get_directory_service()

            result = google_api.create_user_if_not_exists(
                directory,
                user_info,
                org_unit=f"/{colony}",
            )

            self.write(
                {
                    "success": True,
                    "created": result["created"],
                    "message": result["message"],
                    "user_info": user_info,
                }
            )
        except Exception as e:
            self.set_status(500)
            self.write({"success": False, "message": str(e)})

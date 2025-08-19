import secrets
import string

from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role
from app.utils import google_api

def generate_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

class RegisterAPIHandler(BaseHandler):
    def prepare(self):
        role = self.current_role
        if not role:
            self.write_error(403, error_message="Unauthorized")
        if role not in ("admin", "super_admin"):
            self.write_error(403, error_message="Unauthorized")

    @require_role("admin", "super_admin")
    async def post(self):
        name = self.get_body_argument("name")
        first_name = name.split(" ")[0]
        password = generate_password()
        organizational_unit = self.get_body_argument("organizational_unit")
        domain_name = "hbnitv.net"
        colony_initials = organizational_unit.split("-")[-1].upper()
        email = f"{colony_initials.lower()}-{first_name}@{domain_name}"

        user_info = {
            "email": email,
            "given_name": name,
            "family_name": colony_initials,
            "password": password,
        }

        try:
            result = google_api.create_user_if_not_exists(
                user_info,
                org_unit=organizational_unit,
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

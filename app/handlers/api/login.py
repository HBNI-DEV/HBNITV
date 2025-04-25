from google.auth.transport import requests
from google.oauth2 import id_token

from app.config.environments import Environment
from app.handlers.core.base import BaseHandler


class LoginAPIHandler(BaseHandler):
    def post(self):
        token = self.get_argument("token", None)
        if not token:
            self.set_status(400)
            self.write({"success": False, "message": "Missing token"})
            return

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                Environment.CLIENT_ID,
                clock_skew_in_seconds=Environment.CLOCK_SKEW_IN_SECONDS,
            )
            email = idinfo["email"]
            email_verified = idinfo.get("email_verified", False)
            hd = idinfo.get("hd", "")
            picture = idinfo.get("picture", "")
            username = idinfo.get("name", "")
            given_name = idinfo.get("given_name", "")
            family_name = idinfo.get("family_name", "")

            if hd not in ["hbnitv.net", "hbni.net"]:
                self.set_status(403)
                self.write({"success": False, "message": "Unauthorized domain"})
                return

            role = "student" if hd == "hbnitv.net" else "admin"
            if email in ["jared@hbni.net"]:
                role = "super_admin"

            self.set_secure_cookie("email", email)
            self.set_secure_cookie("role", role)
            self.set_secure_cookie("profile_picture", picture)
            self.set_secure_cookie("username", username)
            self.set_secure_cookie("given_name", given_name)
            self.set_secure_cookie("family_name", family_name)
            self.set_secure_cookie("hd", hd)
            self.set_secure_cookie("email_verified", str(email_verified))

            self.write({"success": True, "message": "Login successful", "role": role})
        except ValueError as e:
            print("TOKEN VERIFICATION ERROR:", e)
            self.set_status(401)
            self.write({"success": False, "message": f"{e}"})

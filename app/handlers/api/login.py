import os

import psycopg2
import requests
from google.auth.transport import requests as google_requests
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
                google_requests.Request(),
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

            """
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL,
                name TEXT,
                profile_picture TEXT
            );
            """

            conn = psycopg2.connect(
                dbname=Environment.POSTGRES_DB,
                user=Environment.POSTGRES_USER,
                password=Environment.POSTGRES_PASSWORD,
                host=Environment.POSTGRES_HOST,
                port=Environment.POSTGRES_PORT,
            )
            conn.autocommit = True
            cur = conn.cursor()

            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cur.fetchone()

            if user:
                user_id = str(user[0])
            else:
                cur.execute(
                    """
                    INSERT INTO users (email, role, name, profile_picture)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """,
                    (email, role, username, picture),
                )
                user_id = str(cur.fetchone()[0])

            cur.close()
            conn.close()

            # 🍪 Store cookies
            self.set_secure_cookie("email", email)
            self.set_secure_cookie("role", role)
            self.set_secure_cookie("profile_picture", picture)
            self.set_secure_cookie("username", username)
            self.set_secure_cookie("given_name", given_name)
            self.set_secure_cookie("family_name", family_name)
            self.set_secure_cookie("hd", hd)
            self.set_secure_cookie("email_verified", str(email_verified))
            self.set_secure_cookie("user_id", user_id)

            self.cache_google_photo(user_id, picture)

            self.write(
                {
                    "success": True,
                    "message": "Login successful",
                    "role": role,
                    "user_id": user_id,
                }
            )

        except ValueError as e:
            print("TOKEN VERIFICATION ERROR:", e)
            self.set_status(401)
            self.write({"success": False, "message": f"{e}"})

    def cache_google_photo(self, user_id: str, photo_url: str):
        cache_dir = "static/profiles"
        os.makedirs(cache_dir, exist_ok=True)
        local_path = os.path.join(cache_dir, f"{user_id}.jpg")

        if not os.path.exists(local_path):
            print(f"Downloading and caching photo for {user_id}")
            response = requests.get(photo_url, stream=True)
            if response.status_code == 200:
                with open(local_path, "wb") as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
        return f"/static/profiles/{user_id}.jpg"

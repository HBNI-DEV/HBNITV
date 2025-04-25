from app.handlers.core.base import BaseHandler


class LogoutAPIHandler(BaseHandler):
    def get(self):
        self.clear_cookie("username")
        self.clear_cookie("role")
        self.clear_cookie("profile_picture")
        self.clear_cookie("username")
        self.clear_cookie("given_name")
        self.clear_cookie("family_name")
        self.clear_cookie("hd")
        self.clear_cookie("email_verified")
        self.clear_cookie("email")

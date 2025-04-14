from app.handlers.base import BaseHandler


class LoginHandler(BaseHandler):
    def get(self):
        self.render_template("login.html")

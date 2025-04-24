from app.handlers.base import BaseHandler


class SettingsHandler(BaseHandler):
    def get(self):
        self.render_template(
            "settings.html",
        )

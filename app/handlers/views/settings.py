from app.handlers.core.base import BaseHandler


class SettingsHandler(BaseHandler):
    def get(self):
        self.render_template(
            "settings.html",
        )

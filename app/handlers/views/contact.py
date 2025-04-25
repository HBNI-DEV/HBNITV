from app.handlers.core.base import BaseHandler


class ContactPageHandler(BaseHandler):
    def get(self):
        self.render_template(
            "contact.html",
        )

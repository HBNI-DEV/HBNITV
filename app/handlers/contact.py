from app.handlers.base import BaseHandler


class ContactHandler(BaseHandler):
    def get(self):
        self.render_template(
            "contact.html",
        )

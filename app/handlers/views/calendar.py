from app.handlers.core.base import BaseHandler


class CalendarHandler(BaseHandler):
    def get(self):
        self.render_template("calendar.html")

from app.handlers.core.base import BaseHandler


class CalendarPageHandler(BaseHandler):
    def get(self):
        self.render_template("calendar.html")

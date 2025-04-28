from app.handlers.core.base import BaseHandler


class ServiceWorkerHandler(BaseHandler):
    def get(self):
        self.set_header("Content-Type", "application/javascript")
        self.set_header("Service-Worker-Allowed", "/")
        self.set_header("Cache-Control", "no-cache")
        with open("public/service-worker.js", "r") as file:
            self.write(file.read())

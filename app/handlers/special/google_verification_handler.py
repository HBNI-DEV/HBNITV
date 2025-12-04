from app.handlers.core.base import BaseHandler


class GoogleVerificationHandler(BaseHandler):
    def get(self):
        try:
            self.set_header("Content-Type", "text/html")
            self.write("google-site-verification: google9d968a11b4bf61f7.html")
            self.finish()
        except Exception as e:
            # Handle unexpected errors
            self.set_status(500)
            self.write(f"An error occurred: {str(e)}")
            self.finish()

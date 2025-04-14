import jinja2
from tornado.web import RequestHandler

loader = jinja2.FileSystemLoader("public/dist/html")
env = jinja2.Environment(loader=loader)
error_messages = {
    500: "Oooops! Internal Server Error. That is, something went terribly wrong.",
    404: "Uh-oh! You seem to have ventured into the void. This page doesn't exist!",
    403: "Hold up! You're trying to sneak into a restricted area. Access denied!",
    400: "Yikes! The server couldn't understand your request. Try being clearer!",
    401: "Hey, who goes there? You need proper credentials to enter!",
    405: "Oops! You knocked on the wrong door with the wrong key. Method not allowed!",
    408: "Well, this is awkward. Your request took too long. Let's try again?",
    502: "Looks like the gateway had a hiccup. It's not you, it's us!",
    503: "We're taking a quick nap. Please try again later!",
    418: "I'm a teapot, not a coffee maker! Why would you ask me to do that?",
}


class BaseHandler(RequestHandler):
    def get_template(self, template_name: str):
        return env.get_template(template_name)

    def render_template(self, template_name: str, **kwargs):
        template = self.get_template(template_name)
        rendered_template = template.render(**kwargs)
        self.write(rendered_template)

    def write_error(self, status_code: int, **kwargs):
        error_message = error_messages.get(status_code, "Something went majorly wrong.")
        template = self.get_template("error.html")
        rendered_template = template.render(
            error_code=status_code, error_message=error_message
        )
        self.write(rendered_template)

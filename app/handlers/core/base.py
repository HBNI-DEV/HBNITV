import jinja2
from tornado.web import RequestHandler

from app.utils.error_messages import ERROR_MESSAGES

loader = jinja2.FileSystemLoader("public/html")
env = jinja2.Environment(loader=loader)


class BaseHandler(RequestHandler):
    def get_template(self, template_name: str):
        return env.get_template(template_name)

    def render_template(self, template_name: str, **kwargs):
        template = self.get_template(template_name)
        rendered_template = template.render(
            is_logged_in=bool(self.current_username),
            username=self.current_username,
            given_name=self.current_given_name,
            family_name=self.current_family_name,
            email=self.current_email,
            email_verified=self.current_email_verified,
            profile_picture=self.current_profile_picture,
            hd=self.current_hd,
            role=self.current_role,
            **kwargs,
        )
        self.write(rendered_template)

    def write_error(self, status_code: int, **kwargs):
        error_message = ERROR_MESSAGES.get(status_code, "Something went majorly wrong.")
        template = self.get_template("error.html")
        rendered_template = template.render(
            error_code=status_code, error_message=error_message
        )
        self.write(rendered_template)

    @property
    def current_role(self):
        role = self.get_secure_cookie("role")
        return role.decode("utf-8") if role else None

    @property
    def current_email(self):
        email = self.get_secure_cookie("email")
        return email.decode("utf-8") if email else None

    @property
    def current_email_verified(self):
        email_verified = self.get_secure_cookie("email_verified")
        return email_verified.decode("utf-8") if email_verified else None

    @property
    def current_profile_picture(self):
        profile_picture = self.get_secure_cookie("profile_picture")
        return profile_picture.decode("utf-8") if profile_picture else None

    @property
    def current_username(self):
        username = self.get_secure_cookie("username")
        return username.decode("utf-8") if username else None

    @property
    def current_given_name(self):
        given_name = self.get_secure_cookie("given_name")
        return given_name.decode("utf-8") if given_name else None

    @property
    def current_family_name(self):
        family_name = self.get_secure_cookie("family_name")
        return family_name.decode("utf-8") if family_name else None

    @property
    def current_hd(self):
        hd = self.get_secure_cookie("hd")
        return hd.decode("utf-8") if hd else None

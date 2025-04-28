from app.handlers.core.base import BaseHandler


class GenericPageHandler(BaseHandler):
    def initialize(
        self,
        template_name: str,
        required_roles: tuple = None,
        extra_context: dict = None,
    ):
        self.template_name = template_name
        self.required_roles = required_roles  # can be None or a tuple of allowed roles
        self.extra_context = extra_context or {}

    def prepare(self):
        if self.required_roles:
            role = self.current_role
            if not role or role not in self.required_roles:
                self.write_error(403, error_message="Unauthorized")
                self.finish()  # stop further processing

    def get(self):
        self.render_template(self.template_name, **self.extra_context)

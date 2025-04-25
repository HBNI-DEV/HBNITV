from functools import wraps

from tornado.web import HTTPError


def require_role(*allowed_roles):
    def decorator(method):
        @wraps(method)
        def wrapper(self, *args, **kwargs):
            role = self.get_secure_cookie("role")
            if not role:
                raise HTTPError(403, reason="Not logged in")
            role = role.decode("utf-8")
            if role not in allowed_roles:
                raise HTTPError(403, reason="Unauthorized")
            return method(self, *args, **kwargs)

        return wrapper

    return decorator

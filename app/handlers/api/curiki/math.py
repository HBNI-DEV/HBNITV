from app.handlers.curiki import CurikiBaseHandler
from app.utils.curiki.math_cache import MathCache


class CurikiMathAPIHandler(CurikiBaseHandler):
    def initialize(self):
        super().initialize()
        MathCache.load(self.cur)


class CurikiMathSkillsAPIHandler(CurikiMathAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": MathCache.skills.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiMathStrandsAPIHandler(CurikiMathAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": MathCache.strands.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiMathOutcomesAPIHandler(CurikiMathAPIHandler):
    def get(self):
        try:
            outcome_id = self.get_argument("id", None)

            if outcome_id:
                if result := MathCache.cache.get(outcome_id):
                    self.write({"status": "success", "data": result})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Outcome not found"})
            else:
                self.write(
                    {
                        "status": "success",
                        "data": MathCache.cache,
                    }
                )
        except Exception as e:
            self.write_error_response(e)

    @staticmethod
    def _get_outcome(outcome_id):
        if result := MathCache.cache.get(outcome_id):
            return result
        else:
            return None

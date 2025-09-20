from app.handlers.kuriki import KurikiBaseHandler
from app.utils.kuriki.math_cache import MathCache


class KurikiMathAPIHandler(KurikiBaseHandler):
    def initialize(self):
        super().initialize()
        MathCache.load(self.cur)


class KurikiMathSkillsAPIHandler(KurikiMathAPIHandler):
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


class KurikiMathStrandsAPIHandler(KurikiMathAPIHandler):
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


class KurikiMathOutcomesAPIHandler(KurikiMathAPIHandler):
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

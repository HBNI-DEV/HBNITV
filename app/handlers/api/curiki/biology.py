from app.handlers.curiki import CurikiBaseHandler
from app.utils.curiki.biology_cache import BiologyCache


class CurikiBiologyAPIHandler(CurikiBaseHandler):
    def initialize(self):
        super().initialize()
        BiologyCache.load(self.cur)


class CurikiBiologyUnitsAPIHandler(CurikiBiologyAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": BiologyCache.units.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiBiologyGeneralLearningOutcomesAPIHandler(CurikiBiologyAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": BiologyCache.general_learning_outcomes.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiBiologyOutcomesAPIHandler(CurikiBiologyAPIHandler):
    def get(self):
        try:
            outcome_id = self.get_argument("id", None)

            if outcome_id:
                if result := BiologyCache.cache.get(outcome_id):
                    self.write({"status": "success", "data": result})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Outcome not found"})
            else:
                self.write(
                    {
                        "status": "success",
                        "data": BiologyCache.cache,
                    }
                )
        except Exception as e:
            self.write_error_response(e)

    @staticmethod
    def _get_outcome(outcome_id: str):
        if result := BiologyCache.cache.get(outcome_id):
            return result
        else:
            return None

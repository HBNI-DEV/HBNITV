from app.handlers.curiki import CurikiBaseHandler
from app.utils.curiki.science_cache import ScienceCache


class CurikiScienceAPIHandler(CurikiBaseHandler):
    def initialize(self):
        super().initialize()
        ScienceCache.load(self.cur)


class CurikiScienceClustersAPIHandler(CurikiScienceAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": ScienceCache.clusters.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiScienceGeneralLearningOutcomesAPIHandler(CurikiScienceAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": ScienceCache.general_learning_outcomes.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiScienceOutcomesAPIHandler(CurikiScienceAPIHandler):
    def get(self):
        try:
            outcome_id = self.get_argument("id", None)

            if outcome_id:
                if result := ScienceCache.cache.get(outcome_id):
                    self.write({"status": "success", "data": result})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Outcome not found"})
            else:
                self.write(
                    {
                        "status": "success",
                        "data": ScienceCache.cache,
                    }
                )
        except Exception as e:
            self.write_error_response(e)

    @staticmethod
    def _get_outcome(outcome_id: str):
        if result := ScienceCache.cache.get(outcome_id):
            return result
        else:
            return None

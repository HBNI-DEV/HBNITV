from app.handlers.kuriki import KurikiBaseHandler
from app.utils.kuriki.science_cache import ScienceCache


class KurikiScienceAPIHandler(KurikiBaseHandler):
    def initialize(self):
        super().initialize()
        ScienceCache.load(self.cur)


class KurikiScienceClustersAPIHandler(KurikiScienceAPIHandler):
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


class KurikiScienceGeneralLearningOutcomesAPIHandler(KurikiScienceAPIHandler):
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


class KurikiScienceOutcomesAPIHandler(KurikiScienceAPIHandler):
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

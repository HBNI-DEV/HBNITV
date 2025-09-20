from app.handlers.kuriki import KurikiBaseHandler
from app.utils.kuriki.science_1999_to_2000_cache import Science1999To2000Cache


class KurikiScienceAPIHandler(KurikiBaseHandler):
    def initialize(self):
        super().initialize()
        Science1999To2000Cache.load(self.cur)


class KurikiScienceClustersAPIHandler(KurikiScienceAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": Science1999To2000Cache.clusters.to_dict(),
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
                    "data": Science1999To2000Cache.general_learning_outcomes.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class KurikiScienceOutcomesAPIHandler(KurikiScienceAPIHandler):
    def get(self):
        try:
            outcome_id = self.get_argument("id", None)

            if outcome_id:
                if result := Science1999To2000Cache.cache.get(outcome_id):
                    self.write({"status": "success", "data": result})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Outcome not found"})
            else:
                self.write(
                    {
                        "status": "success",
                        "data": Science1999To2000Cache.cache,
                    }
                )
        except Exception as e:
            self.write_error_response(e)

    @staticmethod
    def _get_outcome(outcome_id: str):
        if result := Science1999To2000Cache.cache.get(outcome_id):
            return result
        else:
            return None

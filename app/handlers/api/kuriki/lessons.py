import json

from app.handlers.kuriki import KurikiBaseHandler
from app.utils.kuriki.lessons_cache import LessonsCache


class KurikiLessonsAPIHandler(KurikiBaseHandler):
    def initialize(self):
        super().initialize()
        LessonsCache.load(self.cur)

    def get(self):
        try:
            outcome_id = self.get_argument("outcomeId", None)

            if outcome_id:
                # Filter lessons containing the outcome
                data = {k: v for k, v in LessonsCache.cache.items() if outcome_id in v["outcomes"]}
                self.write({"status": "success", "data": data})
            else:
                self.write({"status": "success", "data": LessonsCache.cache})
        except Exception as e:
            self.write_error_response(e)

    def post(self):
        try:
            payload = json.loads(self.request.body.decode("utf-8"))
            id_key = payload.get("date")
            data = payload.get("data")
            outcomes = payload.get("outcomes")

            if not (id_key and isinstance(data, dict) and isinstance(outcomes, list)):
                self.write_error_message(400, "Missing or invalid fields: date, data, outcomes")
                return

            LessonsCache.add(self.cur, id_key, data, outcomes)
            self.write({"status": "success", "message": "Lesson saved"})
        except Exception as e:
            self.write_error_response(e)

    def delete(self):
        try:
            id_key = self.get_argument("date", None)
            if not id_key:
                self.write_error_message(400, "Missing 'date' parameter")
                return

            LessonsCache.delete(self.cur, int(id_key))
            self.write({"status": "success", "message": "Lesson deleted"})
        except Exception as e:
            self.write_error_response(e)

import json

from app.handlers.kuriki import KurikiBaseHandler
from app.utils.kuriki.worksheets_cache import WorksheetsCache


class KurikiWorksheetsAPIHandler(KurikiBaseHandler):
    def initialize(self):
        super().initialize()
        WorksheetsCache.load(self.cur)

    def get(self):
        try:
            worksheet_id = self.get_argument("id", None)
            outcome_id = self.get_argument("outcomeId", None)

            # --- 1. Fetch by worksheet id ---
            if worksheet_id:
                if worksheet_id.isdigit():
                    worksheet_id = int(worksheet_id)
                data = WorksheetsCache.cache.get(worksheet_id)
                if data:
                    self.write({"status": "success", "data": data})
                else:
                    self.write_error_message(404, "Worksheet not found")
                return

            # --- 2. Fetch all worksheets linked to an outcome ---
            if outcome_id:
                worksheets = WorksheetsCache.get_by_outcome(outcome_id)
                self.write({"status": "success", "data": worksheets})
                return

            # --- 3. Default: return everything ---
            self.write({"status": "success", "data": WorksheetsCache.cache})
        except Exception as e:
            self.write_error_response(e)

    def post(self):
        try:
            payload = json.loads(self.request.body.decode("utf-8"))
            id_key = payload.get("idKey")
            data = payload.get("data")
            outcomes = payload.get("outcomes")

            if not (id_key and isinstance(data, dict) and isinstance(outcomes, list)):
                self.write_error_message(400, "Missing or invalid fields: date, data, outcomes")
                return

            WorksheetsCache.add(self.cur, id_key, data, outcomes)
            self.write({"status": "success", "message": "Worksheet saved"})
        except Exception as e:
            self.write_error_response(e)

    def delete(self):
        try:
            id_key = self.get_argument("date", None)
            if not id_key:
                self.write_error_message(400, "Missing 'date' parameter")
                return

            WorksheetsCache.delete(self.cur, int(id_key))
            self.write({"status": "success", "message": "Worksheet deleted"})
        except Exception as e:
            self.write_error_response(e)

import json

from app.handlers.kuriki import KurikiBaseHandler
from app.utils.kuriki.resources_cache import ResourceCache


class KurikiResourcesAPIHandler(KurikiBaseHandler):
    def initialize(self):
        super().initialize()
        ResourceCache.load(self.cur)

    def get(self):
        try:
            outcome_id = self.get_argument("outcomeId", None)
            if outcome_id:
                data = ResourceCache.cache.get(outcome_id, [])
                self.write({"status": "success", "data": data})
            else:
                self.write({"status": "success", "data": ResourceCache.cache})
        except Exception as e:
            self.write_error_response(e)

    def post(self):
        try:
            data = self.request.body.decode("utf-8")

            payload = json.loads(data)
            url = payload.get("url")
            outcome_id = payload.get("outcomeId")

            if not url or not outcome_id:
                self.write_error_message(400, "Missing 'url' or 'outcomeId'")
                return

            ResourceCache.add(self.cur, url, outcome_id)
            self.write({"status": "success", "message": "Resource added"})
        except Exception as e:
            self.write_error_response(e)

    def delete(self):
        try:
            url = self.get_argument("url", None)
            outcome_id = self.get_argument("outcomeId", None)

            if not url or not outcome_id:
                self.write_error_message(400, "Missing 'url' or 'outcomeId'")
                return

            ResourceCache.delete(self.cur, url, outcome_id)
            self.write({"status": "success", "message": "Resource deleted"})
        except Exception as e:
            self.write_error_response(e)

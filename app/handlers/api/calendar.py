import json
from datetime import datetime

from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role
from app.utils.calendar import (
    create_calendar_table_if_not_exists,
    generate_six_day_cycle,
    get_calendar,
    update_calendar_database,
)
from app.utils.google_api import update_ics_to_google_calendar


class CalendarAPIHandler(BaseHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")  # Or a specific domain
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    @require_role("super_admin")
    def get(self):
        calendar = get_calendar()
        if calendar:
            self.set_status(200)
            self.write({"status": "success", "calendar": calendar})
        else:
            self.set_status(404)
            self.write({"error": "Calendar not found."})

    @require_role("super_admin")
    def post(self) -> None:
        try:
            data = json.loads(self.request.body)

            start_date = data.get("start_date", "")
            end_date = data.get("end_date", "")
            dates_to_ignore: dict[str, str] = data.get("dates_to_ignore", {})

            # Validate dates
            datetime.strptime(start_date, "%Y-%m-%d")
            datetime.strptime(end_date, "%Y-%m-%d")
            for date, name in dates_to_ignore.items():
                datetime.strptime(date, "%Y-%m-%d")

            calendar_id = "c_8263605f66b0a77108c1cb80488a019c62af9e08d4d6b58dd68b1b2be845b9e8@group.calendar.google.com"

            # Generate calendar and upload events
            calendar_obj = generate_six_day_cycle(start_date, end_date, dates_to_ignore)

            update_ics_to_google_calendar(calendar_id, calendar_obj)

            create_calendar_table_if_not_exists()
            update_calendar_database(start_date, end_date, dates_to_ignore)

            self.set_status(200)
            self.write(
                {
                    "status": "success",
                    "message": f"Day X calendar uploaded from {start_date} to {end_date} (skipping {len(dates_to_ignore)} extra dates).",
                }
            )

        except Exception as e:
            self.set_status(400)
            self.write({"error": str(e)})

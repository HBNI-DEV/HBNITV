import json
from datetime import datetime, timedelta

import holidays
import psycopg2
from ics import Calendar, Event

from app.config.environments import Environment


def _get_connection():
    return psycopg2.connect(
        dbname=Environment.POSTGRES_DB,
        user=Environment.POSTGRES_USER,
        password=Environment.POSTGRES_PASSWORD,
        host=Environment.POSTGRES_HOST,
        port=Environment.POSTGRES_PORT,
    )


def generate_six_day_cycle(
    start_date, end_date, dates_to_ignore: dict[str, str]
) -> Calendar:
    current_year = datetime.now().year
    next_year = current_year + 1
    canada_holidays = holidays.country_holidays(
        "CA", prov="MB", years=[current_year, next_year]
    )
    holiday_dates = {date.strftime("%Y-%m-%d") for date in canada_holidays}

    # Convert dict[date_str] = name → set of dates and dict of notes
    dates_to_ignore_names = {
        datetime.strptime(date, "%Y-%m-%d").date(): name
        for date, name in dates_to_ignore.items()
    }

    # Combine holidays and user-defined ignored dates
    all_dates_to_ignore = {
        datetime.strptime(date, "%Y-%m-%d").date() for date in holiday_dates
    }.union(dates_to_ignore_names.keys())

    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    day_count = 0
    current = start_date
    cal = Calendar()

    while current <= end_date:
        current_date = current.date()

        if current.weekday() >= 5:
            current += timedelta(days=1)
            continue

        if current_date in all_dates_to_ignore:
            event = Event()
            event.name = f"{dates_to_ignore_names.get(current_date, 'Holiday / No School')} (Skipped in Day Cycle)"
            event.begin = current.strftime("%Y-%m-%d")
            event.make_all_day()
            cal.events.add(event)
        else:
            event = Event()
            event.name = f"Day {day_count % 6 + 1}"
            event.begin = current.strftime("%Y-%m-%d")
            event.make_all_day()
            cal.events.add(event)
            day_count += 1

        current += timedelta(days=1)

    return cal


def create_calendar_table_if_not_exists():
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS calendar (
                id SERIAL PRIMARY KEY,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                dates_to_ignore JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        conn.commit()
    finally:
        cur.close()
        conn.close()


def update_calendar_database(start_date: str, end_date: str, dates_to_ignore: dict):
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO calendar (start_date, end_date, dates_to_ignore)
            VALUES (%s, %s, %s::jsonb)
        """,
            (start_date, end_date, json.dumps(dates_to_ignore)),
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()


def get_calendar() -> dict:
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT id, start_date, end_date, dates_to_ignore
            FROM calendar
            ORDER BY created_at DESC
            LIMIT 1
        """)
        row = cur.fetchone()
        columns = [desc[0] for desc in cur.description]
        result = dict(zip(columns, row))
        if result and isinstance(result["dates_to_ignore"], str):
            result["dates_to_ignore"] = json.loads(result["dates_to_ignore"])
        return result
    finally:
        cur.close()
        conn.close()

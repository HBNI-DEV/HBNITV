import asyncio

from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils import google_api

# Global cache
organizational_units_cache = []


def update_organizational_units_cache():
    try:
        data = google_api.get_all_org_units()
        organizational_units_cache.clear()
        for unit in data:
            organizational_units_cache.append(unit)
    except Exception as e:
        print(f"[UserCache] ❌ Error updating cache: {e}")

def get_organizational_units_cache():
    return organizational_units_cache

def start_organizational_units_updater():
    async def run_in_thread():
        await asyncio.to_thread(update_organizational_units_cache)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_USER_CACHE_INTERVAL_MINUTES,
    ).start()

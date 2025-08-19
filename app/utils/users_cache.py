import asyncio

from natsort import natsorted
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils import google_api

# Global cache
organizational_units_cache = []


def update_organizational_units_cache():
    try:
        data = google_api.get_all_org_units()
        data_sorted = natsorted(data, key=lambda x: x["name"])
        organizational_units_cache.clear()
        organizational_units_cache.extend(data_sorted)
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

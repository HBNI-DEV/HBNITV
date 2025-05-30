import os

from dotenv import load_dotenv

load_dotenv()


class Environment:
    def __init__(self):
        raise RuntimeError("Environment is a static class and cannot be instantiated.")

    POSTGRES_USER = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_DB = os.getenv("POSTGRES_DB")
    POSTGRES_HOST = os.getenv("POSTGRES_HOST")
    POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", 5434))
    PORT = int(os.getenv("PORT", 5060))
    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_SECRET = os.getenv("CLIENT_SECRET")
    CLOCK_SKEW_IN_SECONDS = int(os.getenv("CLOCK_SKEW_IN_SECONDS", 0))
    SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE")
    DELEGATED_ADMIN = os.getenv("DELEGATED_ADMIN")
    CLASSES_FOLDER_ID = os.getenv("CLASSES_FOLDER_ID")
    UPDATE_GOOGLE_SHARED_FOLDERS_INTERVAL_MINUTES = int(
        os.getenv("UPDATE_GOOGLE_SHARED_FOLDERS_INTERVAL_MINUTES", 5)
    )
    UPDATE_CLASS_CACHE_INTERVAL_MINUTES = int(
        os.getenv("UPDATE_CLASS_CACHE_INTERVAL_MINUTES", 1)
    )
    UPDATE_USER_CACHE_INTERVAL_MINUTES = int(
        os.getenv("UPDATE_USER_CACHE_INTERVAL_MINUTES", 1440)
    )

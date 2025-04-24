import os

from dotenv import load_dotenv

load_dotenv()


class Environment:
    def __init__(self):
        raise RuntimeError("Environment is a static class and cannot be instantiated.")

    PORT = int(os.getenv("PORT", 5060))
    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_SECRET = os.getenv("CLIENT_SECRET")
    CLOCK_SKEW_IN_SECONDS = int(os.getenv("CLOCK_SKEW_IN_SECONDS", 0))
    SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE")
    DELEGATED_ADMIN = os.getenv("DELEGATED_ADMIN")

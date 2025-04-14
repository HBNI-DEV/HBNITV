import os

from dotenv import load_dotenv

load_dotenv()


class Environment:
    def __init__(self):
        raise RuntimeError("Environment is a static class and cannot be instantiated.")

    PORT = int(os.getenv("PORT", 5060))

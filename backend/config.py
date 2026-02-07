import os


class Settings:
    TASKFLOW_WEBHOOK_URL: str = os.getenv("TASKFLOW_WEBHOOK_URL", "http://localhost:8000/webhooks/pj")
    TASKFLOW_WEBHOOK_SECRET: str = os.getenv("TASKFLOW_WEBHOOK_SECRET", "taskflow-pj-secret-2026")
    TASKFLOW_WEBHOOKS_ENABLED: bool = os.getenv("TASKFLOW_WEBHOOKS_ENABLED", "true").lower() == "true"

    AUTH_MODE: str = os.getenv("AUTH_MODE", "dev")
    TASKFLOW_API_KEY: str = os.getenv("TASKFLOW_API_KEY", "pj-taskflow-dev-key-2026")
    REQUIRE_API_KEY_IN_DEV: bool = os.getenv("REQUIRE_API_KEY_IN_DEV", "false").lower() == "true"
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")


settings = Settings()

TASKFLOW_WEBHOOK_URL = settings.TASKFLOW_WEBHOOK_URL
TASKFLOW_WEBHOOK_SECRET = settings.TASKFLOW_WEBHOOK_SECRET
TASKFLOW_WEBHOOKS_ENABLED = settings.TASKFLOW_WEBHOOKS_ENABLED

from fastapi import Header, HTTPException, Request, Depends
from functools import wraps
from typing import Optional
from datetime import datetime, timedelta
from collections import defaultdict
import time
import threading

from config import settings


class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
        self.lock = threading.Lock()

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        minute_ago = now - 60

        with self.lock:
            self.requests[key] = [t for t in self.requests[key] if t > minute_ago]

            if len(self.requests[key]) >= self.requests_per_minute:
                return False

            self.requests[key].append(now)
            return True

    def get_retry_after(self, key: str) -> int:
        with self.lock:
            if not self.requests[key]:
                return 0
            oldest = min(self.requests[key])
            return max(0, int(60 - (time.time() - oldest)))


rate_limiter = RateLimiter(requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)


def verify_api_key(x_api_key: Optional[str] = Header(default=None)) -> str:
    if settings.AUTH_MODE == "dev" and not settings.REQUIRE_API_KEY_IN_DEV:
        return "dev-mode"

    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="X-API-Key header required"
        )

    if x_api_key != settings.TASKFLOW_API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )

    return x_api_key


def rate_limit(request: Request, api_key: str = Depends(verify_api_key)):
    client_key = api_key if api_key != "dev-mode" else request.client.host

    if not rate_limiter.is_allowed(client_key):
        retry_after = rate_limiter.get_retry_after(client_key)
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(retry_after)}
        )

    return client_key


api_key_auth = Depends(verify_api_key)
rate_limited = Depends(rate_limit)

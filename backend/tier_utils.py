from enum import Enum
from datetime import datetime
import os
from typing import Optional

import redis
from fastapi import HTTPException, status

# ---------------------------------------------------------------------------
# Tier configuration
# ---------------------------------------------------------------------------


class UserTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    STUDENT = "student"


# Daily quotas per tier (None = unlimited)
DAILY_QUOTAS = {
    UserTier.FREE: {
        "summary": 2,
        "quiz": 1,
        "study_plan": 1,
        "analysis": 1,
    },
    UserTier.PRO: {
        # unlimited for paid users
    },
    UserTier.STUDENT: {
        # same as pro for now, can adjust later
    },
}

# ---------------------------------------------------------------------------
# Redis client helper
# ---------------------------------------------------------------------------

_redis_client: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=3,  # separate DB for quota tracking
            decode_responses=True,
        )
    return _redis_client


# ---------------------------------------------------------------------------
# Quota check utility
# ---------------------------------------------------------------------------


def check_and_increment_quota(user_id: str, tier: str, action: str):
    """Raise HTTPException 429 if user exceeded daily quota for the action."""
    tier_enum = UserTier(tier) if tier in UserTier._value2member_map_ else UserTier.FREE
    limits = DAILY_QUOTAS.get(tier_enum)
    # Unlimited tier
    if not limits or action not in limits:
        return  # no limit

    limit = limits[action]
    if limit is None:
        return  # unlimited

    # key pattern: quota:{user_id}:{YYYYMMDD}:{action}
    today = datetime.utcnow().strftime("%Y%m%d")
    key = f"quota:{user_id}:{today}:{action}"
    r = get_redis()
    current = r.incr(key)
    # set expiry 24h if new
    if current == 1:
        r.expire(key, 86400)
    if current > limit:
        # roll back increment to avoid drift
        r.decr(key)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily limit reached for {action}. Upgrade to Pro for unlimited access.",
        )

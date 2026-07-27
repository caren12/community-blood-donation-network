# Assigned to: Caren — Day 1 (Password reset endpoints)
import secrets
from datetime import datetime, timedelta

# In-memory store for MVP; swap for a DB table or Redis in production.
_reset_tokens = {}

RESET_TOKEN_TTL_MINUTES = 30


def generate_reset_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = {
        "user_id": user_id,
        "expires_at": datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES),
    }
    return token


def verify_reset_token(token: str):
    entry = _reset_tokens.get(token)
    if not entry:
        return None
    if entry["expires_at"] < datetime.utcnow():
        _reset_tokens.pop(token, None)
        return None
    return entry["user_id"]


def consume_reset_token(token: str):
    _reset_tokens.pop(token, None)

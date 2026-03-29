"""
Security — JWT auth, rate limiting, input sanitization.
Simplified for hackathon demo. No database dependency.
"""

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from core.config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, RATE_LIMIT_PER_MINUTE
import time
import re

security_scheme = HTTPBearer(auto_error=False)

# ── Demo Users (no DB needed) ──────────────────────────────────────
DEMO_USERS = {
    "demo@finsage.ai": {"password": "demo123", "name": "Demo User"},
    "judge@finsage.ai": {"password": "judge123", "name": "Judge"},
}

# ── JWT ─────────────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """Dependency — extracts user from JWT. Returns demo user if no token (for easy demo)."""
    if credentials is None:
        # Allow unauthenticated access for demo
        return {"sub": "demo@finsage.ai", "name": "Demo User"}
    return verify_token(credentials.credentials)

# ── Rate Limiting ───────────────────────────────────────────────────
_rate_store: dict = {}

async def rate_limit_middleware(request: Request, call_next):
    """Token bucket: N requests per minute per IP."""
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - 60

    requests = _rate_store.get(ip, [])
    requests = [t for t in requests if t > window_start]

    if len(requests) >= RATE_LIMIT_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

    requests.append(now)
    _rate_store[ip] = requests
    return await call_next(request)

# ── Input Sanitization ─────────────────────────────────────────────
INJECTION_PATTERNS = [
    r"ignore (previous|above|all) instructions",
    r"you are now",
    r"system prompt",
    r"<\|im_start\|>",
    r"###\s*(system|instruction)",
]

def sanitize_input(text: str) -> str:
    """Strip potential prompt injection attempts."""
    for p in INJECTION_PATTERNS:
        text = re.sub(p, "[REDACTED]", text, flags=re.IGNORECASE)
    return text[:5000]

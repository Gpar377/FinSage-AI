"""
FinSage AI — Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

# App
APP_NAME = "FinSage AI"
APP_VERSION = "1.0.0"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"

# Security
JWT_SECRET = os.getenv("JWT_SECRET", "finsage-demo-secret-key-change-in-prod-2025")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # relaxed for demo
RATE_LIMIT_PER_MINUTE = 30  # relaxed for demo

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Build allowed origins for CORS (support both single URL and comma-separated)
def get_allowed_origins():
    origins = [
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    # Add any additional origins from env
    extra_origins = os.getenv("EXTRA_CORS_ORIGINS", "")
    if extra_origins:
        origins.extend([url.strip() for url in extra_origins.split(",")])
    return list(set(origins))  # Remove duplicates

ALLOWED_ORIGINS = get_allowed_origins()

# Optional services (graceful degradation if unavailable)
REDIS_URL = os.getenv("REDIS_URL", None)
POSTGRES_URL = os.getenv("POSTGRES_URL", None)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", None)

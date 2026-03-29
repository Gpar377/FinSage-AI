"""
FinSage AI — FastAPI Application Entry Point
Multi-agent personal finance mentor for India.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from routers import auth, fire, tax, portfolio, health_score, life_event, couples
from core.config import APP_NAME, APP_VERSION, FRONTEND_URL
from compliance.guard import get_disclaimer
import time

app = FastAPI(
    title=APP_NAME,
    description="Multi-agent AI-powered personal finance mentor for India. "
                "Deterministic financial engines for tax, FIRE planning, and portfolio analysis.",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Security Headers ───────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
    response.headers["X-Powered-By"] = "FinSage AI"
    return response

# ── Routers ─────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(fire.router, prefix="/api/fire", tags=["FIRE Path Planner"])
app.include_router(tax.router, prefix="/api/tax", tags=["Tax Wizard"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio X-Ray"])
app.include_router(health_score.router, prefix="/api/health-score", tags=["Health Score"])
app.include_router(life_event.router, prefix="/api/life-event", tags=["Life Event Advisor"])
app.include_router(couples.router, prefix="/api/couples", tags=["Couples Planner"])

# ── Health Check ────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "version": APP_VERSION,
        "service": APP_NAME,
        "engines": ["tax", "fire", "portfolio", "health_score", "life_event", "couples"],
    }

@app.get("/disclaimer", tags=["System"])
async def disclaimer():
    return {"disclaimer": get_disclaimer()}

@app.get("/", tags=["System"])
async def root():
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "message": "Welcome to FinSage AI — your AI-powered personal finance mentor",
    }

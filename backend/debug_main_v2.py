from fastapi import FastAPI
import time

print("Importing routers...")
try: from routers import auth; print("Auth imported")
except Exception as e: print(f"Auth failed: {e}")
try: from routers import fire; print("Fire imported")
except Exception as e: print(f"Fire failed: {e}")
try: from routers import tax; print("Tax imported")
except Exception as e: print(f"Tax failed: {e}")
# Skipping portfolio for now
# try: from routers import portfolio; print("Portfolio imported")
# except Exception as e: print(f"Portfolio failed: {e}")
try: from routers import health_score; print("Health imported")
except Exception as e: print(f"Health failed: {e}")
try: from routers import life_event; print("Life imported")
except Exception as e: print(f"Life failed: {e}")
try: from routers import couples; print("Couples imported")
except Exception as e: print(f"Couples failed: {e}")

app = FastAPI()
app.include_router(auth.router, prefix="/auth")
app.include_router(fire.router, prefix="/api/fire")
app.include_router(tax.router, prefix="/api/tax")
# app.include_router(portfolio.router, prefix="/api/portfolio")
app.include_router(health_score.router, prefix="/api/health-score")
app.include_router(life_event.router, prefix="/api/life-event")
app.include_router(couples.router, prefix="/api/couples")

@app.get("/health")
def health(): return {"status": "ok"}

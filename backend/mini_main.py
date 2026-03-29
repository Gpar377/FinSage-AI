from fastapi import FastAPI
from routers import tax

app = FastAPI()
app.include_router(tax.router, prefix="/api/tax")

@app.get("/health")
def health(): return {"status": "ok"}

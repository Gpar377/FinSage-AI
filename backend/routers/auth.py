"""
Auth Router — simplified for demo.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.security import create_access_token, DEMO_USERS

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = DEMO_USERS.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": req.email, "name": user["name"]})
    return TokenResponse(access_token=token, user_name=user["name"])


@router.post("/demo-token", response_model=TokenResponse)
async def demo_token():
    """Quick demo token — no login required."""
    token = create_access_token({"sub": "demo@finsage.ai", "name": "Demo User"})
    return TokenResponse(access_token=token, user_name="Demo User")

"""
Life Event Advisor Router — handles financial planning for life events.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from core.security import get_current_user

router = APIRouter()


class LifeEventRequest(BaseModel):
    event_type: str  # "bonus", "marriage", "baby", "inheritance", "job_change", "home_purchase"
    amount: float = Field(ge=0, default=0)
    monthly_income: float = Field(gt=0)
    age: int = Field(ge=18, le=80)
    existing_investments: float = Field(ge=0, default=0)
    tax_bracket: str = Field(default="30%")  # "0%", "5%", "20%", "30%"
    risk_profile: str = Field(default="moderate")  # "conservative", "moderate", "aggressive"


@router.post("/advice")
async def get_life_event_advice(req: LifeEventRequest, user: dict = Depends(get_current_user)):
    """AI-powered life event financial advisor."""
    advice = {"event_type": req.event_type, "recommendations": []}

    if req.event_type == "bonus":
        advice["title"] = f"💰 Bonus Allocation Plan — ₹{req.amount/100000:.1f}L"
        advice["recommendations"] = [
            {"category": "Emergency Fund Top-up", "pct": 20, "amount": round(req.amount * 0.20), "reason": "Ensure 6-month runway before investing"},
            {"category": "Tax-Saving (80C)", "pct": 15, "amount": round(req.amount * 0.15), "reason": "ELSS funds for 80C + equity growth"},
            {"category": "Equity Mutual Funds", "pct": 35, "amount": round(req.amount * 0.35), "reason": "Lump sum into flexi-cap/index for long-term"},
            {"category": "Debt Repayment", "pct": 15, "amount": round(req.amount * 0.15), "reason": "Pre-pay high-interest loans first"},
            {"category": "Personal Reward", "pct": 15, "amount": round(req.amount * 0.15), "reason": "You earned it — guilt-free spending"},
        ]
    elif req.event_type == "marriage":
        advice["title"] = "💍 Marriage Financial Checklist"
        advice["recommendations"] = [
            {"category": "Wedding Budget", "pct": 40, "amount": round(req.amount * 0.40), "reason": "Set and stick to a budget"},
            {"category": "Joint Emergency Fund", "pct": 20, "amount": round(req.amount * 0.20), "reason": "Rebuild emergency buffer post-wedding"},
            {"category": "Health Insurance", "pct": 10, "amount": round(req.amount * 0.10), "reason": "Add spouse to health cover or get family floater"},
            {"category": "Joint Investments", "pct": 30, "amount": round(req.amount * 0.30), "reason": "Start joint SIPs for shared goals"},
        ]
    elif req.event_type == "baby":
        advice["title"] = "👶 New Baby Financial Plan"
        advice["recommendations"] = [
            {"category": "Emergency Fund", "pct": 15, "amount": round(req.monthly_income * 12 * 0.15), "reason": "Increase to 9 months with new dependent"},
            {"category": "Child Education Fund (SIP)", "pct": 25, "amount": round(req.monthly_income * 0.25), "reason": "Start ₹5K-10K SIP in flexi-cap for 18-year horizon"},
            {"category": "Life Insurance", "pct": 10, "amount": round(req.monthly_income * 12 * 10 * 0.003), "reason": "Ensure 10-15× income term cover"},
            {"category": "Health Insurance Upgrade", "pct": 10, "amount": 20000, "reason": "Upgrade family floater to ₹10L+ cover"},
        ]
    elif req.event_type == "inheritance":
        advice["title"] = f"🏠 Inheritance Management — ₹{req.amount/100000:.1f}L"
        advice["recommendations"] = [
            {"category": "Park in Liquid Fund", "pct": 100, "amount": round(req.amount), "reason": "Park for 3-6 months. Don't rush to invest."},
            {"category": "Tax Assessment", "pct": 0, "amount": 0, "reason": "Inherited assets may have capital gains implications on sale. Consult CA."},
            {"category": "STP to Equity (post 3 months)", "pct": 60, "amount": round(req.amount * 0.60), "reason": "Systematic Transfer Plan over 6-12 months into diversified equity"},
            {"category": "Debt/Gold Allocation", "pct": 30, "amount": round(req.amount * 0.30), "reason": "Stability component — 20% debt + 10% sovereign gold bonds"},
            {"category": "Charitable Donation (80G)", "pct": 10, "amount": round(req.amount * 0.10), "reason": "Optional — 50-100% tax deduction under Section 80G"},
        ]
    else:
        advice["title"] = f"📋 Financial Review — {req.event_type}"
        advice["recommendations"] = [
            {"category": "Emergency Fund Check", "pct": 0, "amount": 0, "reason": "Ensure 6 months expenses covered"},
            {"category": "Insurance Review", "pct": 0, "amount": 0, "reason": "Update nominees, beneficiaries, and coverage amounts"},
            {"category": "Goal Re-alignment", "pct": 0, "amount": 0, "reason": "Re-run FIRE planner with updated numbers"},
        ]

    advice["disclaimer"] = "⚠️ AI guidance only. Not SEBI-registered advice. Consult a licensed advisor."
    return advice

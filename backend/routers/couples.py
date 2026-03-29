"""
Couples Money Planner Router — joint financial optimization.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from core.security import get_current_user

router = APIRouter()


class PartnerInput(BaseModel):
    name: str = "Partner"
    monthly_income: float = Field(gt=0)
    employer_type: str = Field(default="private")  # "private", "government", "self-employed"
    hra_received: float = Field(ge=0, default=0)
    rent_paid: float = Field(ge=0, default=0)
    existing_80c: float = Field(ge=0, default=0)
    existing_nps: float = Field(ge=0, default=0)
    has_health_insurance: bool = False
    existing_investments: float = Field(ge=0, default=0)


class CouplesRequest(BaseModel):
    partner_a: PartnerInput
    partner_b: PartnerInput
    joint_monthly_expenses: float = Field(ge=0, default=0)
    joint_goals: str = Field(default="")  # free text


@router.post("/optimize")
async def optimize_couple_finances(req: CouplesRequest, user: dict = Depends(get_current_user)):
    """Joint financial optimization across both incomes."""
    combined_income = (req.partner_a.monthly_income + req.partner_b.monthly_income) * 12
    combined_investments = req.partner_a.existing_investments + req.partner_b.existing_investments

    # HRA optimization — claim on higher rent payer
    hra_advice = "Both partners can claim HRA independently if both pay rent. " \
                 "Optimize: higher earner claims HRA in metro, or split rent receipts."

    # NPS optimization
    nps_advice = []
    for p in [req.partner_a, req.partner_b]:
        if p.existing_nps < 50000:
            gap = 50000 - p.existing_nps
            nps_advice.append(f"{p.name}: ₹{gap:,.0f} NPS gap under 80CCD(1B) — saves ~₹{gap * 0.30:,.0f} tax")

    # SIP split optimization
    total_sip = combined_income * 0.20 / 12  # 20% savings rate
    sip_split = {
        "partner_a_sip": round(total_sip * req.partner_a.monthly_income / (req.partner_a.monthly_income + req.partner_b.monthly_income)),
        "partner_b_sip": round(total_sip * req.partner_b.monthly_income / (req.partner_a.monthly_income + req.partner_b.monthly_income)),
    }

    # Insurance optimization
    insurance_advice = "Get individual term covers (not joint policy). " \
                       "Family floater health insurance is cost-effective for couple + dependents."

    return {
        "combined_annual_income": combined_income,
        "combined_investments": combined_investments,
        "combined_net_worth": combined_investments,
        "savings_rate_target": "20% of combined income",
        "monthly_sip_target": round(total_sip),
        "sip_split": sip_split,
        "hra_optimization": hra_advice,
        "nps_optimization": nps_advice,
        "insurance_advice": insurance_advice,
        "recommendations": [
            "File taxes individually (not joint — India doesn't allow joint filing)",
            "Claim HRA on higher earning partner's return if only one pays rent",
            "Both can independently claim 80C (₹1.5L each = ₹3L total deduction)",
            "Consider NPS for both — additional ₹50K each under 80CCD(1B)",
            "Maintain joint emergency fund = 6 months of combined expenses",
        ],
        "disclaimer": "⚠️ AI guidance only. Not SEBI-registered advice."
    }

"""
Health Score Router — quick financial wellness assessment.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from core.security import get_current_user

router = APIRouter()


class HealthScoreRequest(BaseModel):
    monthly_income: float = Field(gt=0)
    monthly_expenses: float = Field(ge=0)
    emergency_fund: float = Field(ge=0, default=0)
    has_health_insurance: bool = False
    health_cover_amount: float = Field(ge=0, default=0)
    has_term_insurance: bool = False
    term_cover_amount: float = Field(ge=0, default=0)
    total_investments: float = Field(ge=0, default=0)
    num_asset_classes: int = Field(ge=0, default=0)
    total_debt: float = Field(ge=0, default=0)
    monthly_emi: float = Field(ge=0, default=0)
    tax_saving_investments: float = Field(ge=0, default=0)
    retirement_corpus: float = Field(ge=0, default=0)
    age: int = Field(ge=18, le=80)


@router.post("/calculate")
async def calculate_health_score(req: HealthScoreRequest, user: dict = Depends(get_current_user)):
    """5-minute financial wellness check across 6 dimensions."""
    scores = {}
    details = {}

    # 1. Emergency Preparedness (0-100)
    months_covered = req.emergency_fund / req.monthly_expenses if req.monthly_expenses > 0 else 0
    emergency_score = min(100, (months_covered / 6) * 100)
    scores["emergency_preparedness"] = round(emergency_score)
    details["emergency_preparedness"] = {
        "months_covered": round(months_covered, 1),
        "target_months": 6,
        "gap": max(0, round((6 - months_covered) * req.monthly_expenses)),
        "status": "✅ Adequate" if months_covered >= 6 else "⚠️ Needs attention"
    }

    # 2. Insurance Coverage (0-100)
    insurance_score = 0
    if req.has_health_insurance:
        health_adequacy = min(50, (req.health_cover_amount / 1000000) * 50)
        insurance_score += health_adequacy
    if req.has_term_insurance:
        annual_income = req.monthly_income * 12
        term_adequacy = min(50, (req.term_cover_amount / (annual_income * 10)) * 50)
        insurance_score += term_adequacy
    scores["insurance_coverage"] = round(insurance_score)
    details["insurance_coverage"] = {
        "health_insured": req.has_health_insurance,
        "health_cover": req.health_cover_amount,
        "term_insured": req.has_term_insurance,
        "term_cover": req.term_cover_amount,
        "recommended_term": req.monthly_income * 12 * 15,
        "status": "✅ Well covered" if insurance_score >= 70 else "⚠️ Under-insured"
    }

    # 3. Investment Diversification (0-100)
    diversification_score = min(100, req.num_asset_classes * 20)
    if req.total_investments > 0:
        investment_ratio = req.total_investments / (req.monthly_income * 12)
        diversification_score = min(100, diversification_score * min(1, investment_ratio))
    scores["investment_diversification"] = round(diversification_score)
    details["investment_diversification"] = {
        "asset_classes": req.num_asset_classes,
        "target_classes": 5,
        "total_investments": req.total_investments,
        "status": "✅ Well diversified" if diversification_score >= 60 else "⚠️ Needs diversification"
    }

    # 4. Debt Health (0-100)
    if req.total_debt == 0:
        debt_score = 100
    else:
        emi_to_income = req.monthly_emi / req.monthly_income if req.monthly_income > 0 else 1
        debt_score = max(0, 100 - (emi_to_income * 250))  # 40% EMI/income = 0 score
    scores["debt_health"] = round(debt_score)
    details["debt_health"] = {
        "total_debt": req.total_debt,
        "monthly_emi": req.monthly_emi,
        "emi_to_income_ratio": round(req.monthly_emi / req.monthly_income * 100, 1) if req.monthly_income > 0 else 0,
        "safe_ratio": "< 30%",
        "status": "✅ Healthy" if debt_score >= 70 else "⚠️ High debt burden"
    }

    # 5. Tax Efficiency (0-100)
    max_80c = 150000
    tax_efficiency = min(100, (req.tax_saving_investments / max_80c) * 100) if max_80c > 0 else 0
    scores["tax_efficiency"] = round(tax_efficiency)
    details["tax_efficiency"] = {
        "current_80c": req.tax_saving_investments,
        "max_80c": max_80c,
        "gap": max(0, max_80c - req.tax_saving_investments),
        "status": "✅ Maximized" if tax_efficiency >= 90 else "⚠️ Tax savings available"
    }

    # 6. Retirement Readiness (0-100)
    years_to_retire = max(1, 60 - req.age)
    annual_expenses = req.monthly_expenses * 12
    required_corpus = annual_expenses * ((1.06 ** years_to_retire) / 0.04)  # inflation-adjusted SWR
    retirement_score = min(100, (req.retirement_corpus / required_corpus) * 100) if required_corpus > 0 else 0
    scores["retirement_readiness"] = round(retirement_score)
    details["retirement_readiness"] = {
        "current_corpus": req.retirement_corpus,
        "required_corpus": round(required_corpus),
        "gap": max(0, round(required_corpus - req.retirement_corpus)),
        "years_to_retire": years_to_retire,
        "status": "✅ On track" if retirement_score >= 50 else "⚠️ Behind target"
    }

    # Overall score (weighted)
    weights = {
        "emergency_preparedness": 0.20,
        "insurance_coverage": 0.20,
        "investment_diversification": 0.15,
        "debt_health": 0.15,
        "tax_efficiency": 0.10,
        "retirement_readiness": 0.20,
    }
    overall = sum(scores[k] * weights[k] for k in scores)

    if overall >= 80:
        grade = "A"
        verdict = "Excellent financial health!"
    elif overall >= 60:
        grade = "B"
        verdict = "Good, but room for improvement."
    elif overall >= 40:
        grade = "C"
        verdict = "Fair — several areas need attention."
    else:
        grade = "D"
        verdict = "Needs significant improvement."

    return {
        "overall_score": round(overall),
        "grade": grade,
        "verdict": verdict,
        "dimension_scores": scores,
        "dimension_details": details,
        "top_priority": min(scores, key=scores.get),
    }

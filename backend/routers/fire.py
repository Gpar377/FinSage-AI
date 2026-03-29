"""
FIRE Path Planner Router — dynamic updates supported.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from engines.fire_engine import FIREInput, calculate_fire_plan
from core.security import get_current_user
from compliance.audit import log_event
from compliance.guard import get_disclaimer

router = APIRouter()


class FireRequest(BaseModel):
    current_age: int = Field(ge=18, le=70)
    target_retirement_age: int = Field(ge=25, le=80)
    current_income_annual: float = Field(gt=0)
    monthly_expenses: float = Field(ge=0)
    existing_mf: float = Field(ge=0, default=0)
    existing_ppf: float = Field(ge=0, default=0)
    existing_epf: float = Field(ge=0, default=0)
    existing_nps: float = Field(ge=0, default=0)
    existing_fd: float = Field(ge=0, default=0)
    target_monthly_draw: float = Field(gt=0)
    inflation_rate: float = Field(ge=0.01, le=0.15, default=0.06)
    expected_return_equity: float = Field(ge=0.05, le=0.25, default=0.12)
    expected_return_debt: float = Field(ge=0.03, le=0.15, default=0.07)


class FireCompareRequest(BaseModel):
    scenario_a: FireRequest
    scenario_b: FireRequest


@router.post("/plan")
async def get_fire_plan(req: FireRequest, user: dict = Depends(get_current_user)):
    """
    FIRE plan — fully deterministic, instant response, dynamic updates.
    Frontend calls this on every input change (debounced).
    """
    log_event(user.get("sub", "anon"), "FIRE_PLAN_REQUEST", {
        "age": req.current_age, "retire_at": req.target_retirement_age
    }, agent="fire_agent")

    inp = FIREInput(**req.model_dump())
    result = calculate_fire_plan(inp)

    log_event(user.get("sub", "anon"), "FIRE_PLAN_RESPONSE", {
        "corpus_cr": result.get("required_corpus_cr"),
        "sip_needed": result.get("monthly_sip_needed"),
    }, agent="fire_agent")

    result["disclaimer"] = get_disclaimer()
    return result


@router.post("/compare-scenarios")
async def compare_scenarios(req: FireCompareRequest, user: dict = Depends(get_current_user)):
    """Side-by-side FIRE plan comparison (what-if simulator)."""
    plan_a = calculate_fire_plan(FIREInput(**req.scenario_a.model_dump()))
    plan_b = calculate_fire_plan(FIREInput(**req.scenario_b.model_dump()))

    return {
        "scenario_a": plan_a,
        "scenario_b": plan_b,
        "delta": {
            "corpus_diff_cr": round((plan_a["required_corpus"] - plan_b["required_corpus"]) / 10000000, 2),
            "sip_diff": plan_a["monthly_sip_needed"] - plan_b["monthly_sip_needed"],
            "years_diff": plan_a["years_to_retire"] - plan_b["years_to_retire"],
        },
        "disclaimer": get_disclaimer()
    }

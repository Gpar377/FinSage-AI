"""
FIRE (Financial Independence, Retire Early) Engine.
All deterministic. Returns structured data for frontend rendering.
Supports dynamic updates — any input change produces a new plan without re-run.
"""

import math
from dataclasses import dataclass
from typing import List, Dict, Optional


@dataclass
class FIREInput:
    current_age: int
    target_retirement_age: int
    current_income_annual: float
    monthly_expenses: float
    existing_mf: float
    existing_ppf: float
    existing_epf: float = 0
    existing_nps: float = 0
    existing_fd: float = 0
    monthly_sip: float = 0
    expected_return_equity: float = 0.12    # 12% CAGR
    expected_return_debt: float = 0.07      # 7% CAGR
    inflation_rate: float = 0.06            # 6% CPI
    swr: float = 0.04                       # 4% safe withdrawal rate
    target_monthly_draw: float = 0          # today's value
    income_growth_rate: float = 0.08        # 8% annual salary growth
    life_expectancy: int = 85


def calculate_fire_plan(inp: FIREInput) -> dict:
    """
    Produces complete FIRE plan:
    - Required corpus (inflation-adjusted)
    - Monthly SIP needed
    - SIP split by fund category
    - Asset allocation glidepath
    - Month-by-month plan (first 24 months)
    - Insurance gap analysis
    - Key milestones
    """
    years_to_retire = inp.target_retirement_age - inp.current_age
    years_in_retirement = inp.life_expectancy - inp.target_retirement_age

    if years_to_retire <= 0:
        return {"error": "Target retirement age must be greater than current age"}

    # ── Inflation-Adjusted Monthly Draw at Retirement ──
    adjusted_draw = inp.target_monthly_draw * ((1 + inp.inflation_rate) ** years_to_retire)
    annual_draw = adjusted_draw * 12

    # ── Required Corpus (SWR-based) ──
    required_corpus = annual_draw / inp.swr

    # ── Current Portfolio ──
    existing_total = (
        inp.existing_mf + inp.existing_ppf + inp.existing_epf +
        inp.existing_nps + inp.existing_fd
    )

    # Blended return based on current allocation (assume 60/40 equity-debt)
    equity_weight = 0.60
    debt_weight = 0.40
    blended_return = (equity_weight * inp.expected_return_equity +
                      debt_weight * inp.expected_return_debt)

    # Project existing investments
    projected_existing = existing_total * ((1 + blended_return) ** years_to_retire)

    # ── Monthly SIP Needed to Bridge Gap ──
    gap = max(0, required_corpus - projected_existing)
    monthly_return = blended_return / 12
    n_months = years_to_retire * 12

    if monthly_return > 0 and n_months > 0:
        # Future Value of Annuity formula
        sip_needed = gap * monthly_return / (((1 + monthly_return) ** n_months) - 1)
    else:
        sip_needed = gap / max(n_months, 1)

    # ── Asset Allocation Glidepath ──
    # Rule: Start aggressive, shift 3% to debt every 2 years
    glidepath = []
    for age in range(inp.current_age, inp.target_retirement_age + 1):
        years_left = inp.target_retirement_age - age
        equity_pct = max(20, min(85, 25 + years_left * 3))
        debt_pct = 100 - equity_pct
        glidepath.append({
            "age": age,
            "equity_pct": equity_pct,
            "debt_pct": debt_pct,
        })

    # ── SIP Split by Fund Category ──
    sip_split = {
        "large_cap_index": round(sip_needed * 0.35),
        "flexi_cap": round(sip_needed * 0.20),
        "mid_cap": round(sip_needed * 0.15),
        "small_cap": round(sip_needed * 0.10),
        "debt_funds": round(sip_needed * 0.15),
        "gold_fund": round(sip_needed * 0.05),
    }

    # ── Insurance Gap Analysis ──
    required_term_cover = inp.current_income_annual * 15
    required_health_cover = 1000000  # ₹10L minimum
    insurance = {
        "term_cover_needed": required_term_cover,
        "term_cover_note": f"Recommended: ₹{required_term_cover/10000000:.1f} Cr term insurance (15× annual income of ₹{inp.current_income_annual/100000:.0f}L)",
        "health_cover_needed": required_health_cover,
        "health_cover_note": "Minimum ₹10L health cover for self + family. Consider ₹25L super top-up.",
        "estimated_term_premium": round(required_term_cover * 0.003),  # ~0.3% of cover
        "estimated_health_premium": 15000,  # approximate
    }

    # ── Month-by-Month Plan (first 24 months) ──
    monthly_plan = []
    corpus = existing_total
    for month in range(1, 25):
        growth = corpus * (blended_return / 12)
        corpus = corpus + growth + sip_needed
        monthly_plan.append({
            "month": month,
            "sip": round(sip_needed),
            "growth": round(growth),
            "corpus": round(corpus),
        })

    # ── Year-by-Year Projection ──
    yearly_plan = []
    corpus_yearly = existing_total
    for year in range(1, years_to_retire + 1):
        annual_sip = sip_needed * 12
        growth = corpus_yearly * blended_return
        corpus_yearly = corpus_yearly + growth + annual_sip
        yearly_plan.append({
            "year": year,
            "age": inp.current_age + year,
            "annual_sip": round(annual_sip),
            "corpus": round(corpus_yearly),
            "corpus_cr": round(corpus_yearly / 10000000, 2),
        })

    # ── Key Milestones ──
    milestones = []
    for yp in yearly_plan:
        if yp["corpus"] >= required_corpus * 0.25 and not any(m["type"] == "25%" for m in milestones):
            milestones.append({"type": "25%", "age": yp["age"], "year": yp["year"], "corpus_cr": yp["corpus_cr"]})
        if yp["corpus"] >= required_corpus * 0.50 and not any(m["type"] == "50%" for m in milestones):
            milestones.append({"type": "50%", "age": yp["age"], "year": yp["year"], "corpus_cr": yp["corpus_cr"]})
        if yp["corpus"] >= required_corpus * 0.75 and not any(m["type"] == "75%" for m in milestones):
            milestones.append({"type": "75%", "age": yp["age"], "year": yp["year"], "corpus_cr": yp["corpus_cr"]})
        if yp["corpus"] >= required_corpus and not any(m["type"] == "100%" for m in milestones):
            milestones.append({"type": "100%", "age": yp["age"], "year": yp["year"], "corpus_cr": yp["corpus_cr"]})

    # ── Emergency Fund ──
    emergency_fund_target = inp.monthly_expenses * 6
    emergency_fund_note = f"Maintain ₹{emergency_fund_target/100000:.1f}L emergency fund (6 months expenses) in liquid fund/savings"

    return {
        "required_corpus": round(required_corpus),
        "required_corpus_cr": round(required_corpus / 10000000, 2),
        "projected_existing": round(projected_existing),
        "projected_existing_cr": round(projected_existing / 10000000, 2),
        "gap": round(gap),
        "gap_cr": round(gap / 10000000, 2),
        "monthly_sip_needed": round(sip_needed),
        "annual_sip_needed": round(sip_needed * 12),
        "sip_split": sip_split,
        "adjusted_monthly_draw": round(adjusted_draw),
        "years_to_retire": years_to_retire,
        "years_in_retirement": years_in_retirement,
        "blended_return_pct": round(blended_return * 100, 1),
        "glidepath": glidepath,
        "monthly_plan": monthly_plan,
        "yearly_plan": yearly_plan,
        "milestones": milestones,
        "insurance": insurance,
        "emergency_fund": emergency_fund_note,
        "existing_total": existing_total,
        "existing_total_l": round(existing_total / 100000, 1),
        "summary": (
            f"To retire at {inp.target_retirement_age} with ₹{inp.target_monthly_draw/1000:.0f}K/month "
            f"(today's value → ₹{adjusted_draw/1000:.0f}K at retirement), you need a corpus of "
            f"₹{required_corpus/10000000:.2f} Cr. Your existing ₹{existing_total/100000:.0f}L will grow to "
            f"₹{projected_existing/10000000:.2f} Cr. Start a SIP of ₹{sip_needed:,.0f}/month to bridge the gap."
        ),
    }

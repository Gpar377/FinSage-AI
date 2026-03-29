# FinSage AI — Architecture Document

**Version**: 1.0 | **Date**: March 2025  
**Track**: ET Hackathon 2025 — AI Money Mentor  

---

## 1. System Overview

FinSage AI is a **deterministic multi-agent financial planning system** for Indian retail investors. It autonomously collects user financial inputs, runs multi-step calculations using Finance Act 2024 / SEBI-compliant rules, and produces specific, actionable plans without requiring the user to interpret raw numbers.

The core architectural decision is **deterministic math over LLM generation**. Every financial number is produced by pure Python engines — not language models. This eliminates hallucination risk, enables instant response (< 500ms), and allows full calculation transparency (every rupee is traceable).

---

## 2. Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════╗
║                    USER INTERFACE LAYER (React/Vite)                 ║
║                                                                      ║
║   ┌─────────────────────────┐    ┌────────────────────────────────┐  ║
║   │   AI Mentor Sidebar     │    │   Financial Strategy Canvas    │  ║
║   │   ─────────────────     │    │   ──────────────────────────   │  ║
║   │  • Chat interface       │    │  ┌──────┐ ┌──────┐ ┌──────┐   │  ║
║   │  • Quick actions        │    │  │ Tax  │ │FIRE  │ │ MF   │   │  ║
║   │  • Context-aware resp.  │    │  │Wizard│ │Plann.│ │X-Ray │   │  ║
║   │  • Markdown rendering   │    │  └──────┘ └──────┘ └──────┘   │  ║
║   │  • Action buttons        │    │  ┌──────┐ ┌──────┐ ┌──────┐   │  ║
║   └─────────────│───────────┘    │  │Hlth  │ │Life  │ │Cpl   │   │  ║
║                 │                │  │Score │ │Event │ │Plnr  │   │  ║
╚═════════════════│════════════════╧══╧══════╧═╧══════╧═╧══════╧═══╝
                  │                         │
                  └──────────┬──────────────┘
                    REST/HTTP │  (Vite proxy → port 8000)
                             │
╔════════════════════════════╪═════════════════════════════════════════╗
║             FASTAPI ORCHESTRATION LAYER (port 8000)                  ║
║                            │                                         ║
║   ┌────────────────────────▼──────────────────────────────────────┐  ║
║   │                 REQUEST ROUTING LAYER                          │  ║
║   │    JWT Auth Middleware → Route Matching → Agent Selection     │  ║
║   └──┬──────────┬──────────┬───────────┬───────────┬─────────────┘  ║
║      │          │          │           │           │                  ║
║  ┌───▼──┐  ┌───▼──┐  ┌────▼───┐  ┌────▼──┐  ┌────▼────┐  ┌──────┐  ║
║  │ Tax  │  │FIRE  │  │Portf. │  │Health │  │ Life   │  │Couple│  ║
║  │Agent │  │Agent │  │Agent  │  │Agent  │  │ Event  │  │Agent │  ║
║  └───┬──┘  └───┬──┘  └────┬───┘  └────┬──┘  │Agent  │  └──┬───┘  ║
║      │          │          │           │     └────┬───┘      │      ║
║      ▼          ▼          ▼           ▼          ▼          ▼      ║
║  ┌──────┐  ┌──────┐  ┌─────────┐  ┌──────┐  ┌──────┐  ┌──────┐   ║
║  │Tax   │  │FIRE  │  │Portfolio│  │Health│  │Life  │  │Couple│   ║
║  │Engine│  │Engine│  │Engine   │  │Engine│  │Engine│  │Engine│   ║
║  │      │  │      │  │         │  │      │  │      │  │      │   ║
║  │F.Act │  │SWR/  │  │XIRR/    │  │6-dim │  │Event │  │HRA/  │   ║
║  │2024  │  │FV Ann│  │Overlap/ │  │score │  │alloc.│  │NPS/  │   ║
║  │slabs │  │uity  │  │Rebal.   │  │model │  │plan  │  │SIP   │   ║
║  └──────┘  └──────┘  └─────────┘  └──────┘  └──────┘  └──────┘   ║
║                                                                      ║
║   ┌────────────────────────────────────────────────────────────────┐ ║
║   │                  COMPLIANCE GUARD (Post-Processor)              │ ║
║   │  Every agent output passes through this before reaching user:  │ ║
║   │  1. SEBI disclaimer injection                                   │ ║
║   │  2. 8 blocked-pattern regex scan                                │ ║
║   │  3. Number cross-validation (±5% threshold)                     │ ║
║   │  4. Audit trail log (timestamp, user, agent, data)              │ ║
║   └────────────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 3. Agent Roles & Responsibilities

### 3.1 Tax Agent (`routers/tax.py` + `engines/tax_engine.py`)

**Role**: Compute exact Income Tax under both regimes for FY 2024-25.

**Input**: Gross salary, HRA details, deductions (80C, 80D, 80CCD, 24b, etc.)

**Processing Steps** (autonomous, no human intervention):
1. Validate and cap all deduction inputs against statutory limits
2. Calculate HRA exemption using all 3 conditions of Section 10(13A)
3. Apply Standard Deduction (₹75,000 for FY 2024-25)
4. Compute taxable income under both regimes
5. Apply slab-wise tax computation with 87A rebate logic
6. Add 4% Health & Education Cess
7. Generate "missed deduction" flags (80D unused, 80CCD underfilled, etc.)
8. Produce ranked tax-saving suggestions

**Output**: Full step-by-step trace, both regime totals, better regime recommendation, missed deductions with ₹ savings.

**Edge Cases Handled**:
- Income exactly at slab boundaries (marginal relief)
- HRA when rent < 10% of basic (zero exemption case)
- 87A rebate for new regime (₹7L threshold, ₹25K cap)

---

### 3.2 FIRE Agent (`routers/fire.py` + `engines/fire_engine.py`)

**Role**: Build complete financial independence roadmap.

**Processing Steps**:
1. Inflation-adjust target monthly draw to retirement date
2. Compute Required Corpus = (Annual Inflation-Adjusted Draw) / SWR (4%)
3. Project existing investments at blended returns (60/40 equity-debt by default)
4. Calculate SIP needed using Future Value of Annuity: `SIP = Gap × r / ((1+r)^n - 1)`
5. Split SIP into 6 fund categories (index, flexi-cap, mid-cap, small-cap, debt, gold)
6. Generate asset allocation glidepath (equity reduces 3% every 2 years near retirement)
7. Compute 4 milestone checkpoints (25%, 50%, 75%, 100% of corpus)
8. Calculate insurance gaps (15× annual income term cover)
9. Produce month-by-month plan for first 24 months + year-by-year through retirement

**Dynamic Recompute**: Frontend calls this endpoint on every slider/input change (debounced 400ms). The engine produces a complete new plan instantaneously — no state maintained between calls.

**Compare Scenarios Endpoint**: Accepts two FIRE scenarios, returns delta (corpus diff, SIP diff, years diff) — demonstrates autonomous multi-variable reasoning.

---

### 3.3 Portfolio Agent (`routers/portfolio.py` + `engines/portfolio_engine.py`)

**Role**: Institutional-grade MF portfolio analysis.

**Processing Steps**:
1. Calculate true XIRR using Newton-Raphson iteration (not IRR approximation)
2. Detect stock-level overlap across funds using Jaccard Similarity coefficient
3. Classify overlap severity (low < 3 stocks, medium 3-5, high > 5)
4. Identify top overlapping stocks with combined exposure percentage
5. Compute expense ratio drag (annual cost of regular vs direct plan delta)
6. Generate tax-window-aware rebalancing recommendations:
   - Funds held < 1 year → advise waiting for LTCG window (10% vs STCG 15%)
   - Flag high-overlap funds for consolidation
   - Suggest direct plan switches where TER delta > 1%

**Edge Case**: Portfolio with significant overlap — detected via shared holding stocks, not fund names (funds with different names can hold same stocks).

---

### 3.4 Health Score Agent (`routers/health_score.py`)

**Role**: 6-dimension financial wellness assessment.

**Dimensions**: Emergency Preparedness, Insurance Coverage, Investment Diversification, Debt Health, Tax Efficiency, Retirement Readiness.

Each dimension scored 0-100 with specific calculation rules. Overall score = weighted average. Output includes priority remediation actions ordered by impact.

---

### 3.5 Life Event Agent (`routers/life_event.py`)

**Role**: Capital deployment strategy for windfall events (bonus, inheritance, marriage, baby).

Uses user's financial context (tax bracket, risk profile, existing investments) from current session to build event-specific allocation plans. Output is a ranked list of allocations with percentages, ₹ amounts, and reasons — not generic advice.

---

### 3.6 Couples Agent (`routers/couples.py`)

**Role**: Dual-income household financial optimisation.

Analyses: HRA claim optimisation across both incomes (city-specific), NPS matching calculations, SIP split for tax efficiency, joint vs individual insurance recommendations. Computes combined net worth trajectory.

---

## 4. Agent Communication Pattern

Agents do **not** communicate directly with each other in the current architecture. The **user profile** (inputs provided per session) acts as the shared context. The AI Chat sidebar maintains this context in memory and passes it when calling multiple agents sequentially.

In the extended roadmap, a **Financial Context Graph** in Redis would persist this shared state across agents for true multi-agent coordination.

```
User Input
    │
    ▼
[Chat Sidebar Context] ──────────────────────┐
    │                                         │
    ▼                                         ▼
[Tax Agent] ──outputs─→ tax_bracket    [FIRE Agent uses]
    │                                         │
    ▼                                         ▼
[Compliance Guard] ──────────────→ [User Response]
```

---

## 5. Compliance & Guardrail Architecture

The **Compliance Guard** (`compliance/guard.py`) is the mandatory post-processor for all agent outputs:

```python
# Every API endpoint calls validate_output() before returning
result = validate_output(content=response_text, context="tax_agent")
# Returns: {passed, content (with disclaimer), flags}
```

**Guardrail Layers**:
1. **Input Validation**: Pydantic models cap all inputs at statutory limits (80C ≤ ₹1.5L, etc.)
2. **Pattern Blocking**: 8 regex patterns block illegal advisory language
3. **Disclaimer Injection**: SEBI disclaimer appended to every response automatically
4. **Number Cross-Validation**: For LLM-generated content, deviations > 5% from engine values are overridden
5. **Audit Trail**: Every request/response logged with agent tag and timestamp

---

## 6. Error Handling & Graceful Degradation

| Failure Mode | Behaviour |
|-------------|-----------|
| Backend unavailable | Frontend shows "Terminal Error" with retry prompt |
| Invalid input (age > 70, etc.) | Pydantic validates, returns 422 with field-level errors |
| XIRR non-convergence | Falls back to simple IRR approximation, flags in response |
| Missing optional inputs | All financial inputs have defaults; engine runs with assumptions stated |
| Redis unavailable | Falls through to stateless operation (no context persistence) |
| Auth token expired/missing | Demo mode: anonymous token auto-generated for local demo |

---

## 7. Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 19 + Vite + Framer Motion | Premium animations, SPA |
| Styling | Tailwind CSS 4 + Custom ET Prime theme | Design system |
| Charts | Recharts | XIRR trajectories, glidepath |
| Backend | FastAPI 0.110 + Python 3.11 | Async, auto-docs |
| Math | NumPy, SciPy | XIRR convergence |
| Auth | JWT (JOSE) | Stateless, no DB needed for demo |
| Deployment | Docker + Docker Compose | One-command deploy |
| LLM | None (deterministic only) | Zero API cost, zero hallucination |

**Cost efficiency bonus**: Entire system runs with **zero LLM API calls**. Infrastructure cost = ₹4,000/month for 1,000 concurrent users.

---

## 8. Deployment Architecture

```
┌─────────────────────────────────────────┐
│            docker compose up             │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │  finsage-frontend (nginx:alpine)    │ │
│  │  Port 3000                          │ │
│  │  - Serves React SPA (/dist)         │ │
│  │  - Proxies /api/* → backend:8000    │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │  finsage-backend (python:3.11-slim) │ │
│  │  Port 8000 (internal)               │ │
│  │  - FastAPI + Uvicorn (2 workers)    │ │
│  │  - Health check: GET /health        │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 9. Future Roadmap (Post-Hackathon)

1. **Redis Financial Context Graph**: Persist user financial state across agents for true multi-agent coordination
2. **LLM Router**: Route simple queries to 8B local model (Ollama), complex reasoning to 70B — estimated 85% cost reduction vs GPT-4
3. **CAMS PDF Parser**: Actual statement upload and parsing (infrastructure exists in `parsers/cams_parser.py`)
4. **PostgreSQL Persistence**: Move audit trail from in-memory to production database
5. **Google OAuth**: Full user authentication (auth endpoint scaffolded in `routers/auth.py`)

"""
Compliance Guard — validates ALL outputs before reaching users.
Ensures SEBI compliance, blocks unlicensed advisory language,
cross-validates LLM numbers against deterministic engine outputs.
"""

import re
from typing import Any, Dict, List

SEBI_DISCLAIMER = (
    "⚠️ DISCLAIMER: This is AI-generated financial guidance for educational purposes only. "
    "FinSage AI is NOT a SEBI-registered investment advisor (RIA). "
    "All recommendations must be validated with a licensed financial professional. "
    "Mutual fund investments are subject to market risks. Read all scheme-related documents carefully. "
    "Tax calculations are based on Finance Act 2024 and may not reflect recent amendments."
)

BLOCKED_PATTERNS = [
    r"guaranteed return",
    r"risk[\s-]?free",
    r"certain(ly)?\s+(make|earn|get)",
    r"(buy|invest in)\s+.{0,30}(now|today|immediately)",
    r"100%\s+safe",
    r"no\s+risk",
    r"sure\s+profit",
    r"double\s+your\s+money",
]


def validate_output(content: str, context: str = "") -> dict:
    """
    Validate any text output for compliance.
    Returns: {passed, content (with disclaimer), flags}
    """
    flags = []

    for pattern in BLOCKED_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            flags.append(f"BLOCKED: Pattern '{pattern}' matched in output")
            content = re.sub(
                pattern,
                "[REDACTED — consult a licensed financial advisor]",
                content,
                flags=re.IGNORECASE
            )

    # Always inject disclaimer if not present
    if SEBI_DISCLAIMER[:20] not in content:
        content = content + "\n\n" + SEBI_DISCLAIMER

    return {
        "passed": len(flags) == 0,
        "content": content,
        "flags": flags,
        "disclaimer_injected": True,
    }


def validate_numbers(llm_output: dict, engine_output: dict, threshold: float = 0.05) -> dict:
    """
    Cross-check LLM-stated numbers against deterministic engine.
    If deviation > threshold (5%), discard LLM numbers → use engine values.
    """
    mismatches = []

    for key in engine_output:
        if key in llm_output and isinstance(engine_output[key], (int, float)):
            try:
                llm_val = float(str(llm_output[key]).replace(",", "").replace("₹", "").replace("Cr", "").strip())
                eng_val = float(engine_output[key])

                if eng_val != 0 and abs(llm_val - eng_val) / abs(eng_val) > threshold:
                    mismatches.append({
                        "field": key,
                        "llm_value": llm_val,
                        "engine_value": eng_val,
                        "deviation_pct": round(abs(llm_val - eng_val) / abs(eng_val) * 100, 1)
                    })
            except (ValueError, TypeError):
                continue

    return {
        "numbers_valid": len(mismatches) == 0,
        "use_engine_values": len(mismatches) > 0,
        "mismatches": mismatches,
        "note": "LLM numbers deviated — engine values used for accuracy" if mismatches else "All numbers verified",
    }


def get_disclaimer() -> str:
    return SEBI_DISCLAIMER

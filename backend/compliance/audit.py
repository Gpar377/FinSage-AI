"""
Audit Trail Logger — records all agent actions for compliance & debugging.
In-memory for demo. PostgreSQL-backed in production.
"""

import json
from datetime import datetime
from typing import Any, List

# In-memory audit log (replace with PostgreSQL in prod)
_audit_log: List[dict] = []


def log_event(user_id: str, event_type: str, data: Any = None, agent: str = "system"):
    """Log an audit event with timestamp."""
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "agent": agent,
        "event_type": event_type,
        "data": data,
    }
    _audit_log.append(entry)

    # Keep only last 10000 entries in memory
    if len(_audit_log) > 10000:
        _audit_log.pop(0)

    return entry


def get_audit_log(user_id: str = None, limit: int = 100) -> List[dict]:
    """Retrieve audit entries, optionally filtered by user."""
    logs = _audit_log if user_id is None else [e for e in _audit_log if e["user_id"] == user_id]
    return logs[-limit:]


def get_compliance_report(user_id: str) -> dict:
    """Generate compliance summary for a user's session."""
    user_logs = [e for e in _audit_log if e["user_id"] == user_id]
    compliance_flags = [e for e in user_logs if e["event_type"] == "COMPLIANCE_FLAG"]

    return {
        "total_actions": len(user_logs),
        "compliance_flags": len(compliance_flags),
        "flag_details": compliance_flags,
        "disclaimer_shown": any(e["event_type"] == "DISCLAIMER_SHOWN" for e in user_logs),
        "session_start": user_logs[0]["timestamp"] if user_logs else None,
    }

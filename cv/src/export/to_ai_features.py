from typing import Any, Dict


def to_ai_features(
    job_input: Dict[str, Any],
    event_timeline: Dict[str, Any],
    aggregate_stats: Dict[str, Any],
) -> Dict[str, Any]:
    """Convert CV outputs into a stable app/LLM contract."""
    return {
        "schema_version": "ai_features.v1",
        "match_id": job_input.get("match_id"),
        "timeline": event_timeline,
        "metrics": aggregate_stats,
    }

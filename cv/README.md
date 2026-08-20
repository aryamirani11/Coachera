# CV Pipeline (v1)

This folder contains the badminton computer vision pipeline that produces structured
`ai_features` for the web app and Gemini report generation.

## Goals
- Keep CV compute isolated from Next.js UI code.
- Produce deterministic, coach-interpretable features.
- Version pipeline outputs for traceability.

## High-level flow
1. Ingest video and metadata
2. Run perception stages (player, shuttle, pose, tracking)
3. Build rally/event timeline
4. Compute tactical and performance aggregates
5. Export structured `ai_features` payload

## Core entrypoint
- `src/main.py` for local execution and smoke tests
- `src/pipeline/orchestrator.py` for stage ordering

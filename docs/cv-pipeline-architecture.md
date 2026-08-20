# CV Pipeline Architecture

## Directory intent
- `cv/configs/`: pipeline and model/runtime configuration.
- `cv/src/pipeline/`: stage orchestration.
- `cv/src/perception/`: frame-level CV model logic.
- `cv/src/events/`: rally and stroke eventization.
- `cv/src/analytics/`: tactical and performance metrics.
- `cv/src/export/`: final JSON contract for app + Gemini.

## Contract boundary
The CV stack should output a deterministic `ai_features` JSON payload. The app and
Gemini report generation consume this payload rather than raw detections.

## Versioning
Track a `schema_version` in every output and keep transformations backward compatible
when adding new fields.

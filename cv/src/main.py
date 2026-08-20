from pipeline.orchestrator import run_pipeline


def main() -> None:
    """Local smoke entrypoint for processing a single video."""
    example_input = {
        "video_path": "sample.mp4",
        "athlete_id": "example-athlete-id",
        "match_id": "example-match-id",
    }
    result = run_pipeline(example_input)
    print("Pipeline complete:", result.get("status", "unknown"))


if __name__ == "__main__":
    main()

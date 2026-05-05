import { NextResponse } from "next/server";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";

const apiKey = process.env.GEMINI_API_KEY || "";

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing AI key" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;

    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const fileManager = new GoogleAIFileManager(apiKey);
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { writeFileSync, unlinkSync } = await import("fs");
    const { join } = await import("path");
    const { tmpdir } = await import("os");

    const safeName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const tmpPath = join(tmpdir(), `coachera-${Date.now()}-${safeName}`);
    writeFileSync(tmpPath, buffer);

    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType: videoFile.type || "video/mp4",
      displayName: safeName,
    });

    try { unlinkSync(tmpPath); } catch {}

    let file = uploadResult.file;
    const MAX_POLLS = 36;
    let pollCount = 0;

    while (file.state === FileState.PROCESSING && pollCount < MAX_POLLS) {
      await new Promise((r) => setTimeout(r, 5000));
      pollCount++;
      file = await fileManager.getFile(file.name);
    }

    if (file.state === FileState.FAILED) {
      return NextResponse.json(
        { error: "Coachera could not process the video file." },
        { status: 422 }
      );
    }

    if (file.state !== FileState.ACTIVE) {
      return NextResponse.json(
        { error: "Video processing timed out. Try a shorter clip." },
        { status: 408 }
      );
    }

    return NextResponse.json({
      fileUri: file.uri,
      mimeType: file.mimeType,
    });
  } catch (err: any) {
    console.error("Upload video error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

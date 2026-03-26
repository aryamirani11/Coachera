import { NextResponse } from "next/server";
import { athletes, matchesByAthlete } from "@/lib/mock-data";
import { generateAIAnalysis } from "@/lib/gemini";

// In a real app, you'd fetch from Supabase here.
// For the demo, we use the mock data as a source and send to Gemini.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const match = Object.values(matchesByAthlete)
    .flat()
    .find((m) => m.id === matchId);

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const athlete = athletes.find((a) => a.id === match.athlete_id);

  if (!athlete) {
    return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
  }

  try {
    const reportData = await generateAIAnalysis(athlete, match);
    if (!reportData) {
      throw new Error("Gemini AI failed to generate content.");
    }
    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

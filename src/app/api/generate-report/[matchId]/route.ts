import { NextResponse } from "next/server";
import { athletes as mockAthletes, matchesByAthlete } from "@/lib/mock-data";
import { generateAIAnalysis } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  const { data: dbMatch } = await supabase
    .from("matches")
    .select("*, athletes(*)")
    .eq("id", matchId)
    .single();

  if (dbMatch) {
    if (dbMatch.ai_report?.sections) {
      return NextResponse.json(dbMatch.ai_report);
    }

    const athlete = dbMatch.athletes;
    if (athlete) {
      try {
        const reportData = await generateAIAnalysis(athlete, dbMatch);
        if (!reportData) throw new Error("AI failed to generate content.");

        await supabase
          .from("matches")
          .update({ ai_report: reportData })
          .eq("id", matchId);

        return NextResponse.json(reportData);
      } catch (error: any) {
        console.error("AI Generation failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  const match = Object.values(matchesByAthlete)
    .flat()
    .find((m) => m.id === matchId);

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const athlete = mockAthletes.find((a) => a.id === match.athlete_id);

  if (!athlete) {
    return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
  }

  try {
    const reportData = await generateAIAnalysis(athlete, match);
    if (!reportData) {
      throw new Error("AI failed to generate content.");
    }
    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

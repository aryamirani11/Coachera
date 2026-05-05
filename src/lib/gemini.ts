import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateAIAnalysis(athleteData: any, matchData: any) {
  const stats = matchData.stats || {};
  const errors = matchData.errors || {};
  const pc = matchData.point_construction || {};

  const prompt = `
You are an elite badminton coach providing a concise performance debrief.
Analyze match data for ${athleteData.name} (Rank: ${athleteData.ranking ?? "N/A"}) vs ${matchData.opponent}.

Result: ${matchData.result} (${matchData.score || "N/A"}) | Duration: ${matchData.duration || "N/A"}
Stats: ${stats.total_points || "?"} pts, ${stats.error_rate || "?"}% error rate, ${stats.offensive_win_rate || "?"}% offensive win, ${stats.defensive_win_rate || "?"}% defensive win, avg rally ${stats.avg_rally_length || "?"} shots.
Errors: Net ${errors.net_errors || 0}, OB ${errors.out_of_bounds || 0}, Misread ${errors.defensive_misread || 0}, Forced ${errors.forced_errors || 0}.
Points won by: Smash ${pc.smash_finish || 0}%, Drop ${pc.drop_deception || 0}%, Opp Error ${pc.opponent_error || 0}%, Endurance ${pc.long_rally_endurance || 0}%.

FORMATTING RULES:
- Each section's "content" must be a SINGLE string.
- "Executive Summary" should be a SHORT paragraph (2-3 sentences). No bullet points.
- ALL OTHER sections: use bullet points starting with "• " (bullet + space), separated by newlines.
- 3-6 bullets per non-summary section. Each bullet 1-2 sentences MAX. Be specific and actionable.
- NEVER reference specific timestamps. Use high-level phases: "early in the first set", "mid-game", "closing rallies", etc.

Return a raw JSON object (no markdown codeblocks):
{
  "title": "Match Performance Report",
  "sections": [
    { "heading": "Executive Summary", "content": "A concise 2-3 sentence paragraph." },
    { "heading": "Offensive Insights", "content": "• ...\\n• ..." },
    { "heading": "Defensive Observations", "content": "• ...\\n• ..." },
    { "heading": "Tactical Adjustments", "content": "• ...\\n• ..." },
    { "heading": "Training Recommendations", "content": "• ...\\n• ..." }
  ]
}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean JSON from potential markdown blocks
    const jsonStr = text
      .replace(/```json\n?|\n?```/g, "")
      .replace(/[\x00-\x1F\x7F]/g, (ch) => (ch === "\n" || ch === "\r" || ch === "\t" ? " " : ""))
      .trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

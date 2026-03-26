import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateAIAnalysis(athleteData: any, matchData: any) {
  const prompt = `
    You are an elite badminton coach and performance analyst. 
    Analyze the following match data for athlete ${athleteData.name} (Ranking: ${athleteData.ranking ?? "N/A"}) 
    against opponent ${matchData.opponent}.

    Match Summary:
    - Result: ${matchData.result} (${matchData.score})
    - Duration: ${matchData.duration}
    - Total Points: ${matchData.stats.total_points}
    - Error Rate: ${matchData.stats.error_rate}%
    - Unforced Errors: ${matchData.stats.unforced_error_count}
    - Offensive Win Rate: ${matchData.stats.offensive_win_rate}%
    - Defensive Win Rate: ${matchData.stats.defensive_win_rate}%
    - Avg Rally Length: ${matchData.stats.avg_rally_length} shots

    Key Stats Breakdown:
    - Rallies < 6 shots: ${matchData.stats.rallies_under_6}
    - Rallies 6-12 shots: ${matchData.stats.rallies_6_12}
    - Rallies > 12 shots: ${matchData.stats.rallies_over_12}

    Error Breakdown:
    - Net Errors: ${matchData.errors.net_errors}
    - Out of Bounds: ${matchData.errors.out_of_bounds}
    - Defensive Misreads: ${matchData.errors.defensive_misread}
    - Forced Errors: ${matchData.errors.forced_errors}

    Point Construction (Points won by):
    - Smash finishes: ${matchData.point_construction.smash_finish}%
    - Drop deception: ${matchData.point_construction.drop_deception}%
    - Opponent error: ${matchData.point_construction.opponent_error}%
    - endurance: ${matchData.point_construction.long_rally_endurance}%

    Please generate a detailed, professional AI coaching report. 
    Format the output as a JSON object with the following structure:
    {
      "title": "Match Performance Summary - [Date]",
      "sections": [
        { "heading": "Executive Summary", "content": "..." },
        { "heading": "Offensive Insights", "content": "..." },
        { "heading": "Defensive Observations", "content": "..." },
        { "heading": "Tactical Adjustments", "content": "..." },
        { "heading": "Training Recommendations", "content": "..." }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean JSON from potential markdown blocks
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateAIAnalysis(
  athleteData: any,
  matchData: any,
  fileUri: string,
  fileMimeType: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an elite badminton coach and performance analyst providing a concise coaching debrief.
Analyze the match footage for athlete ${athleteData.name} against ${matchData.opponent}.
Match Result: ${matchData.result === "W" ? "Win" : "Loss"}

Player identification context: "${matchData.visualContext}"

IMPORTANT FORMATTING RULES:
- Each section's "content" must be a SINGLE string.
- The "Executive Summary" section should be a SHORT paragraph (2-3 sentences). No bullet points. Concise overview of the match.
- ALL OTHER sections: use bullet points starting with "• " (bullet + space), separated by newlines.
- Keep each bullet to 1-2 sentences MAX. Be direct and actionable.
- No filler phrases. Every bullet should contain a specific, implementable insight.
- 3-6 bullet points per non-summary section.
- NEVER reference specific video timestamps (e.g. "at 2:34", "15:20 mark"). Instead use high-level phase descriptions like "early in the first set", "mid-game", "during the closing rallies", "in the second set", etc.

Format the output as a valid raw JSON object (do NOT wrap in markdown codeblocks):
{
  "title": "Match Performance Report",
  "sections": [
    { "heading": "Executive Summary", "content": "A concise 2-3 sentence paragraph summarizing the match performance." },
    { "heading": "Offensive Insights", "content": "• Point one\\n• Point two" },
    { "heading": "Defensive Observations", "content": "• Point one\\n• Point two" },
    { "heading": "Tactical Adjustments", "content": "• Point one\\n• Point two" },
    { "heading": "Training Recommendations", "content": "• Point one\\n• Point two" }
  ]
}
  `;

  try {
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: fileMimeType,
          fileUri: fileUri,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();
    // Clean JSON from potential markdown blocks (e.g. ```json ... ```)
    const jsonStr = text
      .replace(/```json\n?|\n?```/g, "")
      .replace(/[\x00-\x1F\x7F]/g, (ch) => (ch === "\n" || ch === "\r" || ch === "\t" ? " " : ""))
      .trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a structured fallback if API fails
    return {
      title: "Analysis Failed",
      sections: [
        { heading: "Error", content: "The AI was unable to process the video. Ensure the video file is valid and API keys are correct." }
      ]
    };
  }
}

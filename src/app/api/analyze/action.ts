"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function getGeminiKey() {
  return apiKey;
}

export async function generateAIAnalysis(
  athleteData: any,
  matchData: any,
  fileUri: string,
  fileMimeType: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are an elite badminton coach and performance analyst. 
    Analyze the provided match footage for athlete ${athleteData.name} against opponent ${matchData.opponent}.
    Match Result: ${matchData.result === "W" ? "Win" : "Loss"}

    Additional Coach Verification context to identify the player:
    "${matchData.visualContext}"

    Please watch the video and generate a detailed, professional AI coaching report. 
    Analyze their offensive game, defensive game, positioning, errors, and endurance or shot choices.
    
    Format the output as a valid raw JSON object exactly with the following structure (do NOT wrap it in markdown codeblocks):
    {
      "title": "Match Performance Summary",
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
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a structured fallback if API fails
    return {
      title: "AI Analysis Failed",
      sections: [
        { heading: "Error", content: "The AI was unable to process the video. Ensure the video file is valid and API keys are correct." }
      ]
    };
  }
}

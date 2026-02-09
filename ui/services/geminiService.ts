
import { GoogleGenAI } from "@google/genai";

export async function getOpsInsights(context: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this software delivery context and provide a brief, actionable Ops insight: ${context}. Keep it under 100 words.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Unable to generate AI insights at this moment.";
  }
}

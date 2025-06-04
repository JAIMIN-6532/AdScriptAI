import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

export default class GeminiController {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
  }

  async generateChatResponse(prompt) {
    try {
      // Use models.generateContent for a simple text‐generation call
      const response = await this.ai.models.generateContent({
        model: process.env.GOOGLE_GENAI_MODEL, 
        contents: prompt, // single string or array of strings
        maxOutputTokens: 1000,
        temperature: 0.7,
      });

      // The returned object has a `.text` field containing the generated output
      if (!response || typeof response.text !== "string") {
        throw new Error("Empty or malformed response from Gemini.");
      }

      return response.text.trim();
    } catch (error) {
      console.error("Error generating chat response:", error);
      throw new Error("Failed to generate chat response");
    }
  }
}

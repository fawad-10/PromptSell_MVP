// Import the correct Gemini API from @google/genai
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API with your API key
const genAI = new GoogleGenAI({
  apiKey: "AIzaSyCmrz6kq7YhaYomVexO3BQzukkzv9OTMnM",
});

/**
 * Generate content using Gemini AI
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - The generated content
 */
export async function generateWithGemini(prompt, options = {}) {
  try {
    const { temperature = 0.7, maxTokens = 2048 } = options;

    // Use the correct @google/genai API structure
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
      config: {
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

/**
 * Generate content with streaming (for real-time responses)
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Function} onChunk - Callback function for each chunk
 * @param {Object} options - Additional options
 */
export async function generateWithGeminiStream(prompt, onChunk, options = {}) {
  try {
    const { temperature = 0.7, maxTokens = 2048 } = options;

    // Use the correct @google/genai streaming API
    const response = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash-001",
      contents: prompt,
      config: {
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      },
    });

    let fullText = "";
    for await (const chunk of response) {
      const chunkText = chunk.text;
      fullText += chunkText;
      onChunk(chunkText, fullText);
    }

    return fullText;
  } catch (error) {
    console.error("Gemini API Stream Error:", error);
    throw new Error(`Gemini API Stream Error: ${error.message}`);
  }
}

export default {
  generateWithGemini,
  generateWithGeminiStream,
};

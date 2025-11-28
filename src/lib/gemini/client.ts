import { GoogleGenAI } from "@google/genai";

/**
 * Get the Gemini API client instance
 * The client gets the API key from the environment variable `GEMINI_API_KEY` or `NEXT_PUBLIC_GEMINI_KEY`
 */
export function getGeminiClient() {
  // Check for GEMINI_API_KEY first (server-side), fallback to NEXT_PUBLIC_GEMINI_KEY
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_KEY is not configured"
    );
  }

  // Set the API key in environment for the client to pick up
  if (!process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = apiKey;
  }

  return new GoogleGenAI({});
}

/**
 * Generate quiz questions from material content using Gemini
 */
export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface GeminiQuizResponse {
  questions: QuizQuestion[];
}

export async function generateQuizFromMaterial(
  title: string,
  content: string
): Promise<GeminiQuizResponse> {
  const ai = getGeminiClient();

  const prompt = `Based on the following material, create a quiz with multiple choice questions. Return the response as a JSON object with the following structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct_answer": "Option A text"
    }
  ]
}

Material content:
Title: ${title}
Content: ${content}

Generate 5-10 relevant multiple choice questions based on this material. Make sure each question has exactly 4 options (A, B, C, D format) and the correct_answer matches one of the options exactly.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("No response text from Gemini");
    }

    // Parse JSON from the response text (might be wrapped in markdown code blocks)
    let quizData: GeminiQuizResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      quizData = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Failed to parse Gemini response:", text, error);
      throw new Error("Failed to parse quiz data from Gemini");
    }

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid quiz format from Gemini");
    }

    return quizData;
  } catch (error) {
    console.error("Error generating quiz from Gemini:", error);
    throw error;
  }
}

import { GoogleGenAI, Type } from '@google/genai';

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export { Type };

import { GoogleGenAI } from '@google/genai';

export function getGeminiKey(): string | null {
  return localStorage.getItem('GEMINI_API_KEY');
}

export function promptForGeminiKey(): boolean {
   window.dispatchEvent(new Event('MISSING_API_KEY'));
   return false;
}

export function getAIClient(): GoogleGenAI {
   const key = getGeminiKey();
   if (!key || key.trim() === '') {
      promptForGeminiKey();
      throw new Error("A Gemini API Key is required. Please set it in the App Settings.");
   }
   return new GoogleGenAI({ apiKey: key });
}

export function getAIKey(): string {
   const key = getGeminiKey();
   if (!key || key.trim() === '') {
      promptForGeminiKey();
      throw new Error("A Gemini API Key is required. Please set it in the App Settings.");
   }
   return key;
}

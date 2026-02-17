
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePuzzleContent = async (words: string[]): Promise<GeminiResponse> => {
  const prompt = `I am making a word puzzle for kids. 
  Target words: ${words.join(", ")}.
  1. Create a simple, fun riddle or question for each of these 3 words suitable for a 6-year-old child.
  2. Generate a descriptive prompt for an image generation model (gemini-2.5-flash-image) that reflects a magical world containing these three items: ${words.join(", ")}. The theme should be soft, pastel, and playful (cartoon style).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riddles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                question: { type: Type.STRING },
              },
              required: ["word", "question"],
            },
          },
          imagePrompt: { type: Type.STRING },
        },
        required: ["riddles", "imagePrompt"],
      },
    },
  });

  return JSON.parse(response.text.trim());
};

export const generatePuzzleBackground = async (imagePrompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: `A vibrant, high-quality, kid-friendly background illustration: ${imagePrompt}. Use a soft, playful art style. No text in the image.` }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image data found in response");
};

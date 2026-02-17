
export interface Riddle {
  word: string;
  question: string;
}

export interface PuzzleData {
  targetWords: string[];
  grid: string[];
  riddles: Riddle[];
  backgroundImageUrl?: string;
}

export interface GeminiResponse {
  riddles: Riddle[];
  imagePrompt: string;
}

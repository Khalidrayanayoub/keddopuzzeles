
import React, { useState, useCallback } from 'react';
import { PuzzleData, GeminiResponse } from './types';
import { generatePuzzleContent, generatePuzzleBackground } from './services/geminiService';
import PuzzleCanvas from './components/PuzzleCanvas';

const FILLER_WORDS = [
  'sun', 'cat', 'dog', 'ball', 'sky', 'toy', 'hat', 'run', 
  'tree', 'egg', 'fish', 'bug', 'box', 'pen', 'bat', 'car',
  'fly', 'jump', 'play', 'sing', 'bear', 'cake', 'kite', 'rain'
];

const App: React.FC = () => {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [word3, setWord3] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word1 || !word2 || !word3) return;

    setIsLoading(true);
    setLoadingStep('Asking Gemini for some fun riddles...');
    
    try {
      const words = [word1, word2, word3];
      const geminiRes: GeminiResponse = await generatePuzzleContent(words);
      
      setLoadingStep('Drawing a magical background...');
      const backgroundUrl = await generatePuzzleBackground(geminiRes.imagePrompt);

      setLoadingStep('Mixing the words into the grid...');
      
      // Create a 4x4 grid (16 slots)
      // 3 target words + 13 random fillers
      const fillers = shuffleArray(FILLER_WORDS).slice(0, 13);
      const fullGrid = shuffleArray([...words, ...fillers]);

      setPuzzleData({
        targetWords: words,
        grid: fullGrid,
        riddles: geminiRes.riddles,
        backgroundImageUrl: backgroundUrl
      });
      
    } catch (error) {
      console.error('Generation failed', error);
      alert('Oh no! Something went wrong. Let\'s try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDownloadReady = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl text-blue-600 mb-2 drop-shadow-sm">
          KiddoWord Puzzle
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Create a magic puzzle just for you!
        </p>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border-4 border-blue-100 h-fit">
          <h2 className="text-2xl text-blue-500 mb-6 flex items-center">
            <span className="mr-2">✨</span> Step 1: Pick 3 Words
          </h2>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">First Word</label>
              <input
                type="text"
                value={word1}
                onChange={(e) => setWord1(e.target.value)}
                placeholder="e.g. Dragon"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:outline-none text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Second Word</label>
              <input
                type="text"
                value={word2}
                onChange={(e) => setWord2(e.target.value)}
                placeholder="e.g. Castle"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:outline-none text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Third Word</label>
              <input
                type="text"
                value={word3}
                onChange={(e) => setWord3(e.target.value)}
                placeholder="e.g. Fairy"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:outline-none text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl text-white font-bold text-xl transition-all shadow-lg ${
                isLoading 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
              }`}
            >
              {isLoading ? 'Creating Magic...' : 'Generate Puzzle! 🚀'}
            </button>
          </form>

          {isLoading && (
            <div className="mt-8 text-center animate-pulse">
              <p className="text-blue-500 font-semibold">{loadingStep}</p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          )}
        </section>

        {/* Preview & Download Section */}
        <section className="flex flex-col items-center">
          {puzzleData ? (
            <div className="w-full flex flex-col items-center space-y-6">
              <PuzzleCanvas 
                data={puzzleData} 
                onDownloadReady={onDownloadReady} 
              />
              
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download="my-kiddo-puzzle.png"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-lg transition-transform active:scale-95 flex items-center"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </a>
              )}
            </div>
          ) : (
            <div className="w-full h-full min-h-[400px] border-4 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <div className="text-6xl mb-4">🧩</div>
              <p className="text-lg">Enter three words to see your puzzle appear here!</p>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        Built with ✨ Gemini AI for Little Dreamers
      </footer>
    </div>
  );
};

export default App;

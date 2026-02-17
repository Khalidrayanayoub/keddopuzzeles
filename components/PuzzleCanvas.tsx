
import React, { useRef, useEffect } from 'react';
import { PuzzleData } from '../types';

interface PuzzleCanvasProps {
  data: PuzzleData;
  onDownloadReady: (blob: Blob) => void;
}

const PuzzleCanvas: React.FC<PuzzleCanvasProps> = ({ data, onDownloadReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 1024;
      canvas.width = size;
      canvas.height = size;

      // 1. Draw Background
      if (data.backgroundImageUrl) {
        const bgImg = new Image();
        bgImg.src = data.backgroundImageUrl;
        await new Promise((resolve) => {
          bgImg.onload = resolve;
        });
        ctx.drawImage(bgImg, 0, 0, size, size);
        
        // Darken background slightly for readability
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(0, 0, size, size);
      } else {
        ctx.fillStyle = '#f0f9ff';
        ctx.fillRect(0, 0, size, size);
      }

      // 2. Draw Title
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 64px Fredoka';
      ctx.textAlign = 'center';
      ctx.fillText('Find the Secret Words!', size / 2, 80);

      // 3. Draw Grid (4x4)
      const gridSize = 640;
      const cellSize = gridSize / 4;
      const startX = (size - gridSize) / 2;
      const startY = 150;

      data.grid.forEach((word, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const x = startX + col * cellSize;
        const y = startY + row * cellSize;

        // Cell border
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, cellSize, cellSize);
        
        // Background for cell (light white)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

        // Word text
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 32px Quicksand';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word.toUpperCase(), x + cellSize / 2, y + cellSize / 2);
      });

      // 4. Draw Riddles Section
      const riddlesY = startY + gridSize + 60;
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 42px Fredoka';
      ctx.textAlign = 'left';
      ctx.fillText('Clues:', 60, riddlesY);

      ctx.font = '24px Quicksand';
      data.riddles.forEach((riddle, i) => {
        const text = `${i + 1}. ${riddle.question}`;
        // Wrap text logic
        const maxWidth = 900;
        const words = text.split(' ');
        let line = '';
        let lineY = riddlesY + 50 + (i * 80);
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, 60, lineY);
            line = words[n] + ' ';
            lineY += 30;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 60, lineY);
      });

      // Prepare for download
      canvas.toBlob((blob) => {
        if (blob) onDownloadReady(blob);
      }, 'image/png');
    };

    render();
  }, [data, onDownloadReady]);

  return (
    <div className="flex flex-col items-center">
      <canvas 
        ref={canvasRef} 
        className="w-full max-w-lg shadow-2xl rounded-xl border-4 border-white"
        style={{ aspectRatio: '1/1' }}
      />
      <p className="mt-4 text-gray-500 italic text-sm">Preview of your puzzle</p>
    </div>
  );
};

export default PuzzleCanvas;

'use client';

import { useState, useEffect, useRef } from 'react';

interface ReelScene {
  sceneNumber: number;
  text: string;
  visualNote?: string; // Optional - falls back to default
  duration: number;
}

interface TeleprompterProps {
  script: ReelScene[];
  onClose: () => void;
}

export default function Teleprompter({ script, onClose }: TeleprompterProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1 = Slow, 5 = Fast
  const [fontSize, setFontSize] = useState(48);
  const [isMirrored, setIsMirrored] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Handle auto-scrolling
  useEffect(() => {
    const scroll = () => {
      if (scrollRef.current && isPlaying) {
        scrollRef.current.scrollTop += scrollSpeed * 0.5;
        animationFrameRef.current = requestAnimationFrame(scroll);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(scroll);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, scrollSpeed]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">

      {/* 🎛️ TOP CONTROLS */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕ Close
          </button>
          <span className="text-sm font-bold text-gold-500 hidden md:block">
            🎥 RECORDING MODE
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Font Size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">A-</span>
            <input
              type="range"
              min="24"
              max="96"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 accent-white"
            />
            <span className="text-xs text-gray-500">A+</span>
          </div>

          {/* Mirror Mode Toggle */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`px-3 py-1 rounded text-xs font-bold border ${isMirrored ? 'bg-white text-black border-white' : 'border-gray-600 text-gray-400'}`}
          >
            {isMirrored ? 'MIRROR ON' : 'MIRROR OFF'}
          </button>
        </div>
      </div>

      {/* 📜 SCROLLING AREA */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide relative"
        style={{ scrollBehavior: 'auto' }} // 'auto' needed for JS scrolling
      >
        {/* Padding to allow scrolling past the end */}
        <div className="min-h-[50vh] flex items-end justify-center pb-20">
           <p className="text-gray-600 uppercase tracking-widest text-sm mb-10">Start Reading Below</p>
        </div>

        <div className={`max-w-4xl mx-auto px-6 pb-[80vh] ${isMirrored ? 'scale-x-[-1]' : ''}`}>
          {script.map((scene, index) => (
            <div key={index} className="mb-24 opacity-90 hover:opacity-100 transition-opacity">

              {/* Visual Cue (Non-spoken) */}
              <div className="mb-4 flex items-center gap-2 text-yellow-400 font-mono text-lg border-l-4 border-yellow-400 pl-3">
                <span>🎬</span>
                <span className="uppercase tracking-wide font-bold">{scene.visualNote || "Camera facing you"}</span>
                <span className="text-gray-500 text-sm ml-2">({scene.duration}s)</span>
              </div>

              {/* Spoken Text */}
              <p
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.4 }}
                className="font-bold leading-tight"
              >
                {scene.text}
              </p>
            </div>
          ))}

          <div className="text-center text-gray-600 mt-20 pb-20">
            --- END OF SCRIPT ---
          </div>
        </div>

        {/* Reading Line Marker */}
        <div className="fixed top-1/3 left-0 right-0 h-0.5 bg-red-500/30 pointer-events-none z-10" />
        <div className="fixed top-1/3 right-4 text-red-500/50 text-xs font-mono">EYE LEVEL</div>
      </div>

      {/* ▶️ BOTTOM PLAYBACK CONTROLS */}
      <div className="p-6 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-8">

        {/* Speed Control */}
        <div className="flex flex-col items-center gap-1">
          <label className="text-xs text-gray-500 font-mono">SPEED</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setScrollSpeed(Math.max(1, scrollSpeed - 1))} className="text-gray-400 hover:text-white">-</button>
            <span className="w-8 text-center font-bold text-xl">{scrollSpeed}</span>
            <button onClick={() => setScrollSpeed(Math.min(10, scrollSpeed + 1))} className="text-gray-400 hover:text-white">+</button>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
              : 'bg-white hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
          }`}
        >
          {isPlaying ? (
             <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
          ) : (
             <svg className="w-8 h-8 text-black fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        {/* Restart */}
        <div className="flex flex-col items-center gap-1">
          <label className="text-xs text-gray-500 font-mono">RESET</label>
          <button
            onClick={() => {
              setIsPlaying(false);
              if (scrollRef.current) scrollRef.current.scrollTop = 0;
            }}
            className="p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}

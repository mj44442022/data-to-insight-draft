'use client';

import { useState } from 'react';
import Teleprompter from './teleprompter';

interface ReelScene {
  sceneNumber: number;
  text: string;
  imageIndex: number;
  duration: number;
  visualNote?: string; // Optional - falls back to defaults if not provided
}

interface PreviewReelProps {
  videoUrl: string | null;
  script: ReelScene[];
  videoError?: string;
}

export default function PreviewReel({ videoUrl, script, videoError }: PreviewReelProps) {
  const [showTeleprompter, setShowTeleprompter] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Teleprompter Modal Overlay */}
      {showTeleprompter && (
        <Teleprompter
          script={script}
          onClose={() => setShowTeleprompter(false)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Reel Script & Direction</h3>
        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/30">
          Generated for You
        </span>
      </div>

      {/* Script Card Container */}
      <div className="flex-1 bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700 flex flex-col">

        {/* Scrollable Script Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
          {script.map((scene, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-gray-700 hover:border-gold-500 transition-colors group">
              {/* Scene Number Bubble */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-800 border-2 border-gray-600 group-hover:border-gold-500 transition-colors" />

              {/* Visual Note (Yellow) */}
              <div className="mb-2 text-xs font-mono text-yellow-500/80 uppercase tracking-wider flex items-center gap-2">
                <span>🎥 {scene.visualNote || "Camera facing you"}</span>
                <span className="text-gray-600">•</span>
                <span>{scene.duration}s</span>
              </div>

              {/* Spoken Text (White) */}
              <p className="text-gray-200 font-medium text-lg leading-relaxed">
                "{scene.text}"
              </p>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-gray-900 border-t border-gray-800">
          <button
            onClick={() => setShowTeleprompter(true)}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 group transition-all transform hover:scale-[1.02]"
          >
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </span>
            Open Teleprompter Mode
          </button>

          <p className="text-center text-gray-500 text-xs mt-3">
            Opens full-screen scrolling text for recording
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef } from 'react';

interface PreviewReelProps {
  videoBase64: string | null;
  script: Array<{
    sceneNumber: number;
    text: string;
    imageIndex: number;
    duration: number;
  }>;
  videoError?: string;
}

export default function PreviewReel({ videoBase64, script, videoError }: PreviewReelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Reel Preview</h3>

      {/* Video Player or Error Message */}
      {videoBase64 ? (
        <div className="bg-gray-800 rounded-lg overflow-hidden max-w-md mx-auto">
          <video
            ref={videoRef}
            controls
            loop
            playsInline
            className="w-full"
            style={{ aspectRatio: '9/16' }}
          >
            <source src={`data:video/mp4;base64,${videoBase64}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <p className="text-sm text-gray-400 text-center mt-2">
            Instagram Reel format (1080x1920, 30fps)
          </p>
        </div>
      ) : (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-yellow-400 font-semibold mb-2">Video generation unavailable</p>
          <p className="text-sm text-yellow-200/80">
            {videoError || 'FFmpeg not available in this environment. Use the script below with a teleprompter.'}
          </p>
        </div>
      )}

      {/* Reel Script for Teleprompter */}
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
          <span>📱</span> Reel Script (for Teleprompter)
        </h4>
        <div className="space-y-3">
          {script.map((scene) => (
            <div key={scene.sceneNumber} className="border-l-4 border-gold-500 pl-4">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs text-gray-400 font-semibold">
                  Scene {scene.sceneNumber}
                </span>
                <span className="text-xs text-gray-400">{scene.duration}s</span>
              </div>
              <p className="text-white text-lg leading-relaxed">{scene.text}</p>
              <p className="text-xs text-gray-500 mt-1">Image {scene.imageIndex + 1}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">
          Total duration: {script.reduce((acc, s) => acc + s.duration, 0).toFixed(1)}s
        </p>
      </div>
    </div>
  );
}

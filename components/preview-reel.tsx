'use client';

import { useRef } from 'react';

interface PreviewReelProps {
  videoUrl: string | null; // ✅ URL from Vercel Blob
  script: Array<{
    sceneNumber: number;
    text: string;
    imageIndex: number;
    duration: number;
  }>;
  videoError?: string;
}

export default function PreviewReel({ videoUrl, script, videoError }: PreviewReelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Reel Preview</h3>

      {/* Video Player or Error Message */}
      {videoUrl ? (
        <div className="bg-gray-800 rounded-lg overflow-hidden max-w-md mx-auto">
          <video
            ref={videoRef}
            controls
            loop
            playsInline
            className="w-full"
            style={{ aspectRatio: '9/16' }}
          >
            <source src={videoUrl} type="video/mp4" />
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

      {/* Professional Teleprompter Script */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-3xl mx-auto border border-gold-500/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-display text-2xl font-bold text-gold-500 flex items-center gap-3">
            <span className="text-3xl">🎬</span> Professional Teleprompter Script
          </h4>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-gray-400">Total Duration</div>
            <div className="text-2xl font-bold text-coral-500">
              {script.reduce((acc, s) => acc + s.duration, 0).toFixed(1)}s
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-6 space-y-6">
          {script.map((scene, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === script.length - 1;

            return (
              <div
                key={scene.sceneNumber}
                className="relative border-l-4 border-gold-500 pl-6 pb-6 last:pb-0"
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-gold-500 text-navy-900 font-bold text-sm px-3 py-1 rounded-full">
                      Scene {scene.sceneNumber}
                    </span>
                    {isFirst && (
                      <span className="bg-coral-500/20 text-coral-400 text-xs px-2 py-1 rounded-full font-semibold">
                        HOOK
                      </span>
                    )}
                    {isLast && (
                      <span className="bg-sage-500/20 text-sage-400 text-xs px-2 py-1 rounded-full font-semibold">
                        CTA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-400">
                      <span className="font-semibold text-gold-400">{scene.duration}s</span>
                    </span>
                    <span className="text-gray-500">
                      📸 Image {scene.imageIndex + 1}
                    </span>
                  </div>
                </div>

                {/* Direction Note */}
                <div className="mb-2 text-xs italic text-gray-400">
                  {isFirst && '💡 Deliver with energy & eye contact. Set the hook!'}
                  {!isFirst && !isLast && '🎯 Clear, concise value. Keep momentum.'}
                  {isLast && '✨ Strong finish. Smile and direct action!'}
                </div>

                {/* Main Script Text - Large for easy reading */}
                <div className="bg-black/40 rounded-lg p-4 mb-3">
                  <p className="text-white text-2xl md:text-3xl font-semibold leading-relaxed tracking-wide">
                    {scene.text}
                  </p>
                </div>

                {/* Timing Guide */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-gold-500"></span>
                  <span>Pace: {scene.text.split(' ').length} words in {scene.duration}s ({Math.round(scene.text.split(' ').length / scene.duration)} words/sec)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pro Tips Section */}
        <div className="mt-6 bg-blue-refined/10 border border-blue-refined/30 rounded-lg p-4">
          <h5 className="text-sm font-bold text-blue-refined mb-2 flex items-center gap-2">
            <span>💎</span> Pro Tips for Recording
          </h5>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Record in well-lit environment (natural light is best)</li>
            <li>• Use phone's front camera + teleprompter app</li>
            <li>• Practice once before recording to nail timing</li>
            <li>• Speak naturally - imagine talking to a friend</li>
            <li>• Add captions in editing for better engagement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

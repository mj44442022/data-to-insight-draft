'use client';

import { useRef } from 'react';

interface PreviewReelProps {
  videoBase64: string;
}

export default function PreviewReel({ videoBase64 }: PreviewReelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Reel Preview</h3>

      {/* Video Player */}
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
      </div>

      <p className="text-sm text-gray-400 text-center">
        Instagram Reel format (1080x1920, 30fps)
      </p>
    </div>
  );
}

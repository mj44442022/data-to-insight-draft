'use client';

import { useState } from 'react';

interface DownloadButtonsProps {
  carouselZip: string; // Base64
  reelVideo: string | null; // Base64 (null if video generation failed)
  caption: string;
  hashtags: string[];
}

export default function DownloadButtons({
  carouselZip,
  reelVideo,
  caption,
  hashtags,
}: DownloadButtonsProps) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const downloadFile = (base64: string, filename: string, mimeType: string) => {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timestamp = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Download Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() =>
            downloadFile(carouselZip, `carousel-${timestamp}.zip`, 'application/zip')
          }
          className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Carousel (ZIP)
        </button>

        <button
          onClick={() => reelVideo && downloadFile(reelVideo, `reel-${timestamp}.mp4`, 'video/mp4')}
          disabled={!reelVideo}
          className={`flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-lg transition-colors ${
            reelVideo
              ? 'bg-primary hover:bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          title={!reelVideo ? 'Video generation unavailable - use the script instead' : ''}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Reel (MP4) {!reelVideo && '(Unavailable)'}
        </button>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Instagram Caption
        </label>
        <div className="relative">
          <textarea
            readOnly
            value={caption}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none"
            rows={6}
          />
          <button
            onClick={() => copyToClipboard(caption, setCopiedCaption)}
            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {copiedCaption ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Hashtags</label>
        <div className="relative">
          <textarea
            readOnly
            value={hashtags.map((tag) => `#${tag}`).join(' ')}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none"
            rows={3}
          />
          <button
            onClick={() =>
              copyToClipboard(
                hashtags.map((tag) => `#${tag}`).join(' '),
                setCopiedHashtags
              )
            }
            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {copiedHashtags ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

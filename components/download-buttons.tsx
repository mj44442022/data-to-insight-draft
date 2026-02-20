'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface DownloadButtonsProps {
  carouselZipUrl: string; // ✅ URL from Vercel Blob
  reelVideoUrl: string | null; // ✅ URL from Vercel Blob (or null)
  caption: string;
  hashtags: string[];
  carouselSlides?: string[]; // Base64 encoded images for "Download All"
  reelScript?: Array<{
    sceneNumber: number;
    text: string;
    visualNote?: string;
  }>;
}

export default function DownloadButtons({
  carouselZipUrl,
  reelVideoUrl,
  caption,
  hashtags,
  carouselSlides = [],
  reelScript = [],
}: DownloadButtonsProps) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const downloadFileFromUrl = async (url: string, filename: string) => {
    try {
      // Fetch the file from the Blob URL
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAllAssets = async () => {
    try {
      setIsDownloadingAll(true);
      const zip = new JSZip();

      // Add carousel slides as individual PNG files
      if (carouselSlides.length > 0) {
        const carouselFolder = zip.folder('carousel-slides');
        carouselSlides.forEach((slideBase64, index) => {
          // Convert base64 to binary
          const binary = atob(slideBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          carouselFolder?.file(`slide-${index + 1}.png`, bytes, { binary: true });
        });
      }

      // Add teleprompter script as TXT file
      if (reelScript.length > 0) {
        let scriptContent = '=== TELEPROMPTER SCRIPT ===\n\n';
        reelScript.forEach((scene) => {
          scriptContent += `Scene ${scene.sceneNumber}:\n`;
          scriptContent += `${scene.text}\n`;
          if (scene.visualNote) {
            scriptContent += `[Visual: ${scene.visualNote}]\n`;
          }
          scriptContent += '\n';
        });
        zip.file('teleprompter-script.txt', scriptContent);
      }

      // Add caption and hashtags as TXT file
      let captionContent = '=== INSTAGRAM CAPTION ===\n\n';
      captionContent += caption + '\n\n';
      captionContent += '=== HASHTAGS ===\n\n';
      captionContent += hashtags.map((tag) => `#${tag}`).join(' ');
      zip.file('caption-and-hashtags.txt', captionContent);

      // Generate and download ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().split('T')[0];
      saveAs(blob, `instagram-content-${timestamp}.zip`);

    } catch (error) {
      console.error('Download All failed:', error);
      alert('Failed to create download bundle. Please try individual downloads.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const timestamp = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Download All Assets Button */}
      {carouselSlides.length > 0 && (
        <button
          onClick={downloadAllAssets}
          disabled={isDownloadingAll}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gold-500 to-coral-500 hover:scale-105 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-2xl shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          {isDownloadingAll ? 'Creating Bundle...' : 'Download All Assets (ZIP)'}
        </button>
      )}

      {/* Individual Download Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => downloadFileFromUrl(carouselZipUrl, `carousel-${timestamp}.zip`)}
          className="flex items-center justify-center gap-2 bg-gradient-warm hover:scale-105 text-navy-900 font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-glow-warm"
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
          onClick={() => reelVideoUrl && downloadFileFromUrl(reelVideoUrl, `reel-${timestamp}.mp4`)}
          disabled={!reelVideoUrl}
          className={`flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg transition-all shadow-lg ${
            reelVideoUrl
              ? 'bg-gradient-warm hover:scale-105 text-navy-900 shadow-glow-warm'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
          }`}
          title={!reelVideoUrl ? 'Video generation unavailable - use the script instead' : ''}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Reel (MP4) {!reelVideoUrl && '(Unavailable)'}
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

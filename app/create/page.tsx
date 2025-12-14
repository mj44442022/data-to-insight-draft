'use client';

import { useState } from 'react';
import Link from 'next/link';
import UploadForm from '@/components/upload-form';
import PreviewCarousel from '@/components/preview-carousel';
import PreviewReel from '@/components/preview-reel';
import DownloadButtons from '@/components/download-buttons';

interface GeneratedContent {
  carousel: {
    zip: string;
    slides: string[];
  };
  reel: {
    video: string | null;
    script: Array<{
      sceneNumber: number;
      text: string;
      imageIndex: number;
      duration: number;
    }>;
    videoError?: string;
  };
  caption: string;
  hashtags: string[];
}

export default function CreatePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (data: {
    images: File[];
    description: string;
    keyMessages: string;
    tone: string;
    contentPillar: string;
  }) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 1000);

      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('keyMessages', data.keyMessages);
      formData.append('tone', data.tone);
      formData.append('contentPillar', data.contentPillar);
      data.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details
          ? `${errorData.error}\n${errorData.details}${errorData.step ? `\nFailed at: ${errorData.step}` : ''}`
          : errorData.error || 'Generation failed';
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        setGeneratedContent(result);
        setProgress(100);
        console.log(`Content generated in ${result.generationTime}s`);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedContent(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-premium">
      {/* Sticky Header matching landing page */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent">
            ContentOS
          </Link>
          <div className="text-sm text-gray-400">
            ✨ AI-Powered Instagram Content Generator
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto pt-28 pb-12 px-4">
        {/* Header with gradient */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-cream mb-4 leading-tight">
            Create{' '}
            <span className="bg-gradient-warm bg-clip-text text-transparent">
              Instagram Content
            </span>
          </h1>
          <p className="text-cream/70 text-xl max-w-2xl mx-auto">
            Upload your photos and let AI create professional carousels & reels in minutes
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-red-500 font-semibold">Generation Failed</h3>
                <p className="text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!generatedContent ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 shadow-2xl">
            <UploadForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              progress={progress}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-gradient-to-r from-sage-500/20 to-gold-500/20 border border-sage-500/50 rounded-2xl p-6 shadow-glow-warm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-navy-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sage-400 font-bold text-lg">
                    🎉 Content Generated Successfully!
                  </p>
                  <p className="text-cream/60 text-sm">
                    Your professional carousel and reel are ready to download
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-glass">
                <PreviewCarousel slides={generatedContent.carousel.slides} />
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-glass">
                <PreviewReel
                  videoBase64={generatedContent.reel.video}
                  script={generatedContent.reel.script}
                  videoError={generatedContent.reel.videoError}
                />
              </div>
            </div>

            {/* Download Section */}
            <div className="bg-gradient-to-br from-gold-500/10 to-coral-500/10 border border-gold-500/30 rounded-3xl p-10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Download & Copy</h2>
              <DownloadButtons
                carouselZip={generatedContent.carousel.zip}
                reelVideo={generatedContent.reel.video}
                caption={generatedContent.caption}
                hashtags={generatedContent.hashtags}
              />
            </div>

            {/* Create Another Button */}
            <div className="text-center">
              <button
                onClick={handleReset}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a href="/" className="text-primary hover:text-blue-400 transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

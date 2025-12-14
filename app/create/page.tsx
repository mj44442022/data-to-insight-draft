'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Create Instagram Content
          </h1>
          <p className="text-gray-400 text-lg">
            Upload photos and let AI create your carousel and reel in minutes
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
          <div className="bg-gray-900 rounded-xl p-8 shadow-2xl">
            <UploadForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              progress={progress}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-500 font-semibold">
                  Content generated successfully!
                </p>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-xl p-6">
                <PreviewCarousel slides={generatedContent.carousel.slides} />
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <PreviewReel
                  videoBase64={generatedContent.reel.video}
                  script={generatedContent.reel.script}
                  videoError={generatedContent.reel.videoError}
                />
              </div>
            </div>

            {/* Download Section */}
            <div className="bg-gray-900 rounded-xl p-8">
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

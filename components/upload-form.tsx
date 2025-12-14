'use client';

import { useState, useRef } from 'react';

interface UploadFormProps {
  onGenerate: (data: {
    images: File[];
    description: string;
    keyMessages: string;
    tone: string;
    contentPillar: string;
  }) => void;
  isGenerating: boolean;
  progress: number;
}

export default function UploadForm({ onGenerate, isGenerating, progress }: UploadFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [keyMessages, setKeyMessages] = useState('');
  const [tone, setTone] = useState('Professional');
  const [contentPillar, setContentPillar] = useState('Mixed');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024); // 10MB max
    setImages((prev) => [...prev, ...validFiles].slice(0, 10));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length >= 3 && description.length >= 100 && keyMessages.length >= 20) {
      onGenerate({ images, description, keyMessages, tone, contentPillar });
    }
  };

  const isValid =
    images.length >= 3 &&
    images.length <= 10 &&
    description.length >= 100 &&
    description.length <= 500 &&
    keyMessages.length >= 20 &&
    !isGenerating;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Upload Images (3-10 images, max 10MB each)
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-gold-500 bg-gold-500/10'
              : 'border-gray-600 hover:border-gold-500/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-3"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs mt-1">PNG, JPG, WEBP up to 10MB</p>
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-400 mt-2">{images.length}/10 images uploaded</p>
      </div>

      {/* Business Description */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Business Description (100-500 characters)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="We automate Instagram content creation with AI, helping founders save 20+ hours per week..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none transition-all"
          rows={3}
          maxLength={500}
        />
        <p className="text-sm text-gray-400 mt-1">
          {description.length}/500 characters
        </p>
      </div>

      {/* Key Messages */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Key Messages (bullet points)
        </label>
        <textarea
          value={keyMessages}
          onChange={(e) => setKeyMessages(e.target.value)}
          placeholder="• 30X faster than manual creation&#10;• Save 20+ hours per week&#10;• Professional quality output&#10;• No design skills needed"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none transition-all"
          rows={4}
        />
      </div>

      {/* Tone Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
        >
          <option value="Professional">Professional</option>
          <option value="Casual">Casual</option>
          <option value="Inspiring">Inspiring</option>
          <option value="Educational">Educational</option>
        </select>
      </div>

      {/* Content Pillar Selector - Shannon's 4 H's Framework */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Content Pillar (Shannon's 4 H's Framework)
        </label>
        <select
          value={contentPillar}
          onChange={(e) => setContentPillar(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
        >
          <option value="Mixed">Mixed - Balanced approach across all pillars</option>
          <option value="Heard">Heard - Make audience feel seen & validated</option>
          <option value="Helpful">Helpful - Quick wins & bite-sized tips</option>
          <option value="Humor">Humor - Relatable situations that get shared</option>
          <option value="Happenings">Happenings - Behind-the-scenes content</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">
          {contentPillar === 'Heard' && '✨ Inspirational content that creates belonging and emotional connection'}
          {contentPillar === 'Helpful' && '💡 Mini-tutorials and instant gratification tips (not 10-step guides)'}
          {contentPillar === 'Humor' && '😄 Relatable moments that make people tag their friends'}
          {contentPillar === 'Happenings' && '🎬 Day-in-the-life and behind-the-scenes moments'}
          {contentPillar === 'Mixed' && '🎯 AI will blend all 4 pillars for maximum engagement'}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
          isValid
            ? 'bg-gradient-warm hover:scale-105 text-navy-900 shadow-glow-warm'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
        }`}
      >
        {isGenerating ? 'Generating...' : 'Generate Content'}
      </button>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-warm h-2 rounded-full transition-all duration-300 shadow-glow-gold"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 text-center">
            {progress < 20
              ? 'Analyzing images with AI...'
              : progress < 40
              ? 'Creating content plan...'
              : progress < 60
              ? 'Generating carousel slides...'
              : progress < 80
              ? 'Creating reel video...'
              : 'Finalizing...'}
          </p>
        </div>
      )}
    </form>
  );
}

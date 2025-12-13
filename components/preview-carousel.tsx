'use client';

import { useState } from 'react';

interface PreviewCarouselProps {
  slides: string[]; // Base64 encoded images
}

export default function PreviewCarousel({ slides }: PreviewCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Carousel Preview</h3>

      {/* Main Slide Display */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-square max-w-md mx-auto">
        <img
          src={`data:image/png;base64,${slides[currentSlide]}`}
          alt={`Slide ${currentSlide + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Slide Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`aspect-square rounded overflow-hidden border-2 transition-all ${
              currentSlide === index
                ? 'border-primary scale-105'
                : 'border-gray-600 opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={`data:image/png;base64,${slide}`}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

export function ImageCarousel({ images, className = '' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Function to go to the next image
  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  // Function to go to the previous image
  const prevImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevImage();
      } else if (event.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage]);

  // Auto advance every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(nextImage, 5000);
    return () => clearInterval(timer);
  }, [nextImage, images.length]);

  // Don't render anything if there are no images
  if (!images.length) return null;

  // Render a single image without controls if there's only one
  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        <Image
          src={images[0]}
          alt="Location"
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          onLoad={() => setIsLoading(false)}
          priority
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative group overflow-hidden rounded-lg ${className}`}>
      {/* Current Image */}
      <Image
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className="object-cover transition-opacity duration-500"
        onLoad={() => setIsLoading(false)}
        priority={currentIndex === 0}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Navigation Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
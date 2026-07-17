import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ImageSlider = ({ images = [], autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);

  // Ensure we have images
  const sliderImages = Array.isArray(images) && images.length > 0 
    ? images 
    : [
        { _id: 'default1', imageUrlResolved: '/NGO logo.jpeg', alt: 'Savitram Foundation' }
      ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || sliderImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlay, sliderImages.length, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  const handleMouseEnter = () => {
    setIsAutoPlay(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlay(autoPlay);
  };

  return (
    <div 
      className="relative w-full max-w-[400px] h-[460px] cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Slider Container */}
      <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl border border-white/20">
        
        {/* Images */}
        {sliderImages.map((img, index) => (
          <div
            key={img._id || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%)'
            }}
          >
            <img
              src={img.imageUrlResolved || img.imageUrl || '/NGO logo.jpeg'}
              alt={img.alt || `Slide ${index + 1}`}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading={index === currentIndex ? 'eager' : 'lazy'}
            />
            
            {/* Glossy liquid glass highlight layer */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)'
              }}
            />
          </div>
        ))}

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all duration-300 hover:bg-white/40 opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all duration-300 hover:bg-white/40 opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
          {currentIndex + 1} / {sliderImages.length}
        </div>
      </div>

      {/* Dot Indicators */}
      {sliderImages.length > 1 && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#1B5E20] w-8'
                  : 'bg-[#1B5E20]/40 hover:bg-[#1B5E20]/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {isAutoPlay && sliderImages.length > 1 && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white text-[10px] font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
          <span>Auto-playing</span>
        </div>
      )}
    </div>
  );
};

export default ImageSlider;

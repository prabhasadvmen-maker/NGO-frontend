import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';

export const HeroSection = () => {
  const { data: cms } = usePublicAPI('/api/public/cms/config');
  const { data: galleryImages } = usePublicAPI('/api/public/cms/gallery?limit=6');

  const heroTitle = cms?.heroTitle || 'Transforming Lives, Building Futures';
  const heroSubtitle = cms?.heroSubtitle || 'Empowering underprivileged communities across India with sustainable support in education, healthcare, and livelihood.';

  // Prepare slider images - use custom hero banners or fallback to gallery
  const sliderImages = cms?.heroBannerImages && cms.heroBannerImages.length > 0
    ? cms.heroBannerImages.map((img, idx) => ({
        _id: img._id || `slide-${idx}`,
        imageUrlResolved: img.imageUrlResolved || img.imageUrl || '/NGO logo.jpeg',
        alt: img.caption || 'Savitram Foundation'
      }))
    : Array.isArray(galleryImages) && galleryImages.length > 0
      ? galleryImages.map((img) => ({
          _id: img._id,
          imageUrlResolved: img.imageUrlResolved || img.imageUrl,
          alt: img.caption || 'Savitram Foundation'
        }))
      : [
          { _id: 'default1', imageUrlResolved: '/NGO logo.jpeg', alt: 'Savitram Foundation' }
        ];

  // Slider State & Auto-play effect
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Words split for custom coloring
  const words = heroTitle.split(' ');
  const firstPart = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const secondPart = words.slice(Math.ceil(words.length / 2)).join(' ');

  const renderWaveText = (text, highlight = false) => {
    return text.split(' ').map((word, wIdx) => (
      <span key={wIdx} className="inline-block whitespace-nowrap mr-2">
        {word.split('').map((char, cIdx) => (
          <span
            key={cIdx}
            className={`char-wave ${
              highlight ? 'text-[#4ade80] hover:text-[#F97316]' : 'text-white hover:text-[#4ade80]'
            }`}
            style={{ 
              animationDelay: `${cIdx * 30}ms`
            }}
          >
            {char}
          </span>
        ))}
      </span>
    ));
  };

  return (
    <section className="relative min-h-[92vh] pt-32 pb-20 flex items-center overflow-hidden bg-[#F8F7F4]">
      {/* Hidden prefetch block to load all slides in advance */}
      <div className="hidden" aria-hidden="true">
        {sliderImages.map((img, idx) => (
          <img
            key={idx}
            src={img.imageUrlResolved || img.imageUrl}
            alt="preload-asset"
            loading="eager"
          />
        ))}
      </div>

      {/* Background Image Slider - Full Screen (Full Bleed) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 select-none">
        {sliderImages.map((img, index) => (
          <div
            key={img._id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[1200ms] ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={img.imageUrlResolved || img.imageUrl}
              alt={img.alt || 'Savitram Banner'}
              className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                index === currentIndex ? 'scale-105' : 'scale-100'
              }`}
              loading="eager"
              fetchPriority={index === currentIndex ? "high" : "low"}
            />
          </div>
        ))}
        {/* Soft dark navy vignette overlay: darkens the left side slightly for maximum readability of white text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/65 via-[#0A1628]/25 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-30 w-full">
        {/* Typography Content Container - Clean Background None */}
        <div className="max-w-2xl space-y-8 text-left animate-fade-in py-4 sm:py-6 bg-transparent border-0 shadow-none">
          {/* Eyebrow */}
          <div className="inline-block relative">
            <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#F97316] uppercase">
              Together We Can
            </span>
            <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#F97316] rounded-full" />
          </div>

          {/* Main Headline with letter-by-letter hover wave effect */}
          <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight leading-[1.1] headline-reveal">
            {renderWaveText(firstPart, false)}
            {renderWaveText(secondPart, true)}
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 text-sm sm:text-base font-semibold max-w-xl leading-relaxed">
            {heroSubtitle}
          </p>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes charWave {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-8px);
              }
            }
            .char-wave {
              display: inline-block;
              transition: transform 0.2s ease, color 0.2s ease;
            }
            .char-wave:hover {
              animation: charWave 0.4s ease-in-out;
            }
          `}} />

          {/* Clean CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/crowdfunding"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F97316] text-xs font-extrabold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
            >
              <span>Donate Now</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/membership"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white text-xs font-extrabold text-white transition-all duration-300 hover:bg-white hover:text-[#0A1628] bg-transparent"
            >
              <span>Become a Member</span>
            </Link>
          </div>

          {/* Clean Trust badges */}
          <div className="flex flex-wrap items-center gap-5 pt-4 text-xs font-bold text-white/80">
            {[
              'Govt. Registered NGO',
              'Section 80G Tax Exempt',
              '100% Audit Transparency'
            ].map((badge, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} className="text-green-400" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Slider Indicator Dots */}
      {sliderImages.length > 1 && (
        <div className="absolute bottom-8 right-8 z-30 flex gap-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border-0 cursor-pointer ${
                index === currentIndex
                  ? 'bg-[#1B5E20] w-8'
                  : 'bg-[#1B5E20]/30 hover:bg-[#1B5E20]/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;

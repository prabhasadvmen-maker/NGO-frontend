import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import useScrollAnimation from '../hooks/useScrollAnimation';

export const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: testimonials, loading } = usePublicAPI('/api/public/cms/testimonials?limit=12');
  const [startIndex, setStartIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  // Fallbacks if empty
  const defaultTestimonials = [
    {
      _id: 't1',
      name: 'Ramesh Chaurasia',
      message: 'Savitram Foundation supported my daughter\'s school fees during my severe crop failure. I am forever grateful for their timely, empathetic assistance.',
      role: 'Beneficiary',
      branch: { name: 'Lucknow Branch' },
      avatarUrlResolved: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    {
      _id: 't2',
      name: 'Asha Devi',
      message: 'Learning stitching and receiving a sewing machine from the foundation helped me earn ₹6,000 monthly. I can support my children independently now.',
      role: 'Self-Help Member',
      branch: { name: 'Delhi Branch' },
      avatarUrlResolved: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    {
      _id: 't3',
      name: 'Dr. Vivek Saxena',
      message: 'As a volunteer medical doctor, I have seen first-hand the level of transparency and diligence Savitram maintains in managing patient camps.',
      role: 'Volunteer Medical Advisor',
      branch: { name: 'Lucknow Branch' },
      avatarUrlResolved: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'
    },
    {
      _id: 't4',
      name: 'Sneha Reddy',
      message: 'Working alongside this NGO has shown me the power of collective action and community support. Their commitment to reaching people is truly inspiring.',
      role: 'Donor',
      branch: { name: 'Central Office' },
      avatarUrlResolved: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    {
      _id: 't5',
      name: 'Rohit Khanna',
      message: 'I am grateful for the opportunity to support this NGO and its valuable work. Their dedication to helping vulnerable communities is highly commendable.',
      role: 'Supporter',
      branch: { name: 'Mumbai Branch' },
      avatarUrlResolved: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    }
  ];

  const list = Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : defaultTestimonials;

  // Responsive items count observer
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setCardsPerView(3);
      } else if (window.innerWidth >= 768) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset offset if cardsPerView changes to prevent blank gaps
  useEffect(() => {
    const maxIndex = Math.max(0, list.length - cardsPerView);
    if (startIndex > maxIndex) {
      setStartIndex(maxIndex);
    }
  }, [cardsPerView, list.length, startIndex]);

  // Autoplay sliding interval
  useEffect(() => {
    const maxIndex = list.length - cardsPerView;
    if (maxIndex <= 0) return;
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [list.length, cardsPerView]);

  const handlePrev = () => {
    const maxIndex = list.length - cardsPerView;
    if (maxIndex <= 0) return;
    setStartIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    const maxIndex = list.length - cardsPerView;
    if (maxIndex <= 0) return;
    setStartIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const maxIndex = Math.max(0, list.length - cardsPerView);

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-[#0A1628] text-white overflow-hidden reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16 relative">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-block relative">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
              Stories of Hope
            </span>
            <span className="absolute bottom-[-4px] left-1/4 w-1/2 h-[2px] bg-[#1B5E20] rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-white">
            What People Say
          </h2>
          <p className="text-xs text-white/50 font-semibold leading-relaxed">
            Heartfelt reviews and feedback from the beneficiaries, field members, and local supporters we work with.
          </p>
        </div>

        {/* Viewport Frame wrapping horizontal tray */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 bg-white/5 animate-pulse rounded-3xl border border-white/10" />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden w-full">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${startIndex * (100 / cardsPerView)}%)`,
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {list.map((item) => (
                  <div 
                    key={item._id}
                    className="px-4 flex-shrink-0 flex"
                    style={{ width: `${100 / cardsPerView}%` }}
                  >
                    <div 
                      className="relative rounded-3xl p-8 bg-white/5 border border-white/10 transition-all duration-300 hover:border-[#1B5E20] hover:-translate-y-1.5 select-none flex flex-col justify-between w-full shadow-xl min-h-[320px]"
                    >
                      {/* Quote Icon */}
                      <Quote size={40} className="text-[#1B5E20] opacity-15 absolute top-6 right-6 pointer-events-none" />

                      {/* Message */}
                      <p className="text-[12px] sm:text-[13px] italic text-white/85 leading-relaxed font-semibold mb-8 text-left z-10 pt-4">
                        "{item.message}"
                      </p>

                      {/* User node */}
                      <div className="flex items-center gap-4 text-left z-10 border-t border-white/10 pt-5 mt-auto">
                        {item.avatarUrlResolved || item.avatar ? (
                          <img 
                            src={item.avatarUrlResolved || item.avatar} 
                            alt={item.name} 
                            className="w-10 h-10 rounded-full object-cover border border-[#1B5E20]/40 flex-shrink-0"
                            loading="lazy"
                            decoding="async"
                            width="40"
                            height="40"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-extrabold text-white text-sm flex-shrink-0">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                          <p className="text-[9px] text-[#1B5E20] font-bold uppercase tracking-wider mt-0.5">
                            {item.role} • <span className="text-white/40">{item.branch?.name || 'Central'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slider Arrow Controls */}
          {maxIndex > 0 && !loading && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-[-12px] md:left-[-16px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0A1628] hover:bg-[#1B5E20] border border-white/15 hover:border-[#1B5E20] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer z-20 shadow-lg"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-[-12px] md:right-[-16px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0A1628] hover:bg-[#1B5E20] border border-white/15 hover:border-[#1B5E20] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer z-20 shadow-lg"
                aria-label="Next Slide"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Dot Pagination indicators */}
        {maxIndex > 0 && !loading && (
          <div className="flex justify-center gap-2 mt-4 z-20">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setStartIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  startIndex === idx 
                    ? 'bg-[#1B5E20] w-6' 
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default TestimonialsSection;

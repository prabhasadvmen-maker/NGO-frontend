import React from 'react';
import { Quote } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import useScrollAnimation from '../hooks/useScrollAnimation';

export const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: testimonials, loading } = usePublicAPI('/api/public/cms/testimonials?limit=3');

  // Fallbacks if empty
  const defaultTestimonials = [
    {
      _id: 't1',
      name: 'Ramesh Chaurasia',
      message: 'Savitram Foundation supported my daughters school fees during my severe crop failure. I am forever grateful for their timely, empathetic assistance.',
      role: 'Beneficiary',
      branch: { name: 'Lucknow Branch' }
    },
    {
      _id: 't2',
      name: 'Asha Devi',
      message: 'Learning stitching and receiving a sewing machine from the foundation helped me earn ₹6,000 monthly. I can support my children independently now.',
      role: 'Self-Help Member',
      branch: { name: 'Delhi Branch' }
    },
    {
      _id: 't3',
      name: 'Dr. Vivek Saxena',
      message: 'As a volunteer medical doctor, I have seen first-hand the level of transparency and diligence Savitram maintains in managing patient camps.',
      role: 'Volunteer Medical Advisor',
      branch: { name: 'Lucknow Branch' }
    }
  ];

  const list = Array.isArray(testimonials) && testimonials.length > 0 ? testimonials.slice(0, 3) : defaultTestimonials;

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-[#0A1628] text-white reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
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

        {/* Testimonials Grid (Glassmorphism layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))
          ) : (
            list.map((item) => (
              <div 
                key={item._id}
                className="relative rounded-2xl p-8 bg-white/5 border border-white/10 transition-all duration-300 hover:border-[#1B5E20] hover:-translate-y-1 select-none flex flex-col justify-between"
              >
                {/* Quote Icon */}
                <Quote size={48} className="text-[#1B5E20] opacity-40 absolute top-6 right-6" />

                {/* Message */}
                <p className="text-xs italic text-white/80 leading-relaxed font-semibold mb-8 text-left z-10 pt-4">
                  "{item.message}"
                </p>

                {/* User node */}
                <div className="flex items-center gap-4 text-left z-10 border-t border-white/10 pt-5">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-extrabold text-white text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                    <p className="text-[10px] text-[#1B5E20] font-bold uppercase tracking-wider mt-0.5">
                      {item.role} • <span className="text-white/40">{item.branch?.name || 'Central'}</span>
                    </p>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;

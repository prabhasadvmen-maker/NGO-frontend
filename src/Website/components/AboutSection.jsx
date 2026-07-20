import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Shield } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import useScrollAnimation from '../hooks/useScrollAnimation';

export const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: cms } = usePublicAPI('/api/public/cms/config');

  const missionText = cms?.mission || 'To inspire and support community growth through sustainable, locally-driven programs that offer long-term change.';
  const visionText = cms?.vision || 'A world of equal opportunities, health, education, and dignity for all individuals, regardless of their social background.';

  return (
    <section 
      ref={ref}
      className={`relative pt-28 pb-14 overflow-hidden bg-white reveal ${isVisible ? 'visible' : ''}`}
    >
      {/* Background large decorative text */}
      <div className="absolute left-[5%] top-1/2 -translate-y-1/2 select-none text-[10vw] font-black text-gray-500/5 font-display leading-none z-0">
        ABOUT US
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Left Column: Editorial Text */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-block relative">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
              Who We Are
            </span>
            <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#0A1628] leading-tight">
            Caring for Humanity, <br />
            <span className="text-[#1B5E20]">Restoring Human Dignity.</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#1B5E20]">
                <Compass size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Our Mission</h4>
              </div>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                {missionText}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#1B5E20]">
                <Shield size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Our Vision</h4>
              </div>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                {visionText}
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors duration-350"
            >
              <span>Discover Our Story</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Column: Stacked Offset Images with Neomorphic floating card */}
        <div className="lg:col-span-6 flex justify-center relative min-h-[380px]">
          {/* Main Background Image */}
          <div className="w-[280px] h-[340px] rounded-2xl overflow-hidden shadow-xl border border-gray-100 z-10 translate-x-[-20px]">
            <img 
              src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600" 
              alt="Community service" 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              width="280"
              height="340"
            />
          </div>

          {/* Front Offset Image */}
          <div className="absolute bottom-[-20px] right-[10%] sm:right-[15%] w-[200px] h-[240px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-20">
            <img 
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600" 
              alt="Children smile" 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              width="200"
              height="240"
            />
          </div>

          {/* Floating Neomorphic Established badge */}
          <div className="absolute top-[10%] right-[5%] sm:right-[10%] px-4 py-3 rounded-xl border border-white/50 neo-outset text-center z-20 select-none shadow-lg">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block leading-none">Established</span>
            <span className="text-lg font-black text-[#1B5E20] block mt-0.5 leading-none">2018</span>
          </div>

          {/* Decorative Connecting Lines (SVG behind) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20" stroke="#1B5E20" strokeWidth="2" fill="none">
            <path d="M 120 180 C 180 180, 220 280, 320 280" />
            <circle cx="120" cy="180" r="4" fill="#1B5E20" />
            <circle cx="320" cy="280" r="4" fill="#1B5E20" />
          </svg>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;

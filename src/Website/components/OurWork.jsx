import React, { useState } from 'react';
import { BookOpen, Activity, Sparkles, Smile, Leaf, Globe } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const CauseCard = ({ icon: Icon, title, desc, impact, isLarge }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-3xl p-8 overflow-hidden transition-all duration-500 cursor-pointer border border-white/10 flex flex-col justify-between group shadow-xl ${
        isLarge 
          ? 'col-span-1 md:col-span-2 bg-gradient-to-br from-[#0A1628] to-[#1B5E20]' 
          : 'col-span-1 bg-gradient-to-b from-[#0A1628] to-[#0A1628]/95'
      }`}
      style={{
        perspective: '800px',
        transform: hovered ? 'rotateX(4deg) translateY(-4px)' : 'none',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s'
      }}
    >
      {/* Liquid Glass top overlay reflection */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
          clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 40%)'
        }}
      />

      {/* Cause Icon */}
      <div className="text-white/60 group-hover:text-white transition-colors duration-300">
        <Icon size={isLarge ? 56 : 42} />
      </div>

      {/* Description Content */}
      <div className="mt-12 space-y-3 z-10 relative">
        <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">{title}</h3>
        <p className="text-xs text-white/70 leading-relaxed font-semibold">
          {desc}
        </p>
      </div>

      {/* Impact Badge */}
      <div className="mt-8 flex items-center justify-between z-10 relative">
        <span className="text-[10px] font-bold text-[#64748B] group-hover:text-white/80 transition-colors uppercase tracking-widest">Impact Reach</span>
        <span className="text-lg font-black text-[#F97316] group-hover:text-[#F59E0B] transition-colors">{impact}</span>
      </div>

      {/* Hover Clip-path overlay that slides up */}
      <div 
        className="absolute inset-0 bg-[#1B5E20] p-8 flex flex-col justify-between transition-all duration-500 ease-in-out pointer-events-none"
        style={{
          clipPath: hovered ? 'circle(150% at 50% 100%)' : 'circle(0% at 50% 100%)',
          transition: 'clip-path 0.6s ease-in-out'
        }}
      >
        <Icon size={32} className="text-white/80" />
        <div className="space-y-2 text-left">
          <h4 className="font-display font-bold text-lg text-white">{title}</h4>
          <p className="text-[11px] text-white/90 font-medium leading-relaxed">{desc}</p>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span className="text-[10px] font-bold uppercase tracking-widest">Active Reach</span>
          <span className="text-lg font-black text-white">{impact}</span>
        </div>
      </div>
    </div>
  );
};

export const OurWork = ({ pageMode = false }) => {
  const { ref, isVisible } = useScrollAnimation();

  const causes = [
    { icon: BookOpen, title: 'Quality Education', desc: 'Providing scholarships, books, modern classroom setups, and vocational skill programs to children.', impact: '4,500+ Children', isLarge: true },
    { icon: Activity, title: 'Healthcare Camps', desc: 'Free medical diagnosis checkups, distributed medicines, and hygiene kits.', impact: '3,200+ Served', isLarge: false },
    { icon: Sparkles, title: 'Women Empowerment', desc: 'Self-help group setups, tailoring centers, and micro-financing resources.', impact: '1,200+ Empowered', isLarge: false },
    { icon: Smile, title: 'Child Welfare', desc: 'Nutrition programs, safety shelters, and emotional counseling centers.', impact: '1,800+ Protected', isLarge: false },
    { icon: Leaf, title: 'Environment Green', desc: 'Tree planting drives, plastic recycling campaigns, and water harvesting setups.', impact: '15+ Villages', isLarge: false },
    { icon: Globe, title: 'Community Growth', desc: 'Rural road renovations, solar light installations, and clean drinking water tubes.', impact: '12+ Districts', isLarge: true },
  ];

  return (
    <section 
      ref={ref}
      className={pageMode ? `relative py-8 bg-transparent reveal ${isVisible ? 'visible' : ''}` : `relative py-32 bg-[#F8F7F4] reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Title Header */}
        {!pageMode && (
          <div className="max-w-xl text-left space-y-4">
            <div className="inline-block relative">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
                Our Core Sectors
              </span>
              <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#0A1628] leading-tight">
              How We Empower <br />
              <span className="text-[#1B5E20]">Indian Communities.</span>
            </h2>
            <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
              By addressing core developmental challenges, we create multiple pillars of empowerment to drive lasting growth.
            </p>
          </div>
        )}

        {/* Asymmetric Cause Tiles Grid */}
        <div className={pageMode ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"}>
          {causes.map((cause, i) => (
            <CauseCard key={i} {...cause} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurWork;

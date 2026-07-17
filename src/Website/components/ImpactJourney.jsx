import React from 'react';
import { User, Users, Heart, Zap, Star } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const TimelineNode = ({ step, index }) => {
  const { ref, isVisible } = useScrollAnimation();
  const Icon = step.icon;

  const isEven = index % 2 === 0;

  return (
    <div 
      ref={ref}
      className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center reveal ${
        isVisible ? 'visible' : ''
      }`}
    >
      {/* Node Content Card */}
      <div className={`space-y-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-lg relative z-10 ${
        isEven ? 'md:order-1 text-left' : 'md:order-2 text-left'
      }`}
      style={{
        boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF'
      }}>
        {/* Step Badge */}
        <div className="flex items-center justify-between">
          <span className="text-4xl font-black text-gray-200 outline-text select-none">
            0{index + 1}
          </span>
          <div className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[9px] font-bold uppercase tracking-widest border border-gray-100">
            {step.metric}
          </div>
        </div>
        <h3 className="font-display font-extrabold text-lg text-[#0A1628]">{step.title}</h3>
        <p className="text-xs text-[#64748B] leading-relaxed font-semibold">{step.desc}</p>
      </div>

      {/* Central Timeline Dot Badge (Absolute positioned relative to timeline line) */}
      <div className="absolute left-[20px] md:left-1/2 top-1/2 -translate-x-[20px] md:-translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white transition-all duration-500 ${
            isVisible ? 'scale-110' : 'scale-90 opacity-60'
          }`}
          style={{ backgroundColor: step.color }}
        >
          <Icon size={16} />
        </div>
      </div>

      {/* Empty space for spacing in desktop */}
      <div className={`hidden md:block ${isEven ? 'md:order-2' : 'md:order-1'}`} />
      
      <style dangerouslySetInnerHTML={{__html: `
        .outline-text {
          -webkit-text-stroke: 1px #E2E8F0;
          color: transparent;
        }
      `}} />
    </div>
  );
};

export const ImpactJourney = () => {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    { icon: User, title: 'A Person in Need', desc: 'An individual or child in rural India faces systemic hurdles in health, lack of nutrition, or learning resources.', metric: 'Crisis identified', color: '#64748B' },
    { icon: Users, title: 'Community Reaches Out', desc: 'Our branch volunteers coordinate local checkups or check school attendance gaps in villages.', metric: 'Local assessment', color: '#2196F3' },
    { icon: Heart, title: 'Your Support Arrives', desc: 'Generous donors contribute towards targeted crowdfunding campaigns or general programs.', metric: 'Funding allocated', color: '#F97316' },
    { icon: Zap, title: 'We Take Action', desc: 'SAVITRAM FOUNDATION organizes medical supply deliveries, issues class materials, or starts tailoring batches.', metric: 'Execution phase', color: '#1B5E20' },
    { icon: Star, title: 'Lives Transform', desc: 'A child gets accredited education, a mother starts her business, and dignity is restored.', metric: 'Sustainable success', color: '#F59E0B' }
  ];

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-[#F8F7F4] reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Title Header */}
        <div className="text-center space-y-4 mb-20 max-w-xl mx-auto">
          <div className="inline-block relative">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
              The Path to Change
            </span>
            <span className="absolute bottom-[-4px] left-1/4 w-1/2 h-[2px] bg-[#1B5E20] rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#0A1628]">
            The Journey of Impact
          </h2>
          <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
            From discovering local needs to delivering permanent life transformation, see how our cycle of support works.
          </p>
        </div>

        {/* Vertical Timeline Wrapper */}
        <div className="relative space-y-16 py-8">
          {/* Vertical central timeline line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 h-full w-[2px] bg-gray-200 -translate-x-[20px] md:-translate-x-1/2 z-0" />
          
          {steps.map((step, idx) => (
            <TimelineNode key={idx} step={step} index={idx} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default ImpactJourney;

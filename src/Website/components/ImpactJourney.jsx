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
      {/* Node Content Card - Frosted Glassmorphism */}
      <div className={`space-y-4 p-8 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 relative z-10 transition-all duration-500 hover:bg-white/10 hover:border-white/20 shadow-2xl ${
        isEven ? 'md:order-1 text-left' : 'md:order-2 text-left'
      }`}>
        {/* Step Badge */}
        <div className="flex items-center justify-between">
          <span className="text-4xl font-black text-white/10 tracking-widest select-none font-display">
            0{index + 1}
          </span>
          <div className="px-3 py-1 bg-white/10 text-white/95 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10">
            {step.metric}
          </div>
        </div>
        <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">{step.title}</h3>
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">{step.desc}</p>
      </div>

      {/* Central Timeline Dot Badge */}
      <div className="absolute left-[20px] md:left-1/2 top-1/2 -translate-x-[20px] md:-translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white border border-white/20 transition-all duration-500 shadow-xl ${
            isVisible ? 'scale-110 rotate-12' : 'scale-90 opacity-60'
          }`}
          style={{ 
            backgroundColor: step.color,
            boxShadow: `0 0 20px ${step.color}80`
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      {/* Empty space for spacing in desktop */}
      <div className={`hidden md:block ${isEven ? 'md:order-2' : 'md:order-1'}`} />
    </div>
  );
};

export const ImpactJourney = () => {
  const { ref, isVisible } = useScrollAnimation();

  // Advanced-level operational lifecycle stages
  const steps = [
    { 
      icon: User, 
      title: '1. Diagnostic Needs Assessment', 
      desc: 'Conducting rigorous local surveys in marginalized rural villages to identify critical vulnerabilities across health indices, learning resource deficits, and nutrition access.', 
      metric: 'Needs Assessment', 
      color: '#64748B' 
    },
    { 
      icon: Users, 
      title: '2. Collaborative Mobilization', 
      desc: 'Deploying grassroots change agents and village community leaders to analyze micro-data, coordinate field checkups, and mapping school attendance gaps.', 
      metric: 'Local Action', 
      color: '#2196F3' 
    },
    { 
      icon: Heart, 
      title: '3. Transparent Micro-Financing', 
      desc: 'Channeling targeted donor capital directly to verified campaign pools. Donors trace the exact allocation path to ensure 100% financial alignment.', 
      metric: 'Capital Allocation', 
      color: '#F97316' 
    },
    { 
      icon: Zap, 
      title: '4. Systemic Project Deployment', 
      desc: 'Executing specialized medical interventions, establishing community skill centers, distributing educational kits, and initiating sanitary clean-water facilities.', 
      metric: 'Project Execution', 
      color: '#1B5E20' 
    },
    { 
      icon: Star, 
      title: '5. Generational Impact Audit', 
      desc: 'Auditing long-term socio-economic parameters and class graduation metrics to guarantee permanent self-reliance and autonomous community mobility.', 
      metric: 'Generational Success', 
      color: '#F59E0B' 
    }
  ];

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600')] bg-cover bg-center bg-[#0A1628]/92 bg-blend-multiply bg-fixed text-white reveal ${
        isVisible ? 'visible' : ''
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 relative z-30">
        
        {/* Title Header */}
        <div className="text-center space-y-4 mb-24 max-w-2xl mx-auto">
          <div className="inline-block relative">
            <span className="text-[10px] font-black tracking-[0.25em] text-green-400 uppercase">
              Operational Lifecycle
            </span>
            <span className="absolute bottom-[-4px] left-1/4 w-1/2 h-[2px] bg-green-400 rounded-full" />
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight text-white">
            The Journey of Impact
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-semibold leading-relaxed">
            A transparent, metrics-driven pipeline transforming donor capital into permanent, multi-generational self-reliance across Indian rural communities.
          </p>
        </div>

        {/* Vertical Timeline Wrapper */}
        <div className="relative space-y-16 py-8">
          {/* Vertical central timeline line with glowing gradient */}
          <div className="absolute left-[20px] md:left-1/2 top-0 h-full w-[2px] bg-gradient-to-b from-gray-500/20 via-orange-500/40 to-[#F59E0B] -translate-x-[20px] md:-translate-x-1/2 z-0" />
          
          {steps.map((step, idx) => (
            <TimelineNode key={idx} step={step} index={idx} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default ImpactJourney;

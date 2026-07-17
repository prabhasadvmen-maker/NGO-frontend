import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, ShieldCheck, TrendingUp, Heart } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const ProgressBar = ({ label, percentage, color, trigger }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-gray-150 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out-expo"
          style={{ 
            width: trigger ? `${percentage}%` : '0%',
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

export const TransparencySection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-white reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left: Content Description */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-block relative">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
              Financial Integrity
            </span>
            <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#0A1628] leading-tight">
            Your Support. <br />
            <span className="text-[#1B5E20]">Real, Audited Impact.</span>
          </h2>
          
          <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
            At SAVITRAM FOUNDATION, we believe that transparency is the cornerstone of public trust. Every single rupee donated is logged, audited, and directed straight to field operations.
          </p>

          {/* Key trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-emerald-50 text-[#1B5E20] rounded-lg mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0A1628]">Verified Audit logs</h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Regularly audited by certified chartered accountants.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-emerald-50 text-[#1B5E20] rounded-lg mt-0.5">
                <TrendingUp size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0A1628]">92% Efficiency Rate</h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Over 92% of funds directly support community programs.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/projects" // redirects to projects or transparency details
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors"
            >
              <span>View Full Transparency Report</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right: Utilizations meters */}
        <div className="lg:col-span-6 p-8 rounded-3xl bg-[#F8F7F4] border border-gray-100 space-y-6 text-left"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <div className="pb-4 border-b border-gray-200 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0A1628]">Fund Utilization</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">How your donations are distributed</p>
            </div>
            <BarChart2 size={18} className="text-[#1B5E20]" />
          </div>

          <ProgressBar label="Education & Scholarships" percentage={45} color="#1B5E20" trigger={isVisible} />
          <ProgressBar label="Rural Healthcare & Sanitation" percentage={28} color="#2196F3" trigger={isVisible} />
          <ProgressBar label="Women Skilling & Livelihood" percentage={14} color="#9C27B0" trigger={isVisible} />
          <ProgressBar label="Administrative & Audit Expenses" percentage={8} color="#64748B" trigger={isVisible} />
          <ProgressBar label="Emergency Relief reserves" percentage={5} color="#F97316" trigger={isVisible} />
        </div>

      </div>
    </section>
  );
};

export default TransparencySection;

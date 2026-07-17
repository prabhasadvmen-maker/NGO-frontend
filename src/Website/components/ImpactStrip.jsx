import React from 'react';
import { Users, Award, ShieldAlert, Heart, Calendar, Building } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import useScrollAnimation from '../hooks/useScrollAnimation';
import useCounter from '../hooks/useCounter';

const StatCard = ({ icon: Icon, value, label, suffix = '', trigger }) => {
  const animatedValue = useCounter(value, 2000, trigger);

  return (
    <div className="flex flex-col p-6 bg-white/5 border-t-2 border-[#1B5E20] border-x border-b border-white/5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 select-none">
      <div className="text-white/40 mb-3 self-start">
        <Icon size={24} />
      </div>
      <div className="text-3xl font-black text-white tracking-tight counter-number text-left">
        {animatedValue.toLocaleString()}{suffix}
      </div>
      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1 text-left">
        {label}
      </div>
    </div>
  );
};

export const ImpactStrip = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: statsData } = usePublicAPI('/api/public/stats');

  const livesCount = statsData?.livesImpacted || 12500;
  const volunteersCount = statsData?.volunteersCount || 450;
  const projectsCount = statsData?.projectsCount || 35;
  const branchesCount = statsData?.branchesCount || 1;
  const membersCount = statsData?.membersCount || 500;

  const currentYear = new Date().getFullYear();
  const yearsOfService = Math.max(currentYear - 2018, 1);

  return (
    <section 
      ref={ref}
      className={`relative z-20 max-w-7xl mx-auto px-6 -mt-10 mb-16 reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="bg-[#0A1628] rounded-[24px] p-8 shadow-2xl border border-white/10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard icon={Heart} value={livesCount} label="Lives Impacted" suffix="+" trigger={isVisible} />
        <StatCard icon={Users} value={volunteersCount} label="Volunteers" suffix="+" trigger={isVisible} />
        <StatCard icon={Award} value={projectsCount} label="Projects Done" trigger={isVisible} />
        <StatCard icon={Building} value={branchesCount} label="Active Branches" trigger={isVisible} />
        <StatCard icon={Users} value={membersCount} label="Active Members" suffix="+" trigger={isVisible} />
        <StatCard icon={Calendar} value={yearsOfService} label="Years of Service" trigger={isVisible} />
      </div>
    </section>
  );
};

export default ImpactStrip;

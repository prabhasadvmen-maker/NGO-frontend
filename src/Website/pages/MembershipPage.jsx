import React, { useState } from 'react';
import { Shield, Award, Gem, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';
import usePublicAPI from '../hooks/usePublicAPI';

export const MembershipPage = () => {
  const [tier, setTier] = useState('Silver Member');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const { data: apiTiers, loading: tiersLoading } = usePublicAPI('/api/membership-types');

  const handleRegister = (e) => {
    e.preventDefault();
    window.location.href = '/member/register';
  };

  const iconMap = [Shield, Star, Award, Gem];
  const colorMap = ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2'];

  const tiers = Array.isArray(apiTiers) && apiTiers.length > 0
    ? apiTiers.map((t, i) => ({
        icon: iconMap[i % iconMap.length],
        name: t.name,
        fee: t.annualFee !== undefined ? `₹${t.annualFee.toLocaleString('en-IN')}/year` : 'Contact Us',
        desc: t.description || (Array.isArray(t.benefits) ? t.benefits.join(', ') : '') || 'Contact us for full benefits details.',
        color: colorMap[i % colorMap.length],
        _id: t._id
      }))
    : [
        { icon: Shield, name: 'Bronze Member', fee: '₹1,000/year', desc: 'Newsletter publications, annual audit sheets delivery, and event access tags.', color: '#CD7F32' },
        { icon: Star, name: 'Silver Member', fee: '₹5,000/year', desc: 'Bronze rewards + direct volunteer credit certificates and branch community access.', color: '#C0C0C0' },
        { icon: Award, name: 'Gold Member', fee: '₹15,000/year', desc: 'Silver rewards + invitation tags to board meeting reviews and priority project reports.', color: '#FFD700' },
        { icon: Gem, name: 'Platinum Member', fee: '₹50,000/year', desc: 'Gold rewards + executive council vote, advisory board panel seat, and name plaques.', color: '#E5E4E2' }
      ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="NGO Membership" description="Apply for SAVITRAM FOUNDATION membership programs. Support our audited campaigns with Bronze, Silver, Gold, or Platinum tiers." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        {/* Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 text-left border-b border-gray-200/50 mb-16">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Become Partner
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Membership Portal
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Join the steering committee of our audited community welfare models.</p>
        </div>

        {/* Tiers Grid */}
        {tiersLoading ? (
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[1,2,3,4].map(n => (
              <div key={n} className="h-48 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 text-left">
            {tiers.map((t, idx) => {
              const Icon = t.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => setTier(t.name)}
                  className={`rounded-2xl p-6 bg-white border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                    tier === t.name 
                      ? 'border-[#1B5E20] ring-2 ring-[#1B5E20]/15' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                  style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display font-extrabold text-base text-[#0A1628]">{t.name}</h3>
                  <p className="text-sm font-black text-[#1B5E20] mt-1">{t.fee}</p>
                  <p className="text-[11px] text-gray-400 font-semibold leading-relaxed mt-3 pt-3 border-t border-gray-50">{t.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Application Form */}
        <div className="max-w-xl mx-auto px-6">
          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-lg text-left"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            
            <h3 className="font-display font-extrabold text-xl text-[#0A1628] mb-1">Apply for Membership</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6">Selected Tier: <span className="text-[#1B5E20]">{tier}</span></p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-[#1B5E20] rounded-xl text-xs font-extrabold text-white hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md mt-2 transition-all hover:scale-[1.01]"
              >
                <span>Submit Membership Request</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default MembershipPage;

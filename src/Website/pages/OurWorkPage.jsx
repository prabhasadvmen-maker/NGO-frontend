import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Award, ArrowRight, Activity, Smile, Target } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';
import OurWork from '../components/OurWork';

export const OurWorkPage = () => {
  const approaches = [
    {
      icon: Target,
      title: '1. Identify',
      desc: 'We assess ground-level needs through active branch surveys, field checks, and local school audits.'
    },
    {
      icon: Activity,
      title: '2. Execute',
      desc: 'Targeted programs are executed through branch operations with strict inventory tracking and digital checkups.'
    },
    {
      icon: Award,
      title: '3. Measure',
      desc: 'Impact metrics and budgets are published transparently for complete public trust.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Our Work & Causes" description="Learn about the six core development sectors of SAVITRAM FOUNDATION. We work on education, healthcare, environment, and rural audits." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        {/* Page Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200/50 mb-12">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Areas of Focus
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Our Work & Causes
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Six pillars of sustainable community development in India.</p>
        </div>

        {/* Existing Cause Tiles Section */}
        <OurWork pageMode={true} />

        {/* Our Approach section */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-250/20">
          <div className="space-y-4 mb-16 text-left max-w-xl">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">Methodology</span>
            <h2 className="font-display font-black text-3xl text-[#0A1628]">Our Three-Step Approach</h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              How we convert your support into sustainable village transformation models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {approaches.map((app, idx) => {
              const Icon = app.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-gray-100/50 shadow-md"
                  style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display font-extrabold text-sm text-[#0A1628]">{app.title}</h3>
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mt-2">{app.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Support */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl p-12 bg-gradient-to-r from-[#0A1628] to-[#1B5E20] text-white flex flex-col items-center justify-center space-y-6 text-center">
            <h2 className="font-display font-black text-3xl sm:text-4xl">Want to Support Our Work?</h2>
            <p className="text-xs text-white/70 max-w-xl font-semibold leading-relaxed">
              Choose an active crowdfunding campaign to direct your support. 100% of your contributions go straight to on-field kits.
            </p>
            <Link to="/crowdfunding" className="px-6 py-3 rounded-full bg-[#F97316] text-xs font-extrabold text-white hover:scale-105 transition-transform flex items-center gap-1.5 shadow-lg shadow-orange-500/25">
              <span>View Active Campaigns</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default OurWorkPage;

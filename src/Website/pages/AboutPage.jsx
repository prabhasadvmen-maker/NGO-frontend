import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Award, MapPin, Heart, ArrowRight } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const AboutPage = () => {
  const { data: cms } = usePublicAPI('/api/public/cms/config');
  const { data: branches } = usePublicAPI('/api/public/branches');

  const missionText = cms?.mission || 'To inspire and support community growth through sustainable, locally-driven programs that offer long-term change.';
  const visionText = cms?.vision || 'A world of equal opportunities, health, education, and dignity for all individuals, regardless of their social background.';

  const timeline = [
    { year: '2018', title: 'Foundation Laid', desc: 'Started in Lucknow with 3 volunteers auditing village classrooms.' },
    { year: '2020', title: 'COVID Medical Response', desc: 'Distributed over 10,000+ hygiene kits and set up 15 diagnostic camps.' },
    { year: '2022', title: 'Branch Expansion', desc: 'Established branch offices in Delhi and Kanpur, expanding child skilling programs.' },
    { year: '2024', title: 'Accreditation & Audits', desc: 'Successfully audited and verified 92% financial efficiency benchmarks.' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Our Story & Vision" description="Learn about the mission, values, history, and branches of SAVITRAM FOUNDATION NGO." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        {/* Banner Title */}
        <div className="max-w-7xl mx-auto px-6 py-12 text-left border-b border-gray-200/50 mb-16">
          <div className="inline-block relative">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
              Our Identity
            </span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] leading-tight mt-3">
            About Savitram Foundation
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Humankind meets structured, transparent operations.</p>
        </div>

        {/* Mission, Vision, Values */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch mb-24">
          <div className="rounded-3xl p-8 bg-white border border-gray-100 flex flex-col justify-between text-left shadow-lg"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            <div className="w-12 h-12 rounded-2xl bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center mb-6">
              <Compass size={24} />
            </div>
            <h2 className="font-display font-black text-2xl text-[#0A1628] mb-3">Our Core Mission</h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed flex-1">
              {missionText}
            </p>
          </div>

          <div className="rounded-3xl p-8 bg-white border border-gray-100 flex flex-col justify-between text-left shadow-lg"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            <div className="w-12 h-12 rounded-2xl bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center mb-6">
              <Shield size={24} />
            </div>
            <h2 className="font-display font-black text-2xl text-[#0A1628] mb-3">Our Long-term Vision</h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed flex-1">
              {visionText}
            </p>
          </div>
        </section>

        {/* History Timeline */}
        <section className="max-w-7xl mx-auto px-6 mb-24 text-left">
          <h2 className="font-display font-black text-3xl text-[#0A1628] mb-12">Our Journey Timeline</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {timeline.map((item, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-white border border-gray-100/50 shadow-md relative"
                style={{ boxShadow: '4px 4px 8px #DCDCDC, -4px -4px 8px #FFFFFF' }}
              >
                <div className="text-xs font-black text-[#1B5E20] mb-2">{item.year}</div>
                <h3 className="font-display font-extrabold text-sm text-[#0A1628] mb-1.5">{item.title}</h3>
                <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Active Branches Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-24 text-left">
          <h2 className="font-display font-black text-3xl text-[#0A1628] mb-12">Our Active Branches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(branches) && branches.length > 0 ? (
              branches.map((b) => (
                <div 
                  key={b._id} 
                  className="p-6 rounded-2xl bg-white border border-gray-100 flex gap-4 shadow-md items-start"
                  style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
                >
                  <div className="p-3 bg-[#1B5E20]/10 text-[#1B5E20] rounded-xl flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-sm text-[#0A1628]">{b.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{b.code}</p>
                    {b.address && <p className="text-[11px] text-gray-500 font-medium leading-relaxed pt-1">{b.address}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-gray-100 flex gap-4 shadow-md items-start"
                style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
              >
                <div className="p-3 bg-[#1B5E20]/10 text-[#1B5E20] rounded-xl flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-sm text-[#0A1628]">Noida Branch (HQ)</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">NDA-01</p>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed pt-1">A-13, GRAPHIX 2 SECTOR 62, UPPER GROUND FLOOR, Noida, Noida, Gautam Buddha Nagar - 201301, Uttar Pradesh</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA: Join Us */}
        <section className="max-w-7xl mx-auto px-6 text-center">
          <div className="rounded-3xl p-12 bg-gradient-to-r from-[#0A1628] to-[#1B5E20] text-white flex flex-col items-center justify-center space-y-6">
            <h2 className="font-display font-black text-3xl sm:text-4xl">Help Us Build a Better Tomorrow</h2>
            <p className="text-xs text-white/70 max-w-xl font-semibold leading-relaxed">
              Whether through direct donations, active volunteering, or taking up a membership level, your participation is what drives permanent change.
            </p>
            <div className="flex gap-4">
              <Link to="/volunteer" className="px-6 py-3 rounded-full bg-[#F97316] text-xs font-extrabold text-white hover:scale-105 transition-transform flex items-center gap-1.5 shadow-lg shadow-orange-500/25">
                <span>Volunteer Now</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/membership" className="px-6 py-3 rounded-full border border-white text-xs font-extrabold text-white hover:bg-white/10 transition-colors">
                Become a Member
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default AboutPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Heart, Calendar, ArrowRight, Loader, Inbox } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

const CampaignCard = ({ camp }) => {
  const target = camp.targetAmount || 1;
  const raised = camp.raisedAmount || 0;
  const percent = Math.min(Math.round((raised / target) * 100), 100);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percent);
    }, 150);
    return () => clearTimeout(timer);
  }, [percent]);

  const getDaysLeft = (d) => {
    const end = new Date(d);
    const today = new Date();
    const diff = end - today;
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const daysLeft = getDaysLeft(camp.endDate);
  const isCompleted = camp.status === 'Completed' || raised >= target;

  return (
    <div 
      className="rounded-2xl overflow-hidden bg-white border border-gray-100 flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group text-left"
      style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
    >
      {/* Visual cover top frame */}
      <div className="h-[180px] overflow-hidden bg-gradient-to-r from-[#0A1628] to-[#1B5E20] relative flex items-center justify-center p-6 text-white text-center">
        <h3 className="font-display font-black text-lg leading-snug group-hover:text-white/90 transition-colors">{camp.title}</h3>
        <span className="absolute bottom-4 right-4 px-2.5 py-0.5 bg-[#F97316] text-white text-[8px] font-bold uppercase tracking-widest rounded-full shadow-md">
          {camp.branch?.name || 'Central Branch'}
        </span>
        <span className={`absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-md ${
          isCompleted 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-orange-50 text-orange-700 border border-orange-100'
        }`}>
          {isCompleted ? 'Completed' : 'Active'}
        </span>
      </div>

      {/* Card Details content */}
      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
        <p className="text-xs text-[#64748B] font-medium leading-relaxed line-clamp-2">
          {camp.description}
        </p>

        {/* Stats details & progress */}
        <div className="space-y-4 border-t border-gray-50 pt-4">
          <div className="grid grid-cols-3 gap-2 text-xs font-bold text-gray-700">
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none">Goal</span>
              <span className="text-sm font-black text-[#0A1628] mt-1 block">₹{target.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none">Raised</span>
              <span className="text-sm font-black text-[#1B5E20] mt-1 block">₹{raised.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none">Status</span>
              <span className="text-sm font-black text-[#F97316] mt-1 block">
                {isCompleted ? 'Ended' : `${daysLeft} days`}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out-expo ${
                  isCompleted ? 'bg-[#1B5E20]' : 'bg-[#F97316]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase mt-1.5">
              <span>{percent}% Funded</span>
              <span>{!isCompleted && daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Campaign Ended'}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-50">
          <Link 
            to={`/crowdfunding/${camp._id}`}
            className="w-full py-3 rounded-xl bg-[#F97316] text-xs font-extrabold text-white hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <span>Support This Campaign</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export const CrowdfundingPage = () => {
  const { data: campaigns, loading } = usePublicAPI('/api/public/campaigns');

  const defaultCampaigns = [
    { 
      _id: 'c1', 
      title: 'Clean Water for 500 Families', 
      description: 'Installing solar-powered deep borewell pumps and community water filtration systems in Uttar Pradesh villages.', 
      targetAmount: 500000, 
      raisedAmount: 320000, 
      startDate: new Date().toISOString(), 
      endDate: new Date(Date.now() + 30*24*3600000).toISOString(), 
      status: 'Active', 
      branch: { name: 'Lucknow' } 
    },
    { 
      _id: 'c2', 
      title: 'Digital Education Drive', 
      description: 'Setting up computer lab infrastructure and internet services in rural government primary schools.', 
      targetAmount: 800000, 
      raisedAmount: 450000, 
      startDate: new Date().toISOString(), 
      endDate: new Date(Date.now() + 45*24*3600000).toISOString(), 
      status: 'Active', 
      branch: { name: 'Delhi' } 
    },
    { 
      _id: 'c3', 
      title: 'Women Skill Development', 
      description: 'Orientation training for the first tailoring batch of rural self-employed programs.', 
      targetAmount: 300000, 
      raisedAmount: 300000, 
      startDate: new Date().toISOString(), 
      endDate: new Date(Date.now() - 5*24*3600000).toISOString(), 
      status: 'Completed', 
      branch: { name: 'Kanpur' } 
    }
  ];

  const list = Array.isArray(campaigns) && campaigns.length > 0 ? campaigns : defaultCampaigns;

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Support Our Campaigns" description="Donate to verified, active crowdfunding campaigns run by SAVITRAM FOUNDATION to support education and health." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        {/* Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200/50 mb-12">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Direct Crowdfunding
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Support Our Campaigns
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Every donation changes lives directly. Trace funds in real-time.</p>
        </div>

        {/* Campaigns listing */}
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Inbox size={48} className="stroke-1" />
              <p className="font-semibold text-sm">No active campaigns found. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((camp) => (
                <CampaignCard key={camp._id} camp={camp} />
              ))}
            </div>
          )}
        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default CrowdfundingPage;

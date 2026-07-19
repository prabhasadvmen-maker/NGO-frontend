import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Target, Heart, Calendar, ArrowLeft, Loader, Info, Compass, DollarSign } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const CrowdfundingDetailPage = () => {
  const { id } = useParams();
  const { data: campaigns, loading } = usePublicAPI('/api/public/campaigns?limit=100');

  // Fallbacks if data is empty or pending
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
  const camp = list.find(c => c._id === id);

  const target = camp?.targetAmount || 1;
  const raised = camp?.raisedAmount || 0;
  const percent = Math.min(Math.round((raised / target) * 100), 100);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading && camp) {
      const timer = setTimeout(() => {
        setProgress(percent);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [percent, loading, camp]);

  const getDaysLeft = (d) => {
    if (!d) return 0;
    const end = new Date(d);
    const today = new Date();
    const diff = end - today;
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
        <SEOHead title="Loading Campaign..." />
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-32 pb-24">
          <Loader className="animate-spin text-[#1B5E20]" size={36} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
        <SEOHead title="Campaign Not Found" />
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto px-6 pt-40 pb-24 text-center space-y-4">
          <h2 className="font-display font-black text-2xl text-[#0A1628]">Campaign Not Found</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">The campaign details you are looking for does not exist or has been removed from our databases.</p>
          <Link to="/crowdfunding" className="inline-block px-6 py-2.5 rounded-full bg-[#1B5E20] text-xs font-bold text-white shadow-md">
            Back to Campaigns
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const daysLeft = getDaysLeft(camp.endDate);
  const isCompleted = camp.status === 'Completed' || raised >= target;

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead 
        title={camp.title} 
        description={camp.description?.slice(0, 150)} 
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://savitramfoundation.org/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Crowdfunding',
              'item': 'https://savitramfoundation.org/crowdfunding'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': camp.title,
              'item': `https://savitramfoundation.org/crowdfunding/${camp._id}`
            }
          ]
        }}
      />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {/* Back button */}
          <Link to="/crowdfunding" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0A1628] transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Campaigns</span>
          </Link>

          {/* Campaign Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                isCompleted 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-orange-50 text-orange-700 border border-orange-100'
              }`}>
                {isCompleted ? 'Completed' : 'Active'}
              </span>
              <span className="text-[10px] text-[#1B5E20] font-bold uppercase tracking-wider">
                {camp.branch?.name || 'Savitram Branch'}
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0A1628] leading-tight">
              {camp.title}
            </h1>
          </div>

          {/* Cover image area */}
          <div className="h-[300px] w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A1628] to-[#1B5E20] relative flex items-center justify-center p-8 text-white shadow-lg">
            <div className="text-center space-y-2 z-10">
              <Compass size={48} className="mx-auto text-white/40 animate-pulse-slow" />
              <p className="font-display text-lg font-bold">SAVITRAM Funding Drive</p>
            </div>
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Story & details */}
            <div className="lg:col-span-8 space-y-8">
              {/* Progress visualization */}
              <div className="p-6 rounded-2xl bg-white border border-gray-100 space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Funding Goal Reached</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1B5E20] rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase">
                  <span>Raised: ₹{raised.toLocaleString('en-IN')}</span>
                  <span>Target: ₹{target.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-lg text-[#0A1628]">Campaign Story</h3>
                <p className="text-xs text-[#64748B] font-medium leading-relaxed whitespace-pre-wrap">
                  {camp.description}
                </p>
              </div>
            </div>

            {/* Sidebar stats panel */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-md space-y-6"
              style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}>
              <div>
                <h3 className="font-display font-extrabold text-base text-[#0A1628] mb-1">Campaign Metrics</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Verification status values</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-gray-600">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-450 font-bold uppercase text-[9px]">Target Goal</span>
                  <span className="text-[#0A1628] font-bold">₹{target.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-450 font-bold uppercase text-[9px]">Total Raised</span>
                  <span className="text-[#1B5E20] font-bold">₹{raised.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-450 font-bold uppercase text-[9px]">Start Date</span>
                  <span>{formatDate(camp.startDate)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-450 font-bold uppercase text-[9px]">End Date</span>
                  <span>{formatDate(camp.endDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-450 font-bold uppercase text-[9px]">Remaining Time</span>
                  <span className="text-[#F97316] font-bold">
                    {isCompleted ? 'Campaign Ended' : `${daysLeft} Days`}
                  </span>
                </div>
              </div>

              {!isCompleted && (
                <a 
                  href="/member/register"
                  className="block w-full py-3 bg-[#F97316] rounded-xl text-center text-xs font-extrabold text-white hover:brightness-110 shadow-md shadow-orange-500/20 cursor-pointer mt-2 transition-all hover:scale-[1.01]"
                >
                  Donate to This Campaign
                </a>
              )}

              <div className="p-3 bg-blue-50/40 rounded-xl flex items-start gap-2 text-[9px] text-[#2196F3] font-bold leading-normal border border-blue-100/50">
                <Info size={14} className="flex-shrink-0" />
                <span>Exempt under Section 80G tax deductions. Authentic digital receipt issued.</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default CrowdfundingDetailPage;

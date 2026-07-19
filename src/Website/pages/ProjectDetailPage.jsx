import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Award, IndianRupee, Calendar, ArrowLeft, Loader, Compass } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { data: projects, loading } = usePublicAPI('/api/public/projects?limit=100');

  // Fallbacks if data list is empty or pending
  const defaultProjects = [
    {
      _id: 'proj1',
      title: 'Rural Clean Water Initiative',
      description: 'Providing clean, potable drinking water is critical for reducing gastrointestinal illness in rural sectors. This project targets installing solar-powered deep borewell pumps and community water filtration systems in Uttar Pradesh villages. Over 15 pipeline segments have been completed so far. Maintenance committees consisting of local youths have been formed to manage daily operations.',
      status: 'Active',
      branch: { name: 'Lucknow Branch', address: 'Lucknow Center, Gomti Nagar' },
      budget: 500000,
      expenses: 320000,
      targetBeneficiaries: 1500,
      volunteersCount: 24,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000 * 24 * 120).toISOString()
    },
    {
      _id: 'proj2',
      title: 'Digital Classrooms for All',
      description: 'Setting up computer lab infrastructure and internet services in rural government primary schools.',
      status: 'Active',
      branch: { name: 'Head Office' },
      budget: 800000,
      expenses: 400000,
      targetBeneficiaries: 2500,
      volunteersCount: 30,
      startDate: new Date().toISOString()
    },
    {
      _id: 'proj3',
      title: 'Women Tailoring Center',
      description: 'Livelihood training program providing free sewing machines and fashion design training certificate courses.',
      status: 'Completed',
      branch: { name: 'Delhi Branch' },
      budget: 300000,
      expenses: 300000,
      targetBeneficiaries: 800,
      volunteersCount: 15,
      startDate: new Date().toISOString()
    }
  ];

  const list = Array.isArray(projects) && projects.length > 0 ? projects : defaultProjects;
  const p = list.find(x => x._id === id);

  const budget = p?.budget || 1;
  const expenses = p?.expenses || 0;
  const percent = Math.min(Math.round((expenses / budget) * 100), 100);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
        <SEOHead title="Loading Project..." />
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-32 pb-24">
          <Loader className="animate-spin text-[#1B5E20]" size={36} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
        <SEOHead title="Project Not Found" />
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto px-6 pt-40 pb-24 text-center space-y-4">
          <h2 className="font-display font-black text-2xl text-[#0A1628]">Project Not Found</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">The project details you are looking for does not exist or has been removed from our databases.</p>
          <Link to="/projects" className="inline-block px-6 py-2.5 rounded-full bg-[#1B5E20] text-xs font-bold text-white shadow-md">
            Back to Projects
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead 
        title={p.title} 
        description={p.description?.slice(0, 150)} 
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
              'name': 'Projects',
              'item': 'https://savitramfoundation.org/projects'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': p.title,
              'item': `https://savitramfoundation.org/projects/${p._id}`
            }
          ]
        }}
      />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          
          {/* Back button */}
          <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0A1628] transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Projects</span>
          </Link>

          {/* Header block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                p.status === 'Completed' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-orange-50 text-orange-700 border border-orange-100'
              }`}>
                {p.status}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <MapPin size={12} />
                <span>{p.branch?.name || 'Central Branch'}</span>
              </div>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0A1628] leading-tight">
              {p.title}
            </h1>
          </div>

          {/* Cover Image Banner */}
          <div className="h-[300px] w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A1628] to-[#1B5E20] relative flex items-center justify-center p-8 text-white shadow-lg">
            <div className="text-center space-y-2 z-10">
              <Compass size={48} className="mx-auto text-white/40 animate-pulse-slow" />
              <p className="font-display text-lg font-bold">SAVITRAM Field Operation</p>
            </div>
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: IndianRupee, label: 'Allocated Budget', val: `₹${(p.budget || 0).toLocaleString('en-IN')}`, color: '#1B5E20' },
              { icon: Award, label: 'Current Expenses', val: `₹${(p.expenses || 0).toLocaleString('en-IN')}`, color: '#F97316' },
              { icon: Users, label: 'Target Reached', val: `${(p.targetBeneficiaries || 0).toLocaleString()} lives`, color: '#2196F3' },
              { icon: Calendar, label: 'Launch Date', val: formatDate(p.startDate), color: '#9C27B0' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}12`, color: item.color }}>
                    <Icon size={16} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">{item.label}</p>
                  <p className="text-sm font-black text-[#0A1628] mt-1.5">{item.val}</p>
                </div>
              );
            })}
          </div>

          {/* Progress utilization */}
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
              <span>Budget Utilization Rate</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1B5E20] rounded-full transition-all duration-1000"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-lg text-[#0A1628]">Project Summary</h3>
                <p className="text-xs text-[#64748B] font-medium leading-relaxed whitespace-pre-wrap">
                  {p.description}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-md space-y-4"
              style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}>
              <div>
                <h3 className="font-display font-extrabold text-base text-[#0A1628] mb-1">Time Schedule</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Project operation duration</p>
              </div>

              <div className="space-y-2.5 text-xs font-semibold text-gray-600">
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-50">
                  <span className="text-gray-450 font-bold uppercase text-[9px]">Launch Date</span>
                  <span>{formatDate(p.startDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-450 font-bold uppercase text-[9px]">Target End Date</span>
                  <span>{formatDate(p.endDate)}</span>
                </div>
              </div>

              <Link 
                to="/crowdfunding"
                className="block w-full py-3 bg-[#1B5E20] text-center text-xs font-extrabold text-white hover:brightness-110 shadow-md shadow-emerald-800/10 cursor-pointer mt-2 transition-all hover:scale-[1.01]"
              >
                Support This Project
              </Link>
            </div>
          </div>

        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;

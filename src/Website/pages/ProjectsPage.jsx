import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, Loader } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const ProjectsPage = () => {
  const { data: projects, loading } = usePublicAPI('/api/public/projects');
  const [filter, setFilter] = useState('All');

  // Fallbacks if none
  const defaultProjects = [
    {
      _id: 'proj1',
      title: 'Rural Clean Water Initiative',
      description: 'Installing solar-powered deep borewell pumps and community water filtration systems in Uttar Pradesh villages.',
      status: 'Active',
      branch: { name: 'Lucknow Branch' },
      budget: 500000,
      expenses: 320000,
      targetBeneficiaries: 1500
    },
    {
      _id: 'proj2',
      title: 'Digital Classrooms for All',
      description: 'Setting up computer lab infrastructure and internet services in rural government primary schools.',
      status: 'Active',
      branch: { name: 'Head Office' },
      budget: 800000,
      expenses: 400000,
      targetBeneficiaries: 2500
    },
    {
      _id: 'proj3',
      title: 'Women Tailoring Center',
      description: 'Livelihood training program providing free sewing machines and fashion design training certificate courses.',
      status: 'Completed',
      branch: { name: 'Delhi Branch' },
      budget: 300000,
      expenses: 300000,
      targetBeneficiaries: 800
    }
  ];

  const list = Array.isArray(projects) && projects.length > 0 ? projects : defaultProjects;

  const filteredList = filter === 'All' 
    ? list 
    : list.filter(p => p.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Our Projects" description="Browse completed and ongoing community development projects executed by SAVITRAM FOUNDATION." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        {/* Banner header */}
        <div className="max-w-7xl mx-auto px-6 py-12 text-left border-b border-gray-200/50 mb-12">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Our Mission in Action
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Projects Portfolio
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Track budgeting, progress, and real-time beneficiary reaches.</p>
        </div>

        {/* Filters Menu */}
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-wrap gap-2 text-left">
          {['All', 'Active', 'Completed', 'Planned'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                filter === t 
                  ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-md shadow-emerald-800/10' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center">
              <Loader className="animate-spin text-[#1B5E20]" size={36} />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400 font-semibold text-sm">
              No projects found in this category.
            </div>
          ) : (
            filteredList.map((proj) => {
              const budget = proj.budget || 1;
              const expenses = proj.expenses || 0;
              const percent = Math.min(Math.round((expenses / budget) * 100), 100);

              return (
                <div 
                  key={proj._id}
                  className="rounded-2xl bg-white border border-gray-100 flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                  style={{
                    boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF'
                  }}
                >
                  <div className={`h-[4px] w-full ${proj.status === 'Completed' ? 'bg-[#1B5E20]' : 'bg-[#F97316]'}`} />

                  <div className="p-6 space-y-5 text-left flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          proj.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-orange-50 text-orange-700 border border-orange-100'
                        }`}>
                          {proj.status}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          <MapPin size={12} />
                          <span>{proj.branch?.name || 'Central Branch'}</span>
                        </div>
                      </div>

                      <h3 className="font-display font-extrabold text-lg text-[#0A1628] leading-snug group-hover:text-[#1B5E20] transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-[#64748B] font-medium leading-relaxed mt-2 line-clamp-3">
                        {proj.description}
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-4 border-t border-gray-50">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                          <span>Progress (Spent)</span>
                          <span className="text-[#0A1628]">{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              proj.status === 'Completed' ? 'bg-[#1B5E20]' : 'bg-[#F97316]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold pt-1">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-gray-400" />
                          <span>{proj.targetBeneficiaries?.toLocaleString()} Reached</span>
                        </div>
                        <Link 
                          to={`/projects/${proj._id}`}
                          className="text-[#1B5E20] font-bold hover:underline"
                        >
                          View Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default ProjectsPage;

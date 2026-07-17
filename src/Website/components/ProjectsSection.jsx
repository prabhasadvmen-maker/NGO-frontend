import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Heart } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import useScrollAnimation from '../hooks/useScrollAnimation';

export const ProjectsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: projects, loading } = usePublicAPI('/api/public/projects');

  // Fallback items if none from API
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

  const list = Array.isArray(projects) && projects.length > 0 ? projects.slice(0, 3) : defaultProjects;

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-white reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="text-left space-y-4 max-w-xl">
            <div className="inline-block relative">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
                Humanitarian Missions
              </span>
              <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#0A1628] leading-tight">
              Featured Projects
            </h2>
            <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
              We execute targeted, audited, and outcome-oriented projects directly managed through our active branches.
            </p>
          </div>
          <Link
            to="/projects"
            className="flex items-center gap-2 text-xs font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors self-start sm:self-auto"
          >
            <span>View All Projects</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading Skeletons
            [1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl h-[400px] bg-gray-100 animate-pulse" />
            ))
          ) : (
            list.map((proj) => {
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
                  {/* Top Status Border Stripe */}
                  <div className={`h-[4px] w-full ${proj.status === 'Completed' ? 'bg-[#1B5E20]' : 'bg-[#F97316]'}`} />

                  {/* Body Content */}
                  <div className="p-6 space-y-5 text-left flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta Node */}
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

                    {/* Progress Bar & Beneficiaries */}
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

      </div>
    </section>
  );
};

export default ProjectsSection;

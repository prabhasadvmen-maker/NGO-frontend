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
      branch: { name: 'Gurugram Branch' },
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

  // Keyword-to-Unsplash image mapping helper
  const getProjectImage = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('water') || t.includes('borewell') || t.includes('clean')) {
      return 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=600&auto=format&fit=crop&q=80';
    }
    if (t.includes('class') || t.includes('digital') || t.includes('school') || t.includes('education') || t.includes('computer')) {
      return 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80';
    }
    if (t.includes('tailoring') || t.includes('sewing') || t.includes('women') || t.includes('livelihood')) {
      return 'https://images.unsplash.com/photo-1520004434532-6684162097cf?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80';
  };

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-[#F8F7F4] reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="text-left space-y-4 max-w-xl">
            <div className="inline-block relative">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
                Humanitarian Missions
              </span>
              <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight text-[#0A1628] leading-tight">
              Featured Projects
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-semibold leading-relaxed">
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
              <div key={n} className="rounded-3xl h-[400px] bg-gray-100 animate-pulse" />
            ))
          ) : (
            list.map((proj, idx) => {
              const budget = proj.budget || 1;
              const expenses = proj.expenses || 0;
              const percent = Math.min(Math.round((expenses / budget) * 100), 100);

              return (
                <div 
                  key={proj._id}
                  className={`rounded-3xl bg-white border border-gray-100 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl group reveal ${
                    isVisible ? 'visible' : ''
                  }`}
                  style={{
                    boxShadow: '0 10px 30px -15px rgba(0,0,0,0.08)',
                    transitionDelay: `${idx * 150}ms`
                  }}
                >
                  {/* Top Media Cover Image with overlays */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={getProjectImage(proj.title)}
                      alt={proj.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      width="384"
                      height="192"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Status Badge overlay */}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${
                      proj.status === 'Completed' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {proj.status}
                    </span>

                    {/* Location Pin overlay */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs text-white font-bold drop-shadow">
                      <MapPin size={12} className="text-white fill-transparent" />
                      <span>{proj.branch?.name || 'Central Branch'}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-3 text-left">
                      <h3 className="font-display font-black text-lg sm:text-xl text-[#0A1628] leading-tight transition-colors group-hover:text-[#1B5E20]">
                        {proj.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed line-clamp-3">
                        {proj.description}
                      </p>
                    </div>

                    {/* Progress Bar & Beneficiary details */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                          <span>Progress (Spent)</span>
                          <span className="text-[#0A1628]">{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              proj.status === 'Completed' ? 'bg-[#1B5E20]' : 'bg-[#F97316]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                          <Users size={14} className="text-[#1B5E20]" />
                          <span>{proj.targetBeneficiaries?.toLocaleString()} Reached</span>
                        </div>
                        <Link 
                          to={`/projects/${proj._id}`}
                          className="flex items-center gap-1 font-extrabold text-[#1B5E20] hover:text-[#0A1628] transition-colors"
                        >
                          <span>View Detail</span>
                          <ArrowRight size={12} />
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

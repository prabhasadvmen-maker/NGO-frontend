import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, Users, ArrowRight } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import useScrollAnimation from '../hooks/useScrollAnimation';

export const EventsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: events, loading } = usePublicAPI('/api/public/events');

  const list = Array.isArray(events) ? events : [];
  const today = new Date();
  
  // Filter for upcoming/active events
  const upcomingEvents = list.filter(e => new Date(e.startDate) >= today || e.status === 'Active' || e.status === 'Planned');
  // Take top 3 events
  const featuredEvents = upcomingEvents.slice(0, 3);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-white reveal ${isVisible ? 'visible' : ''}`}
    >
      {/* Background large decorative text */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 select-none text-[10vw] font-black text-gray-500/5 font-display leading-none z-0 pointer-events-none">
        EVENTS
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="text-left space-y-4 max-w-xl">
            <div className="inline-block relative">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
                Events & Campaigns
              </span>
              <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight text-[#0A1628] leading-tight">
              Upcoming Events
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-semibold leading-relaxed">
              Participate in our active programs, charity drives, and workshops organized across our regional branches.
            </p>
          </div>
          <Link
            to="/events"
            className="flex items-center gap-2 text-xs font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors self-start sm:self-auto"
          >
            <span>View All Events</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading Skeletons
            [1, 2, 3].map((n) => (
              <div key={n} className="rounded-3xl h-[320px] bg-gray-100 animate-pulse" />
            ))
          ) : featuredEvents.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 gap-3 bg-[#F8F7F4] rounded-3xl border border-dashed border-gray-200">
              <p className="font-semibold text-sm">No upcoming events scheduled at this moment.</p>
            </div>
          ) : (
            featuredEvents.map((ev, idx) => {
              const isActive = ev.status === 'Active';
              const isPlanned = ev.status === 'Planned';

              let stripeColor = 'bg-gray-400';
              if (isActive) stripeColor = 'bg-[#1B5E20]';
              else if (isPlanned) stripeColor = 'bg-[#F97316]';

              let statusBadge = (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-100">
                  Completed
                </span>
              );
              if (new Date(ev.startDate) >= today || isActive || isPlanned) {
                statusBadge = (
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-orange-50 text-orange-700 border border-orange-100'
                  }`}>
                    {ev.status || 'Upcoming'}
                  </span>
                );
              }

              return (
                <div 
                  key={ev._id}
                  className={`rounded-3xl bg-[#F8F7F4] border border-gray-100/80 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl group reveal ${
                    isVisible ? 'visible' : ''
                  }`}
                  style={{
                    boxShadow: '0 10px 30px -15px rgba(0,0,0,0.08)',
                    transitionDelay: `${idx * 150}ms`
                  }}
                >
                  {/* Status Stripe */}
                  <div className={`h-[4px] w-full ${stripeColor}`} />

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6 text-left">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        {statusBadge}
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Tag size={12} className="text-gray-400" />
                          <span>{ev.type || 'Offline'}</span>
                        </span>
                      </div>

                      <h3 className="font-display font-black text-lg sm:text-xl text-[#0A1628] leading-snug transition-colors group-hover:text-[#1B5E20] line-clamp-2">
                        {ev.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed line-clamp-3">
                        {ev.description}
                      </p>
                    </div>

                    {/* Metadata & Footer Link */}
                    <div className="space-y-4 pt-4 border-t border-gray-200/50">
                      <div className="flex flex-col gap-2 text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-2 text-[#0A1628]">
                          <Calendar size={14} className="text-[#1B5E20] flex-shrink-0" />
                          <span>{formatDate(ev.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-1">{ev.location}</span>
                        </div>
                        {ev.capacity > 0 && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users size={14} className="flex-shrink-0" />
                            <span>{ev.registrationsCount || ev.registeredCount || 0} / {ev.capacity} Registered</span>
                          </div>
                        )}
                      </div>

                      <Link 
                        to={`/events/${ev._id}`}
                        className="flex items-center justify-between text-xs font-bold text-[#1B5E20] hover:underline pt-2 group-hover:text-[#0A1628] transition-colors"
                      >
                        <span>View Event Details</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </Link>
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

export default EventsSection;

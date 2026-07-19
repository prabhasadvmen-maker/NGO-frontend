import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, Users, ArrowRight, Loader, Inbox } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const EventsPage = () => {
  const { data: events, loading } = usePublicAPI('/api/public/events');
  const [tab, setTab] = useState('Upcoming');

  const defaultEvents = [
    {
      _id: 'ev1',
      title: 'Free Health Checkup Camp',
      description: 'A comprehensive free health diagnosis checkup, medical consult, and medicine distribution drive.',
      startDate: new Date(Date.now() + 3600000 * 24 * 5).toISOString(),
      location: 'Community Hall, Sector 4, Lucknow',
      type: 'Offline',
      capacity: 200,
      registrationsCount: 45,
      status: 'Planned',
      branch: { name: 'Lucknow Branch' }
    },
    {
      _id: 'ev2',
      title: 'Environment Plantation Drive',
      description: 'Planting over 500 indigenous fruit-bearing saplings along village paths in Lucknow outskirts.',
      startDate: new Date(Date.now() + 3600000 * 24 * 12).toISOString(),
      location: 'Malihabad outskirts, Lucknow',
      type: 'Offline',
      capacity: 100,
      registrationsCount: 82,
      status: 'Planned',
      branch: { name: 'Lucknow Branch' }
    },
    {
      _id: 'ev3',
      title: 'Women Tailoring Workshop',
      description: 'Orientation training for the first tailoring batch of rural self-employed programs.',
      startDate: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      location: 'Delhi Skill Center, Okhla',
      type: 'Offline',
      capacity: 50,
      registrationsCount: 50,
      status: 'Completed',
      branch: { name: 'Delhi Branch' }
    }
  ];

  const list = Array.isArray(events) && events.length > 0 ? events : defaultEvents;

  const today = new Date();
  const upcomingEvents = list.filter(e => new Date(e.startDate) >= today);
  const pastEvents = list.filter(e => new Date(e.startDate) < today);

  const filteredList = tab === 'All' 
    ? list 
    : tab === 'Upcoming' 
      ? upcomingEvents 
      : pastEvents;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Events & Programs" description="Join upcoming campaigns and view past community volunteer programs organized by SAVITRAM FOUNDATION." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        {/* Page Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200/50 mb-12">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Get Involved
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Events & Programs
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold font-body">Join our active campaigns or view past community drives.</p>
        </div>

        {/* Tabs selector */}
        <div className="max-w-7xl mx-auto px-6 mb-12 flex gap-4">
          {['All', 'Upcoming', 'Past'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-bold uppercase tracking-wider pb-2 cursor-pointer transition-all border-b-2 ${
                tab === t 
                  ? 'text-[#1B5E20] border-[#1B5E20]' 
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {t} Events
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Inbox size={48} className="stroke-1" />
              <p className="font-semibold text-sm">No {tab.toLowerCase()} events scheduled right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredList.map((ev) => {
                const isActive = ev.status === 'Active';
                const isPlanned = ev.status === 'Planned';
                const isCompleted = ev.status === 'Completed' || new Date(ev.startDate) < today;

                let stripeColor = 'bg-gray-400';
                if (isActive) stripeColor = 'bg-[#1B5E20]';
                else if (isPlanned) stripeColor = 'bg-[#F97316]';

                let statusBadge = (
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-100">
                    Completed
                  </span>
                );
                if (!isCompleted) {
                  statusBadge = (
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {ev.status}
                    </span>
                  );
                }

                return (
                  <div 
                    key={ev._id}
                    className="rounded-2xl bg-white border border-gray-100 flex flex-col justify-between overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
                    style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
                  >
                    {/* Color status stripe */}
                    <div className={`h-[4px] w-full ${stripeColor}`} />

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          {statusBadge}
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Tag size={12} />
                            <span>{ev.type}</span>
                          </span>
                        </div>

                        <h3 className="font-display font-extrabold text-lg text-[#0A1628] leading-snug group-hover:text-[#1B5E20] transition-colors line-clamp-2">
                          {ev.title}
                        </h3>
                        <p className="text-xs text-[#64748B] font-medium leading-relaxed line-clamp-3">
                          {ev.description}
                        </p>
                      </div>

                      {/* Info footer metadata */}
                      <div className="space-y-3.5 pt-4 border-t border-gray-50">
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 font-semibold">
                          <div className="flex items-center gap-1.5 text-[#0A1628]">
                            <Calendar size={14} className="text-[#1B5E20] flex-shrink-0" />
                            <span>{formatDate(ev.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-1">{ev.location}</span>
                          </div>
                          {ev.capacity > 0 && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Users size={14} className="flex-shrink-0" />
                              <span>{ev.registrationsCount || ev.registeredCount || 0} / {ev.capacity} Registered</span>
                            </div>
                          )}
                        </div>

                        <Link 
                          to={`/events/${ev._id}`}
                          className="flex items-center justify-between text-xs font-bold text-[#1B5E20] hover:underline pt-2"
                        >
                          <span>View Details</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default EventsPage;

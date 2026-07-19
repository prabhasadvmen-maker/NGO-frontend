import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, Users, Clock, Building, ArrowLeft, Loader, Compass } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { data: events, loading } = usePublicAPI('/api/public/events?limit=100');

  // Fallbacks if data list is empty or API is pending
  const defaultEvents = [
    {
      _id: 'ev1',
      title: 'Free Health Checkup Camp',
      description: 'Access to basic healthcare is a severe issue in rural sectors. This camp sets up free medical consultancy, basic diagnostics (sugar, blood pressure), distributes free basic medicines, and checks children for nutritional deficiencies. Standard hygiene packs containing soaps, toothbrushes, and sanitizers will also be handed out to families.',
      startDate: new Date(Date.now() + 3600000 * 24 * 5).toISOString(),
      endDate: new Date(Date.now() + 3600000 * 24 * 5 + 3600000 * 4).toISOString(),
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
  const event = list.find(e => e._id === id);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
        <SEOHead title="Loading Event..." />
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-32 pb-24">
          <Loader className="animate-spin text-[#1B5E20]" size={36} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
        <SEOHead title="Event Not Found" />
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto px-6 pt-40 pb-24 text-center space-y-4">
          <h2 className="font-display font-black text-2xl text-[#0A1628]">Event Not Found</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">The event details you are looking for does not exist or has been removed from our databases.</p>
          <Link to="/events" className="inline-block px-6 py-2.5 rounded-full bg-[#1B5E20] text-xs font-bold text-white shadow-md">
            Back to Calendar
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title={event.title} description={event.description?.slice(0, 150)} />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {/* Back button */}
          <Link to="/events" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0A1628] transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Events</span>
          </Link>

          {/* Event Content Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                {event.status}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Tag size={12} />
                <span>{event.type}</span>
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0A1628] leading-tight">
              {event.title}
            </h1>
          </div>

          {/* Large Banner Placeholder */}
          <div className="h-[300px] w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A1628] to-[#1B5E20] relative flex items-center justify-center p-8 text-white shadow-lg">
            <div className="text-center space-y-2 z-10">
              <Compass size={48} className="mx-auto text-white/40 animate-pulse-slow" />
              <p className="font-display text-lg font-bold">SAVITRAM Outreach Program</p>
            </div>
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Story */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-xl text-[#0A1628]">Program Description</h3>
                <p className="text-xs text-[#64748B] font-medium leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Metrics detail sidebar */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-md space-y-6"
              style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}>
              <div>
                <h3 className="font-display font-extrabold text-base text-[#0A1628] mb-1">Details & Schedule</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Key event metrics</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex gap-3 items-start">
                  <Calendar size={16} className="text-[#1B5E20] mt-0.5" />
                  <div>
                    <h4 className="text-[9px] text-gray-400 font-bold uppercase">Date</h4>
                    <p className="font-bold text-[#0A1628] mt-0.5">{formatDate(event.startDate)}</p>
                  </div>
                </div>

                {event.endDate && (
                  <div className="flex gap-3 items-start">
                    <Clock size={16} className="text-[#1B5E20] mt-0.5" />
                    <div>
                      <h4 className="text-[9px] text-gray-400 font-bold uppercase">Timings</h4>
                      <p className="font-bold text-[#0A1628] mt-0.5">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 items-start">
                  <MapPin size={16} className="text-[#1B5E20] mt-0.5" />
                  <div>
                    <h4 className="text-[9px] text-gray-400 font-bold uppercase">Location</h4>
                    <p className="font-bold text-[#0A1628] mt-0.5 leading-relaxed">{event.location}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Building size={16} className="text-[#1B5E20] mt-0.5" />
                  <div>
                    <h4 className="text-[9px] text-gray-400 font-bold uppercase">Managing Branch</h4>
                    <p className="font-bold text-[#0A1628] mt-0.5">{event.branch?.name || 'Savitram Desk'}</p>
                  </div>
                </div>

                {event.capacity > 0 && (
                  <div className="flex gap-3 items-start">
                    <Users size={16} className="text-[#1B5E20] mt-0.5" />
                    <div>
                      <h4 className="text-[9px] text-gray-400 font-bold uppercase">Reserved Seats</h4>
                      <p className="font-bold text-[#0A1628] mt-0.5">{event.registrationsCount || event.registeredCount || 0} / {event.capacity} Registered</p>
                    </div>
                  </div>
                )}
              </div>

              {event.status !== 'Completed' && (
                <a 
                  href="/member/register"
                  className="block w-full py-3 rounded-xl bg-[#1B5E20] text-center text-xs font-extrabold text-white hover:brightness-110 shadow-md shadow-emerald-800/10 cursor-pointer mt-2 transition-all hover:scale-[1.01]"
                >
                  Register for This Event
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default EventDetailPage;

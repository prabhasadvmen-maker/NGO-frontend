import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Search, Loader2, MapPin, Video, Clock, CheckCircle2,
  AlertCircle, AlertTriangle, Users, ArrowRight, Eye, X
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/member/activities`;

const MyEvents = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setEvents(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch events');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load events list');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = async (eventId) => {
    setProcessingId(eventId);
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Registered successfully!');
        fetchEvents();
        if (selectedEvent?._id === eventId) {
          setSelectedEvent(prev => ({ ...prev, isRegistered: true, registrationsCount: (prev.registrationsCount || 0) + 1 }));
        }
      } else {
        toast.error(resData.message || 'Failed to register');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error registering for event');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    
    setProcessingId(eventId);
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Registration cancelled successfully');
        fetchEvents();
        if (selectedEvent?._id === eventId) {
          setSelectedEvent(prev => ({ ...prev, isRegistered: false, registrationsCount: Math.max(0, (prev.registrationsCount || 0) - 1) }));
        }
      } else {
        toast.error(resData.message || 'Failed to cancel registration');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error cancelling registration');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'All' || e.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Calendar className="text-[#1B5E20]" size={28} />
              NGO Events
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Explore planned workshops, community summits, and hybrid events
            </p>
          </div>
        </div>

        {/* Events Grid Container */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
          }}
        >
          {/* Filters */}
          <div className="mb-6 border-b border-gray-200 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                AVAILABLE EVENTS ({filteredEvents.length})
              </h3>
              <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                <div className="relative flex items-center w-full sm:w-60">
                  <Search className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events..."
                    className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer font-bold text-gray-600"
                >
                  <option value="All">All Types</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Calendar size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Events Scheduled</p>
                <p className="text-xs text-gray-400 mt-1">Check back later for newly scheduled activities</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div
                  key={event._id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between shadow-sm relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        event.type === 'Online' ? 'bg-blue-50 text-blue-700' :
                        event.type === 'Hybrid' ? 'bg-purple-50 text-purple-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {event.type}
                      </span>
                      {event.isRegistered && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded">
                          <CheckCircle2 size={12} /> REGISTERED
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-gray-800 text-sm truncate">{event.title}</h4>
                      <p className="text-xs text-gray-400 font-semibold mt-1 flex items-center gap-1">
                        <Clock size={12} /> {new Date(event.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(event.startDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                      {event.type === 'Online' ? <Video size={14} className="text-blue-500" /> : <MapPin size={14} className="text-amber-500" />}
                      <span className="truncate max-w-[170px]">{event.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold pt-2">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {event.registrationsCount || 0} Registered
                      </span>
                      <span>
                        Capacity: {event.capacity === 0 ? 'Unlimited' : `${event.capacity} seats`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100 mt-6">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="py-2.5 rounded-xl border border-gray-200 bg-transparent text-gray-600 hover:border-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} /> Details
                    </button>

                    {event.isRegistered ? (
                      <button
                        onClick={() => handleCancelRegistration(event._id)}
                        disabled={processingId === event._id}
                        className="py-2.5 rounded-xl bg-red-50 text-red-650 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {processingId === event._id ? 'Processing...' : 'Cancel'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event._id)}
                        disabled={processingId === event._id || (event.capacity > 0 && event.registrationsCount >= event.capacity)}
                        className="py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#145a1b] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {processingId === event._id ? 'Signing up...' : 'Join Event'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EVENT DETAIL DRAWER MODAL */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
            <div
              className="w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
              >
                <X size={20} />
              </button>

              <div className="space-y-4 text-left">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  selectedEvent.type === 'Online' ? 'bg-blue-50 text-blue-700' :
                  selectedEvent.type === 'Hybrid' ? 'bg-purple-50 text-purple-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {selectedEvent.type} Event
                </span>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">{selectedEvent.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50 text-xs">
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Start Time</span>
                    <span className="font-extrabold text-gray-700">
                      {new Date(selectedEvent.startDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">End Time</span>
                    <span className="font-extrabold text-gray-700">
                      {new Date(selectedEvent.endDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Location / Link</span>
                    <span className="font-extrabold text-gray-700 flex items-center gap-1">
                      {selectedEvent.type === 'Online' ? <Video size={14} className="text-blue-500" /> : <MapPin size={14} className="text-amber-500" />}
                      {selectedEvent.location}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Description</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer border-0 hover:bg-gray-300 transition-all text-center"
                >
                  Close Details
                </button>
                {selectedEvent.isRegistered ? (
                  <button
                    onClick={() => { handleCancelRegistration(selectedEvent._id); }}
                    disabled={processingId === selectedEvent._id}
                    className="flex-1 py-3 bg-red-50 text-red-650 hover:bg-red-100 rounded-xl text-xs font-bold cursor-pointer border-0 disabled:opacity-50"
                  >
                    Cancel Spot
                  </button>
                ) : (
                  <button
                    onClick={() => { handleRegister(selectedEvent._id); }}
                    disabled={processingId === selectedEvent._id || (selectedEvent.capacity > 0 && selectedEvent.registrationsCount >= selectedEvent.capacity)}
                    className="flex-1 py-3 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl text-xs font-bold cursor-pointer border-0 disabled:opacity-50"
                  >
                    Confirm Spot
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyEvents;

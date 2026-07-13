import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Plus, Eye, Loader2, Search, Settings, HelpCircle, Check } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/events`;

const EventsList = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    plannedCount: 0,
    totalCapacity: 0,
    totalRegistrations: 0
  });

  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [myEventsOnly, setMyEventsOnly] = useState('false');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Register Attendee Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [targetEvent, setTargetEvent] = useState(null);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : '';
      const mineParam = `&myEventsOnly=${myEventsOnly}`;
      
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${mineParam}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch events list');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, myEventsOnly, toast]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [fetchEvents, fetchStats]);

  const handleOpenRegisterModal = (ev) => {
    setTargetEvent(ev);
    setRegForm({ name: '', email: '', phone: '', notes: '' });
    setIsRegModalOpen(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!targetEvent) return;
    setSubmittingReg(true);
    try {
      const res = await fetch(`${API_BASE}/${targetEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Registration successful!');
        setIsRegModalOpen(false);
        fetchEvents();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to register');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error registering attendee');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action is permanent.')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event deleted successfully');
        fetchEvents();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete event');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <CalendarDays className="text-[#1B5E20]" size={28} />
              Event Schedules
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage NGO events, registers RSVPs, and coordinate field coordinators</p>
          </div>
          <button
            onClick={() => navigate('/admin/events/create')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0 bg-green-700"
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'My Registered Events', value: stats.totalCount, color: COLORS.primary, sub: 'Total campaigns managed' },
            { label: 'Active Events', value: stats.activeCount, color: '#3f51b5', sub: 'In progress now' },
            { label: 'Total RSVPs Collected', value: stats.totalRegistrations, color: '#009688', sub: `Max Cap: ${stats.totalCapacity || 'Unlimited'}` },
            { label: 'Planned / Pending', value: stats.plannedCount, color: '#ff9800', sub: 'Scheduled' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 bg-white flex items-center gap-4 transition-all"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50">
                <CalendarDays size={22} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-800 leading-tight">{card.value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{card.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div 
          className="rounded-2xl p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={myEventsOnly}
              onChange={(e) => { setMyEventsOnly(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="false">All Organization Events</option>
              <option value="true">Created by Me Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No events listed.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Event Title', 'Venue & Type', 'Date Schedule', 'RSVPs / Capacity', 'Coordinator', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, idx) => {
                    const isMine = ev.createdBy?._id === user?.id || ev.createdBy === user?.id;

                    return (
                      <tr key={ev._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <div>
                            <p className="font-bold text-gray-800 truncate">{ev.title}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{ev.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-700">
                          <div>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gray-150 text-gray-600 uppercase">{ev.type}</span>
                            <p className="mt-1 flex items-center gap-1"><MapPin size={12} className="text-red-500" /> {ev.location}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                          <div>
                            <p>S: {new Date(ev.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            <p>E: {new Date(ev.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-700">
                          <div>
                            <span className="text-green-700 font-extrabold text-sm">{ev.registrationsCount}</span>
                            <span className="text-gray-400"> / {ev.capacity > 0 ? ev.capacity : '∞'} RSVPs</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                          {ev.createdBy?.name || 'Central Admin'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            ev.status === 'Active' ? 'bg-green-100 text-green-700' :
                            ev.status === 'Planned' ? 'bg-yellow-100 text-yellow-700' :
                            ev.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold space-x-2">
                          <button
                            onClick={() => handleOpenRegisterModal(ev)}
                            disabled={ev.status === 'Cancelled' || ev.status === 'Completed' || (ev.capacity > 0 && ev.registrationsCount >= ev.capacity)}
                            className="px-2.5 py-1.5 rounded-lg border-0 bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            RSVP Attendee
                          </button>
                          
                          <button
                            onClick={() => navigate(`/admin/events/registrations?event=${ev._id}`)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold bg-white cursor-pointer"
                          >
                            RSVPs list
                          </button>
                          
                          {isMine && (
                            <button
                              onClick={() => handleDeleteEvent(ev._id)}
                              className="px-2 py-1.5 rounded-lg border-0 bg-red-100 text-red-600 font-bold hover:bg-red-200 cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500 font-bold">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RSVP Modal */}
      {isRegModalOpen && targetEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Register RSVP</h3>
                <p className="text-xs text-gray-400 mt-0.5">RSVP for: {targetEvent.title}</p>
              </div>
              <button onClick={() => setIsRegModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Attendee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={regForm.name}
                  onChange={(e) => setRegForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile number *</label>
                <input
                  type="text"
                  required
                  placeholder="10-digit phone number"
                  value={regForm.phone}
                  onChange={(e) => setRegForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes / Preferences</label>
                <textarea
                  placeholder="Any preferences or additional comments..."
                  value={regForm.notes}
                  rows={2}
                  onChange={(e) => setRegForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submittingReg}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-green-700 hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submittingReg && <Loader2 size={14} className="animate-spin" />}
                  Register RSVP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EventsList;

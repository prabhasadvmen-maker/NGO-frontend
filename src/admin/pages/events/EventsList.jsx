import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, MapPin, Users, Plus, Eye, Loader2, Search, Settings, 
  HelpCircle, Check, X, Pencil, Trash2, Calendar, ClipboardList, UserCheck, RefreshCw
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/events`;
const BRANCH_API = `${API_BASE_URL}/api/branches`;

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div className="w-full max-w-2xl my-8 rounded-3xl p-6 md:p-8 bg-white border border-gray-100 shadow-2xl relative">
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-extrabold text-gray-800">{title}</h2>
    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
      <X size={18} className="text-gray-500" />
    </button>
  </div>
);

const ActionMenu = ({ event, isMine, onView, onEdit, onRsvp, onViewRsvps, onVerifyAttendance, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(p => !p)} 
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
        title="Actions"
      >
        <Settings size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button 
            onClick={() => { onView(event); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          {isMine && (
            <button 
              onClick={() => { onEdit(event); setOpen(false); }} 
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <Pencil size={14} className="text-green-600" /> Edit Event
            </button>
          )}
          <button 
            disabled={event.status === 'Cancelled' || event.status === 'Completed' || (event.capacity > 0 && event.registrationsCount >= event.capacity)}
            onClick={() => { onRsvp(event); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-left"
          >
            <UserCheck size={14} className="text-[#1B5E20]" /> RSVP Attendee
          </button>
          <button 
            onClick={() => { onViewRsvps(event._id); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <ClipboardList size={14} className="text-indigo-500" /> RSVPs List
          </button>
          <button 
            onClick={() => { onVerifyAttendance(event._id); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Calendar size={14} className="text-amber-500" /> Verify Attendance
          </button>
          {isMine && (
            <>
              <div className="border-t border-gray-100" />
              <button 
                onClick={() => { onDelete(event._id); setOpen(false); }} 
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-55 transition-colors cursor-pointer text-left"
              >
                <Trash2 size={14} /> Delete Event
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const EventsList = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    plannedCount: 0,
    totalCapacity: 0,
    totalRegistrations: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [myEventsOnly, setMyEventsOnly] = useState('false');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewEvent, setViewEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [targetEvent, setTargetEvent] = useState(null);

  // Form states
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    type: 'Offline',
    capacity: '0',
    status: 'Planned',
    branch: ''
  });

  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(BRANCH_API, { headers });
      const data = await res.json();
      if (data.success) {
        setBranches(data.data.filter(b => b.isActive));
      }
    } catch (err) {
      console.error(err);
    }
  }, [headers]);

  // Fetch events list
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : '';
      const mineParam = `&myEventsOnly=${myEventsOnly}`;
      
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${mineParam}`;
      const res = await fetch(url, { headers });
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
  }, [token, page, limit, search, filterStatus, myEventsOnly, toast, headers]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/stats`, { headers });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token, headers]);

  useEffect(() => {
    if (token) {
      fetchBranches();
      fetchEvents();
      fetchStats();
    }
  }, [token, fetchBranches, fetchEvents, fetchStats]);

  const handleOpenRegisterModal = (ev) => {
    setTargetEvent(ev);
    setRegForm({ name: '', email: '', phone: '', notes: '' });
    setIsRegModalOpen(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!targetEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/${targetEvent._id}/register`, {
        method: 'POST',
        headers,
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
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...form,
        capacity: Number(form.capacity) || 0
      };

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event scheduled successfully!');
        setShowAddModal(false);
        setForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
          type: 'Offline',
          capacity: '0',
          status: 'Planned',
          branch: ''
        });
        fetchEvents();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to schedule event');
      }
    } catch {
      toast.error('Server error creating event');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (event) => {
    setEditEvent(event);
    setForm({
      title: event.title || '',
      description: event.description || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      type: event.type || 'Offline',
      capacity: event.capacity || '0',
      status: event.status || 'Planned',
      branch: event.branch?._id || event.branch || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...form,
        capacity: Number(form.capacity) || 0
      };

      const res = await fetch(`${API_BASE}/${editEvent._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event updated successfully');
        setEditEvent(null);
        fetchEvents();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update event');
      }
    } catch {
      toast.error('Server error updating event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action is permanent.')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers
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

  const navigateToRegistrations = (id) => {
    navigate(`/admin/events/registrations?event=${id}`);
  };

  const navigateToAttendance = (id) => {
    navigate(`/admin/events/attendance?event=${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <CalendarDays className="text-[#1B5E20]" size={28} />
              Event Schedules
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage NGO events, registers RSVPs, and coordinate field coordinators</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { fetchEvents(); fetchStats(); }}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Plus size={18} /> Create Event
            </button>
          </div>
        </div>

        {/* Stats dynamic cards */}
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
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-extrabold text-gray-800 leading-tight truncate">{card.value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5 truncate">{card.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{card.sub}</p>
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
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650"
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
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650"
            >
              <option value="false">All Organization Events</option>
              <option value="true">Created by Me Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white text-center" 
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
                    {['#', 'Event Title', 'Venue & Type', 'Date Schedule', 'RSVPs / Capacity', 'Coordinator', 'Status', 'Actions'].map((h, idx) => (
                      <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 ${idx === 7 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, idx) => {
                    const isMine = ev.createdBy?._id === user?.id || ev.createdBy === user?.id;

                    return (
                      <tr key={ev._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors text-left" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <div>
                            <p className="font-bold text-gray-800 truncate" title={ev.title}>{ev.title}</p>
                            <p className="text-[10px] text-gray-500 font-semibold line-clamp-2 mt-0.5" title={ev.description}>{ev.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-750">
                          <div>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gray-150 text-gray-600 uppercase">{ev.type}</span>
                            <p className="mt-1 flex items-center gap-1"><MapPin size={12} className="text-red-500" /> {ev.location}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-700">
                          <div>
                            <p>S: {new Date(ev.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-gray-400">E: {new Date(ev.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-700">
                          <div>
                            <span className="text-green-700 font-extrabold text-sm">{ev.registrationsCount}</span>
                            <span className="text-gray-400"> / {ev.capacity > 0 ? ev.capacity : '∞'} RSVPs</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-600">
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
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ActionMenu 
                              event={ev} 
                              isMine={isMine}
                              onView={setViewEvent} 
                              onEdit={openEdit} 
                              onRsvp={handleOpenRegisterModal}
                              onViewRsvps={navigateToRegistrations}
                              onVerifyAttendance={navigateToAttendance}
                              onDelete={handleDeleteEvent}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW EVENT MODAL */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <ModalHeader title="Create New Event" onClose={() => setShowAddModal(false)} />
          <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Title *</label>
              <input type="text" name="title" required value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Description *</label>
              <textarea name="description" required rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Venue / Location Link *</label>
                <input type="text" name="location" required value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event format</label>
                <select name="type" value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Time *</label>
                <input type="datetime-local" name="startDate" required value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Time *</label>
                <input type="datetime-local" name="endDate" required value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max RSVP Capacity</label>
                <input type="number" name="capacity" min="0" value={form.capacity}
                  onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Branch office</label>
                <select name="branch" value={form.branch}
                  onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="">Global Operations</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Launch status</label>
                <select name="status" value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Scheduling event...' : 'Publish Event'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* EDIT EVENT MODAL */}
      {editEvent && (
        <Modal onClose={() => setEditEvent(null)}>
          <ModalHeader title="Edit Event Details" onClose={() => setEditEvent(null)} />
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Title *</label>
              <input type="text" name="title" required value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Description *</label>
              <textarea name="description" required rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Venue / Location Link *</label>
                <input type="text" name="location" required value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event format</label>
                <select name="type" value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Time *</label>
                <input type="datetime-local" name="startDate" required value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Time *</label>
                <input type="datetime-local" name="endDate" required value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max RSVP Capacity</label>
                <input type="number" name="capacity" min="0" value={form.capacity}
                  onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Branch office</label>
                <select name="branch" value={form.branch}
                  onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="">Global Operations</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Launch status</label>
                <select name="status" value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditEvent(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Saving changes...' : 'Save Event Details'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* VIEW EVENT DETAILS MODAL */}
      {viewEvent && (
        <Modal onClose={() => setViewEvent(null)}>
          <ModalHeader title="NGO Event Details Summary" onClose={() => setViewEvent(null)} />
          <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 no-scrollbar text-sm">
            
            <div className="pb-4 border-b border-gray-100 space-y-1">
              <h3 className="text-xl font-extrabold text-gray-800 leading-tight">{viewEvent.title}</h3>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  viewEvent.status === 'Active' ? 'bg-green-100 text-green-700' :
                  viewEvent.status === 'Planned' ? 'bg-yellow-100 text-yellow-750' :
                  viewEvent.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-750'
                }`}>
                  {viewEvent.status} Status
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                  Format: {viewEvent.type}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Agenda & Description</h4>
              <p className="text-gray-700 text-xs font-medium leading-relaxed whitespace-pre-line">{viewEvent.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Location / Venue</p>
                <p className="text-gray-700 font-semibold">{viewEvent.location}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Associated Branch</p>
                <p className="text-gray-700 font-semibold">{viewEvent.branch?.name || 'Global Operations'}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Start Timeline</p>
                <p className="text-gray-700 font-semibold">
                  {new Date(viewEvent.startDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">End Timeline</p>
                <p className="text-gray-700 font-semibold">
                  {new Date(viewEvent.endDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">RSVP Capacity</p>
                <p className="text-gray-700 font-semibold">{viewEvent.capacity > 0 ? `${viewEvent.capacity} seats` : 'Unlimited'}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Registered RSVP Count</p>
                <p className="text-green-700 font-extrabold text-sm">{viewEvent.registrationsCount} attendees</p>
              </div>
            </div>

          </div>
          <div className="mt-8 flex justify-end gap-3 border-t pt-4">
            <button 
              onClick={() => setViewEvent(null)} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Close Summary
            </button>
          </div>
        </Modal>
      )}

      {/* RSVP Modal */}
      {isRegModalOpen && targetEvent && (
        <Modal onClose={() => setIsRegModalOpen(false)}>
          <ModalHeader title="Register RSVP Attendee" onClose={() => setIsRegModalOpen(false)} />
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
                disabled={submitting}
                className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-green-700 hover:opacity-90 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Register RSVP
              </button>
            </div>
          </form>
        </Modal>
      )}

    </Layout>
  );
};

export default EventsList;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays, MapPin, Users, Settings, Plus, Pencil, Trash2, Eye,
  Loader2, Search, X, Check, FileText, CheckCircle, AlertTriangle, ShieldCheck
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/superadmin/events`;
const BRANCH_API = `${API_BASE_URL}/api/superadmin/branches`;

const ActionMenu = ({ eventItem, onView, onViewRegistrations, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
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
            onClick={() => { onView(eventItem); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          <button 
            onClick={() => { onViewRegistrations(eventItem); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Users size={14} className="text-purple-600" /> Registrations
          </button>
          <button 
            onClick={() => { onEdit(eventItem); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Pencil size={14} className="text-green-600" /> Edit Event
          </button>
          <div className="border-t border-gray-100" />
          <button 
            onClick={() => { onDelete(eventItem._id); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <Trash2 size={14} /> Delete Event
          </button>
        </div>
      )}
    </div>
  );
};

const Events = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [events, setEvents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    plannedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    totalCapacity: 0,
    totalRegistrations: 0,
    checkInsCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);

  // Registrations Modal
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regEvent, setRegEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regSearch, setRegSearch] = useState('');
  const [regFilterStatus, setRegFilterStatus] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
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

  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(BRANCH_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBranches(data.data.filter(b => b.isActive));
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [token]);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : '';
      const branchParam = filterBranch ? `&branch=${filterBranch}` : '';
      const startParam = startDate ? `&startDate=${startDate}` : '';
      const endParam = endDate ? `&endDate=${endDate}` : '';
      
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${branchParam}${startParam}${endParam}`;
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
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, filterBranch, startDate, endDate, toast]);

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
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [fetchEvents, fetchStats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
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
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ev) => {
    setFormData({
      title: ev.title || '',
      description: ev.description || '',
      startDate: ev.startDate ? new Date(ev.startDate).toISOString().slice(0, 16) : '',
      endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
      location: ev.location || '',
      type: ev.type || 'Offline',
      capacity: ev.capacity !== undefined ? String(ev.capacity) : '0',
      status: ev.status || 'Planned',
      branch: ev.branch?._id || ev.branch || ''
    });
    setEditingId(ev._id);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (ev) => {
    setViewingEvent(ev);
    setIsViewModalOpen(true);
  };

  const fetchRegistrations = async (eventId, searchQ = regSearch, statusF = regFilterStatus) => {
    if (!token || !eventId) return;
    setRegLoading(true);
    try {
      const statusParam = statusF ? `&status=${statusF}` : '';
      const url = `${API_BASE}/${eventId}/registrations?search=${encodeURIComponent(searchQ)}${statusParam}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load event registrations');
    } finally {
      setRegLoading(false);
    }
  };

  const handleOpenRegistrationsModal = (ev) => {
    setRegEvent(ev);
    setRegistrations([]);
    setRegSearch('');
    setRegFilterStatus('');
    setIsRegModalOpen(true);
    fetchRegistrations(ev._id, '', '');
  };

  const handleUpdateRegStatus = async (regId, newStatus) => {
    if (!token || !regEvent) return;
    try {
      const res = await fetch(`${API_BASE}/${regEvent._id}/registrations/${regId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Registration updated');
        // Refresh local registrations and overall events list/stats
        fetchRegistrations(regEvent._id);
        fetchEvents();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update registration');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating registration status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity) || 0
        })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Event saved successfully');
        setIsModalOpen(false);
        resetForm();
        fetchEvents();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to save event');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event and all its registrations permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event deleted');
        fetchEvents();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete');
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
              NGO Events Calendar
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Plan, organize, and manage volunteer check-ins for social events</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm border-0"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Events', value: stats.activeCount, color: COLORS.primary, sub: 'In progress now' },
            { label: 'Total RSVPs / Registrations', value: stats.totalRegistrations, color: '#9C27B0', sub: `Capacity: ${stats.totalCapacity || 'Unlimited'}` },
            { label: 'Checked In / Attended', value: stats.checkInsCount, color: COLORS.success, sub: 'Verified check-ins' },
            { label: 'Upcoming Planned', value: stats.plannedCount, color: COLORS.warning, sub: 'Awaiting launch' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 bg-white flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
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
          className="rounded-2xl p-5 bg-white space-y-4" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Search Events</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, location..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">NGO Branch</label>
              <select
                value={filterBranch}
                onChange={(e) => { setFilterBranch(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Event Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No events found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Event Details', 'Type & Location', 'Schedule Time', 'Registrations / Cap', 'Branch', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, idx) => (
                    <tr key={ev._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      <td className="px-4 py-4 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <div>
                          <p className="font-bold text-gray-800 truncate" title={ev.title}>{ev.title}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5" title={ev.description}>{ev.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gray-100 text-gray-700 uppercase">{ev.type}</span>
                          <p className="text-xs font-bold text-gray-700 mt-1 flex items-center gap-1">
                            <MapPin size={11} className="text-red-500" />
                            {ev.location}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                        <div>
                          <p>Start: {new Date(ev.startDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                          <p>End: {new Date(ev.endDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-xs text-gray-800">
                        <div>
                          <span className="text-sm font-bold text-green-700">{ev.registrationsCount}</span>
                          <span className="text-gray-400"> / {ev.capacity > 0 ? ev.capacity : '∞'} RSVPs</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-xs text-gray-700">
                        {ev.branch ? (
                          <div>
                            <p className="font-bold text-gray-800">{ev.branch.name}</p>
                            <p className="text-[9px] text-gray-400">Code: {ev.branch.code}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Central NGO</span>
                        )}
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
                      <td className="px-4 py-4">
                        <ActionMenu 
                          eventItem={ev}
                          onView={handleOpenViewModal}
                          onViewRegistrations={handleOpenRegistrationsModal}
                          onEdit={handleOpenEditModal}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))}
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

      {/* Create / Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800">
                {editingId ? 'Modify Event Schedule' : 'Schedule New Event'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Free Blood Donation Camp"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Description *</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Detailed details about the event, agendas, and volunteer activities..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Venue / Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Community Hall Sector 5, or Zoom Link"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Event Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="Offline">Offline (Physical Venue)</option>
                      <option value="Online">Online (Webinar/Video Meeting)</option>
                      <option value="Hybrid">Hybrid (Mixed Format)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-gray-500">Max Capacity (RSVPs)</label>
                    <input
                      type="number"
                      name="capacity"
                      placeholder="0 for Unlimited"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-gray-500">Branch Association</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="">Global Central Headquarters</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-gray-500">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="Planned">Planned</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer transition-colors bg-white hover:bg-gray-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Update Event' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Viewing Event Details Modal */}
      {isViewModalOpen && viewingEvent && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                <CalendarDays size={20} className="text-green-700" />
                Event Specifications
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 text-sm">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Title</span>
                <span className="font-extrabold text-gray-800 text-lg block leading-tight">{viewingEvent.title}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description & Agenda</span>
                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap mt-1">
                  {viewingEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Venue Venue/Link</span>
                  <span className="font-bold text-gray-700 block mt-0.5">{viewingEvent.location}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Event Format</span>
                  <span className="font-bold text-gray-700 block mt-0.5 uppercase">{viewingEvent.type}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Start Date & Time</span>
                  <span className="font-semibold text-gray-700 block">
                    {new Date(viewingEvent.startDate).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">End Date & Time</span>
                  <span className="font-semibold text-gray-700 block">
                    {new Date(viewingEvent.endDate).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/40">
                <div>
                  <span className="text-[10px] font-bold text-green-700 uppercase block">Total RSVP Cap</span>
                  <span className="text-lg font-extrabold text-green-900">{viewingEvent.capacity > 0 ? viewingEvent.capacity : 'Unlimited'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase block">Registered RSVPs</span>
                  <span className="text-lg font-extrabold text-purple-900">{viewingEvent.registrationsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Current Status</span>
                  <span className="text-lg font-extrabold text-amber-900 capitalize">{viewingEvent.status}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Registrations List Modal */}
      {isRegModalOpen && regEvent && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-4xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-extrabold text-gray-800">
                  Registrations for: {regEvent.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Manage attendee verification, cancellations, and check-ins</p>
              </div>
              <button onClick={() => setIsRegModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Sub-Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search attendee by name, email, phone..."
                  value={regSearch}
                  onChange={(e) => { setRegSearch(e.target.value); fetchRegistrations(regEvent._id, e.target.value, regFilterStatus); }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <select
                value={regFilterStatus}
                onChange={(e) => { setRegFilterStatus(e.target.value); fetchRegistrations(regEvent._id, regSearch, e.target.value); }}
                className="px-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
              >
                <option value="">All RSVP Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Attended">Attended (Checked-in)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* List */}
            <div className="max-h-[50vh] overflow-y-auto border border-gray-100 rounded-xl">
              {regLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-green-600" size={24} />
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs font-semibold">No registered attendees.</div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 uppercase text-gray-400 border-b">
                    <tr>
                      <th className="px-4 py-3">Attendee</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Registered At</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Attendance Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-gray-800">{reg.name}</p>
                            <p className="text-[10px] text-gray-400">{reg.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700">{reg.phone}</td>
                        <td className="px-4 py-3 text-gray-400 font-medium">
                          {new Date(reg.registeredAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3 max-w-[150px] truncate text-gray-500" title={reg.notes}>
                          {reg.notes || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            reg.status === 'Attended' ? 'bg-green-100 text-green-700 border border-green-200' :
                            reg.status === 'Confirmed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {reg.status === 'Attended' ? 'Attended' : reg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          {reg.status !== 'Attended' && reg.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateRegStatus(reg._id, 'Attended')}
                              className="px-2 py-1 rounded bg-green-600 text-white font-bold hover:bg-green-700 border-0 cursor-pointer text-[10px]"
                            >
                              Check-In
                            </button>
                          )}
                          {reg.status === 'Attended' && (
                            <button
                              onClick={() => handleUpdateRegStatus(reg._id, 'Confirmed')}
                              className="px-2 py-1 rounded bg-yellow-600 text-white font-bold hover:bg-yellow-700 border-0 cursor-pointer text-[10px]"
                            >
                              Undo Check-In
                            </button>
                          )}
                          {reg.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateRegStatus(reg._id, 'Cancelled')}
                              className="px-2 py-1 rounded bg-red-100 text-red-600 font-bold hover:bg-red-200 border-0 cursor-pointer text-[10px]"
                            >
                              Cancel RSVP
                            </button>
                          )}
                          {reg.status === 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateRegStatus(reg._id, 'Confirmed')}
                              className="px-2 py-1 rounded bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 border-0 cursor-pointer text-[10px]"
                            >
                              Restore Confirmed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="flex justify-end pt-3">
              <button 
                onClick={() => setIsRegModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer bg-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
};

export default Events;

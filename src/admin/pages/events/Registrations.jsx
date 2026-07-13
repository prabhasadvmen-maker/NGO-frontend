import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Search, ArrowLeft, Loader2, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/events`;

const Registrations = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');

  const [allEvents, setAllEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch all events for the selector
  const fetchAllEvents = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllEvents(data.data);
        if (!selectedEventId && data.data.length > 0) {
          setSelectedEventId(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [token, selectedEventId]);

  // Fetch registrations for the selected event
  const fetchRegistrations = useCallback(async (evId = selectedEventId, searchQ = search, statusF = filterStatus) => {
    if (!token || !evId) return;
    setLoading(true);
    try {
      const statusParam = statusF ? `&status=${statusF}` : '';
      const url = `${API_BASE}/${evId}/registrations?search=${encodeURIComponent(searchQ)}${statusParam}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch attendee list');
    } finally {
      setLoading(false);
    }
  }, [token, selectedEventId, search, filterStatus, toast]);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations(selectedEventId, search, filterStatus);
    }
  }, [selectedEventId, search, filterStatus, fetchRegistrations]);

  const handleToggleAttendance = async (regId, currentStatus) => {
    if (!token || !selectedEventId) return;
    const targetStatus = currentStatus === 'Attended' ? 'Confirmed' : 'Attended';
    try {
      const res = await fetch(`${API_BASE}/${selectedEventId}/registrations/${regId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Attendee marked as ${targetStatus}`);
        fetchRegistrations();
      } else {
        toast.error(data.message || 'Failed to update attendance');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error updating status');
    }
  };

  const handleCancelRSVP = async (regId, status) => {
    if (!token || !selectedEventId) return;
    const targetStatus = status === 'Cancelled' ? 'Confirmed' : 'Cancelled';
    try {
      const res = await fetch(`${API_BASE}/${selectedEventId}/registrations/${regId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`RSVP updated successfully`);
        fetchRegistrations();
      } else {
        toast.error(data.message || 'Failed to update RSVP');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getEventTitle = () => {
    const matched = allEvents.find(e => e._id === selectedEventId);
    return matched ? matched.title : 'Selected Event';
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <button
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Users size={26} className="text-green-700" />
              RSVPs & Attendee Lists
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage attendee listings, RSVP cancellations, and check-ins</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Select Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => { setSelectedEventId(e.target.value); setPage(1); }}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold max-w-xs"
            >
              {allEvents.map(e => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters */}
        <div 
          className="rounded-2xl p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by attendee name, email, or phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="">All RSVP Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Attended">Attended (Checked-in)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No RSVPs found for {getEventTitle()}.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Attendee details', 'Phone Number', 'Registered Date', 'Status', 'Attendance check', 'RSVP Status'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, idx) => (
                    <tr key={reg._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      <td className="px-4 py-4 text-gray-500 font-medium">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-gray-800">{reg.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{reg.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-700">{reg.phone}</td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-400">
                        {new Date(reg.registeredAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          reg.status === 'Attended' ? 'bg-green-100 text-green-700 border border-green-200' :
                          reg.status === 'Confirmed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold">
                        {reg.status !== 'Cancelled' ? (
                          <button
                            onClick={() => handleToggleAttendance(reg._id, reg.status)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-0 text-white cursor-pointer ${
                              reg.status === 'Attended' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-700 hover:opacity-90'
                            }`}
                          >
                            {reg.status === 'Attended' ? 'Undo Check-In' : 'Mark Attended'}
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">Registration Cancelled</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold">
                        <button
                          onClick={() => handleCancelRSVP(reg._id, reg.status)}
                          className={`px-3 py-1.5 rounded-lg border-0 cursor-pointer ${
                            reg.status === 'Cancelled' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {reg.status === 'Cancelled' ? 'Restore RSVP' : 'Cancel RSVP'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Registrations;

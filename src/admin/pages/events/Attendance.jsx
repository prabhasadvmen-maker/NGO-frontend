import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, ArrowLeft, Loader2, CalendarDays, Check } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/events`;

const Attendance = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [allEvents, setAllEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all events
  const fetchAllEvents = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllEvents(data.data);
        if (data.data.length > 0) {
          setSelectedEventId(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // Fetch attendees
  const fetchAttendees = useCallback(async (evId = selectedEventId, searchQ = search) => {
    if (!token || !evId) return;
    setLoading(true);
    try {
      // Filter for Confirmed attendees first, or listing everyone to check-in
      const url = `${API_BASE}/${evId}/registrations?search=${encodeURIComponent(searchQ)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedEventId, search]);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendees(selectedEventId, search);
    }
  }, [selectedEventId, search, fetchAttendees]);

  const handleCheckIn = async (regId) => {
    if (!token || !selectedEventId) return;
    try {
      const res = await fetch(`${API_BASE}/${selectedEventId}/registrations/${regId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Attended' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Attendee checked in successfully!');
        fetchAttendees();
      } else {
        toast.error(data.message || 'Check-in failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10 max-w-4xl">
        <button
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <ShieldCheck size={26} className="text-green-700" />
              Venues Check-in Gate
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Quickly search and check-in attendees at offline NGO venues</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Event Target:</span>
            <select
              value={selectedEventId}
              onChange={(e) => { setSelectedEventId(e.target.value); }}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
            >
              {allEvents.map(e => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div 
          className="rounded-2xl p-5 bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search registrant email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Registrants List */}
        <div 
          className="rounded-2xl bg-white overflow-hidden" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm font-semibold">No registered attendees.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {registrations.map(reg => (
                <div key={reg._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-800">{reg.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{reg.email} • {reg.phone}</p>
                    {reg.notes && <p className="text-[10px] text-gray-400 italic mt-1">Note: {reg.notes}</p>}
                  </div>
                  <div>
                    {reg.status === 'Attended' ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-100 text-green-700 font-bold text-xs">
                        <Check size={14} /> Checked In
                      </span>
                    ) : reg.status === 'Cancelled' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-red-105 text-red-600 font-bold text-xs">
                        Cancelled RSVP
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(reg._id)}
                        className="px-4 py-2 border-0 rounded-xl bg-green-700 hover:opacity-90 text-white font-bold text-xs cursor-pointer"
                      >
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;

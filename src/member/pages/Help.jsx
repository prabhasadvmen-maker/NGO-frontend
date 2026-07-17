import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle, Search, Loader2, Send, Clock, 
  MessageSquare, User, Phone, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS, SHADOWS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/member/activities/help`;

const Help = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(user?.mobileNumber || '');

  // Expanded ticket details
  const [expandedId, setExpandedId] = useState(null);

  const fetchHelpQueries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setQueries(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load support history');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchHelpQueries();
  }, [fetchHelpQueries]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject, message, phone })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Support ticket submitted successfully!');
        setSubject('');
        setMessage('');
        fetchHelpQueries();
      } else {
        toast.error(resData.message || 'Failed to submit support ticket');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error submitting ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1 text-left">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <HelpCircle className="text-[#1B5E20]" size={28} />
              Help & Support
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Submit support tickets, report queries, or check the status of past queries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Submit Form Card */}
          <div
            className="lg:col-span-2 rounded-3xl p-6 md:p-8 space-y-6 h-fit"
            style={{
              backgroundColor: '#F5F5F5',
              boxShadow: SHADOWS.neo
            }}
          >
            <h3 className="text-lg font-black text-gray-800 tracking-tight">Create Support Ticket</h3>
            
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this regarding?"
                  className="w-full rounded-xl border border-gray-250 bg-white/70 px-3 py-2.5 text-xs outline-none focus:border-green-700 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Phone</label>
                <div className="relative flex items-center">
                  <Phone size={14} className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full pl-9 rounded-xl border border-gray-255 bg-white/70 px-3 py-2.5 text-xs outline-none focus:border-green-700 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message Description *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your query in detail..."
                  className="w-full rounded-xl border border-gray-250 bg-white/70 px-3 py-2.5 text-xs outline-none focus:border-green-700 transition-all font-semibold leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl text-xs font-black cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="animate-spin text-white" size={15} />
                ) : (
                  <Send size={14} />
                )}
                {submitting ? 'Submitting Ticket...' : 'Submit Support Request'}
              </button>
            </form>
          </div>

          {/* Ticket History Card */}
          <div
            className="lg:col-span-3 rounded-3xl p-6 md:p-8 space-y-6"
            style={{
              backgroundColor: '#F5F5F5',
              boxShadow: SHADOWS.neo
            }}
          >
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-4">
              TICKET HISTORY ({queries.length})
            </h3>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
                <p className="text-sm font-semibold text-gray-500 font-bold">Loading support tickets...</p>
              </div>
            ) : queries.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow-inner">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-700">No Support History</p>
                  <p className="text-[11px] text-gray-400 mt-1 font-semibold">Any help requests you make will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {queries.map(q => (
                  <div
                    key={q._id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Collapsible Header */}
                    <div
                      onClick={() => toggleExpand(q._id)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            q.status === 'Replied' ? 'bg-green-50 text-green-700 border border-green-200' :
                            q.status === 'Read' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {q.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-gray-800 text-xs mt-1.5 truncate">
                          {q.subject}
                        </h4>
                      </div>
                      <div className="text-gray-400 hover:text-gray-600 transition-colors">
                        {expandedId === q._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Collapsible Details */}
                    {expandedId === q._id && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-50 space-y-3 bg-gray-50/50 text-xs">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">My Query Message</span>
                          <p className="text-gray-600 font-semibold leading-relaxed whitespace-pre-wrap">{q.message}</p>
                        </div>
                        
                        {q.notes && (
                          <div className="p-3 bg-green-50/30 border border-[#1B5E20]/15 rounded-xl space-y-1 mt-2">
                            <span className="text-[9px] font-black uppercase text-green-700 tracking-wider flex items-center gap-1">
                              <CheckCircle2 size={12} /> Admin Response Notes
                            </span>
                            <p className="text-gray-700 font-semibold leading-relaxed whitespace-pre-wrap">{q.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;

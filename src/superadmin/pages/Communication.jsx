import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Send, History, Mail, Phone, MessageCircle, Bell, Loader2,
  Trash2, Eye, ShieldAlert, CheckCircle, Info, Inbox, Settings, X
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const COMM_API = `${API_BASE_URL}/api/superadmin/communication`;
const BRANCH_API = `${API_BASE_URL}/api/superadmin/branches`;

const Communication = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('send'); // send, logs, mock-inbox
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lists
  const [branches, setBranches] = useState([]);
  const [logs, setLogs] = useState([]);
  const [mockInbox, setMockInbox] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    type: 'Email', // Email, SMS, WhatsApp, In-App
    recipientType: 'Members', // Volunteers, Members, Beneficiaries, Donors, All
    subject: '',
    message: '',
    branch: '' // Empty for all
  });

  // Pagination for logs
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal
  const [viewingItem, setViewingItem] = useState(null);

  const fetchAPI = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });
      if (!res.ok) {
        toast.error(`Error: ${res.statusText}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('Communication API error:', err);
      return null;
    }
  }, [token, toast]);

  const loadBranches = useCallback(async () => {
    const json = await fetchAPI(BRANCH_API);
    if (json && json.success) {
      setBranches(json.data || []);
    }
  }, [fetchAPI]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const json = await fetchAPI(`${COMM_API}/logs?page=${page}&limit=10`);
      if (json && json.success) {
        setLogs(json.data || []);
        setTotalPages(json.pagination.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page, fetchAPI, toast]);

  const loadMockInbox = useCallback(async () => {
    setLoading(true);
    try {
      const json = await fetchAPI(`${COMM_API}/mock-inbox`);
      if (json && json.success) {
        setMockInbox(json.data || []);
      }
    } catch (err) {
      toast.error('Failed to load simulated mailbox');
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, toast]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    if (activeSubTab === 'logs') {
      loadLogs();
    } else if (activeSubTab === 'mock-inbox') {
      loadMockInbox();
    }
  }, [activeSubTab, page, loadLogs, loadMockInbox]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return toast.error('Message content cannot be blank');
    if (form.type === 'Email' && !form.subject.trim()) return toast.error('Email subject is required');

    setSubmitting(true);
    try {
      const json = await fetchAPI(`${COMM_API}/send`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      if (json && json.success) {
        toast.success(json.message || 'Notification broadcast successfully!');
        setForm(p => ({ ...p, subject: '', message: '' }));
      } else {
        toast.error('Broadcasting failed');
      }
    } catch (err) {
      toast.error('Broadcast request error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Delete log audit?')) return;
    const json = await fetchAPI(`${COMM_API}/logs/${id}`, { method: 'DELETE' });
    if (json && json.success) {
      toast.success('Log record deleted');
      loadLogs();
    }
  };

  const getChannelIcon = (type) => {
    switch (type) {
      case 'Email': return <Mail className="text-blue-500" size={16} />;
      case 'SMS': return <Phone className="text-orange-500" size={16} />;
      case 'WhatsApp': return <MessageCircle className="text-emerald-500" size={16} />;
      default: return <Bell className="text-purple-500" size={16} />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-[#1B5E20]" size={28} />
            Communication Portal
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1">
            Send bulk emails, SMS updates, WhatsApp messages, or system-wide push notices to lists
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-gray-200 gap-6">
          {[
            { id: 'send', label: 'Broadcast Message', icon: Send },
            { id: 'logs', label: 'Dispatch Audits', icon: History },
            { id: 'mock-inbox', label: 'Simulated Mailbox', icon: Inbox }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveSubTab(tab.id); setPage(1); }}
                className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-0 ${
                  activeSubTab === tab.id
                    ? 'border-[#1B5E20] text-[#1B5E20]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        {activeSubTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm text-left">
              <h3 className="text-base font-extrabold text-gray-800 mb-4">Compose Campaign Broadcast</h3>
              
              <form onSubmit={handleSend} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Communication Channel *</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm(p => ({ ...p, type: e.target.value, subject: e.target.value === 'Email' ? p.subject : '' }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-700"
                    >
                      <option value="Email">Email Message</option>
                      <option value="SMS">SMS Notification</option>
                      <option value="WhatsApp">WhatsApp Alert</option>
                      <option value="In-App">In-App System Notification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Target Recipient Type *</label>
                    <select
                      value={form.recipientType}
                      onChange={(e) => setForm(p => ({ ...p, recipientType: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-700"
                    >
                      <option value="Members">Branch Members</option>
                      <option value="Volunteers">Volunteers Team</option>
                      <option value="Beneficiaries">Beneficiaries List</option>
                      <option value="Donors">Past Donors</option>
                      <option value="All">All Contacts</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Target Branch Scope (Optional)</label>
                    <select
                      value={form.branch}
                      onChange={(e) => setForm(p => ({ ...p, branch: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-700"
                    >
                      <option value="">Global / All Branches</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.type === 'Email' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subject Header *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monthly Welfare Drive Notice"
                      value={form.subject}
                      onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 text-gray-700 font-semibold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Message Body *</label>
                  <textarea
                    required
                    placeholder="Write message copy here..."
                    value={form.message}
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-40 font-semibold text-gray-700"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-450 font-bold">Characters count: {form.message.length}</span>
                    <span className="text-[10px] text-gray-400 font-bold">Variables supported: {"{name}"}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 border-0 rounded-xl bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-opacity shadow-sm"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                    {submitting ? 'Sending Broadcast Logs...' : 'Send Broadcast Notification'}
                  </button>
                </div>
              </form>
            </div>

            {/* Note Panel */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4 text-left">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-1.5"><Info className="text-yellow-600" size={20} /> Integration Warning</h3>
              <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                To prevent accidental charges on production channels during NGO audits or developer trials, external gateway integrations are disabled by default.
              </p>
              <div className="p-3 bg-green-50/50 border border-green-150 rounded-2xl flex items-start gap-2">
                <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={16} />
                <span className="text-[11px] text-green-800 leading-normal font-bold">
                  All messages sent are logged immediately in the <strong>Simulated Mailbox</strong> tab. Inspect payloads, HTML templates, and recipients counts in real-time.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'logs' && (
          loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
              <p className="text-xs text-gray-400 font-bold">Retrieving communication logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl py-20 text-center text-gray-400 font-semibold shadow-sm">
              No broadcast log audits found.
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[40vh]" onClick={() => setOpenMenuId(null)}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500 animate-fade-in" style={{ borderColor: '#E0E0E0' }}>
                      <th className="px-4 py-3.5 text-xs font-bold uppercase text-left w-16">S.R.</th>
                      <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Channel</th>
                      <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Subject / Preview</th>
                      <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Audience</th>
                      <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Targets count</th>
                      <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Date</th>
                      <th className="px-4 py-3.5 text-xs font-bold uppercase text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={log._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4 font-bold text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1.5 font-bold text-gray-700">
                            {getChannelIcon(log.type)}
                            {log.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-bold text-gray-800 block truncate max-w-xs">{log.subject || 'N/A'}</span>
                          <span className="text-[10px] text-gray-400 block truncate max-w-xs font-semibold">{log.message}</span>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-500">{log.recipientType}</td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-600">{log.recipientsCount} users</td>
                        <td className="px-4 py-4 text-xs text-gray-400 font-semibold">{new Date(log.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                        <td className="px-4 py-4 text-right pr-6">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === log._id ? null : log._id); }}
                              className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                            >
                              <Settings size={14} className="text-gray-500" />
                            </button>
                            {openMenuId === log._id && (
                              <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-32 py-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => { setViewingItem(log); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                >
                                  <Eye size={13} className="text-blue-500" /> View
                                </button>
                                <button
                                  onClick={() => { handleDeleteLog(log._id); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-0"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-400 font-bold">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {activeSubTab === 'mock-inbox' && (
          loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
              <p className="text-xs text-gray-400 font-bold">Fetching simulated notifications inbox...</p>
            </div>
          ) : mockInbox.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl py-20 text-center text-gray-400 font-semibold shadow-sm">
              No simulated messages captured yet. Send a broadcast to see outputs.
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[40vh] space-y-4 text-left">
              <div className="p-3 bg-blue-50/50 border border-blue-150 rounded-2xl flex items-center gap-2">
                <Info className="text-blue-600 shrink-0" size={16} />
                <span className="text-[11px] text-blue-800 leading-normal font-bold">
                  These records show the exact output payloads generated, simulating actual delivery.
                </span>
              </div>

              <div className="space-y-4">
                {mockInbox.map(entry => (
                  <div key={entry.id} className="border border-gray-100 p-4 rounded-2xl hover:border-green-200 transition-colors bg-gray-50/30">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(entry.type)}
                        <span className="font-extrabold text-xs text-gray-800">{entry.type}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 border border-green-200 text-green-700">Simulated</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">{new Date(entry.sentAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-800 font-bold">Subject: {entry.subject}</p>
                      <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100 italic">"{entry.message}"</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-400 font-bold">Audience: {entry.recipientType} ({entry.recipients.length} targets)</span>
                        <button onClick={() => setViewingItem(entry)} className="text-[10px] text-green-750 font-bold bg-transparent border-0 cursor-pointer flex items-center gap-1"><Eye size={12} /> Inspect Target List</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* DETAIL MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="text-left">
                <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-1.5">
                  {getChannelIcon(viewingItem.type)} Broadcast Details
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Logs and target index summaries</p>
              </div>
              <button onClick={() => setViewingItem(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Subject Header</span>
                <span className="font-bold text-gray-800 block mt-0.5">{viewingItem.subject || 'No Subject'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Message Content</span>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-650 leading-relaxed font-semibold block mt-1 whitespace-pre-wrap">
                  {viewingItem.message}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Recipients Group ({viewingItem.recipientType})</span>
                {viewingItem.recipients && viewingItem.recipients.length > 0 ? (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[25vh] overflow-y-auto no-scrollbar bg-gray-50/50">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-500 font-bold border-b border-gray-150">
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Mobile</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingItem.recipients.map((r, i) => (
                          <tr key={i} className="border-b last:border-0 border-gray-100 font-semibold">
                            <td className="px-3 py-2 text-gray-800">{r.name}</td>
                            <td className="px-3 py-2 text-gray-500 font-mono">{r.email || 'N/A'}</td>
                            <td className="px-3 py-2 text-gray-500 font-mono">{r.mobile || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 text-green-800 border border-green-150 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle className="text-green-600 shrink-0" size={14} />
                    This dispatch drive successfully targeted {viewingItem.recipientsCount} active recipients registered under the {viewingItem.recipientType} group (Branch Scope: {viewingItem.branch?.name || 'Global HQ'}).
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button onClick={() => setViewingItem(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer bg-white">
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Communication;

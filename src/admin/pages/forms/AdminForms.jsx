import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Mail, Users, Check, X, Eye, Loader2, UserCheck, Settings,
  CheckCircle2, Clock, Calendar, AlertTriangle
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const CMS_API = `${API_BASE_URL}/api/admin/cms`;
const MEMBER_API = `${API_BASE_URL}/api/admin/members`;
const VOLUNTEER_API = `${API_BASE_URL}/api/admin/volunteers`;

const AdminForms = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  // Local React state for active tab selection ('contact' default)
  const [activeTab, setActiveTab] = useState('contact'); // 'contact', 'membership', 'volunteer'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dropdown states
  const [openMenuId, setOpenMenuId] = useState(null);

  // Data lists
  const [contactQueries, setContactQueries] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Detail View
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDropdownToggle = (evt, id) => {
    evt.stopPropagation();
    setOpenMenuId(prev => (prev === id ? null : id));
  };

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
      console.error('Admin Forms Fetch error:', err);
      return null;
    }
  }, [token, toast]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'contact') {
        const json = await fetchAPI(`${CMS_API}/queries?page=${page}&limit=10`);
        if (json && json.success) {
          setContactQueries(json.data || []);
          setTotalPages(json.pagination.totalPages || 1);
        }
      } else if (activeTab === 'membership') {
        const json = await fetchAPI(`${MEMBER_API}?status=Pending&page=${page}&limit=10`);
        if (json && json.success) {
          setPendingMembers(json.data || []);
          setTotalPages(json.pagination.totalPages || 1);
        }
      } else if (activeTab === 'volunteer') {
        const json = await fetchAPI(`${VOLUNTEER_API}?status=Pending&page=${page}&limit=10`);
        if (json && json.success) {
          setPendingVolunteers(json.data || []);
          setTotalPages(json.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      toast.error('Failed to retrieve branch form submissions');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, fetchAPI, toast]);

  useEffect(() => {
    setPage(1);
    setTotalPages(1);
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions for Contact Queries
  const handleUpdateQueryStatus = async (id, status) => {
    const data = await fetchAPI(`${CMS_API}/queries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (data && data.success) {
      toast.success(`Query marked as ${status}`);
      if (selectedItem && selectedItem._id === id) {
        setSelectedItem(data.data);
      }
      loadData();
    }
  };

  // Actions for Members (Using the correct approve/reject request endpoints)
  const handleProcessMember = async (id, actionType) => {
    setSubmitting(true);
    const endpoint = `${MEMBER_API}/${id}/${actionType === 'approve' ? 'approve-request' : 'reject-request'}`;
    const data = await fetchAPI(endpoint, {
      method: 'POST'
    });
    setSubmitting(false);
    if (data && data.success) {
      toast.success(actionType === 'approve' ? 'Membership approved successfully' : 'Membership application request rejected');
      setSelectedItem(null);
      loadData();
    }
  };

  // Actions for Volunteers (Using the correct approve/reject request endpoints)
  const handleProcessVolunteer = async (id, actionType) => {
    setSubmitting(true);
    const endpoint = `${VOLUNTEER_API}/${id}/${actionType === 'approve' ? 'approve-request' : 'reject-request'}`;
    const data = await fetchAPI(endpoint, {
      method: 'POST'
    });
    setSubmitting(false);
    if (data && data.success) {
      toast.success(actionType === 'approve' ? 'Volunteer approved and verified successfully' : 'Volunteer registration request rejected');
      setSelectedItem(null);
      loadData();
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <FileText className="text-[#1B5E20]" size={28} />
            Branch Forms Submissions
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1">
            Review and audit contact inquiries, membership applications, and volunteer requests for this branch scope
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 gap-6">
          {[
            { id: 'contact', label: 'Contact Queries', icon: Mail },
            { id: 'membership', label: 'Membership Requests', icon: Users },
            { id: 'volunteer', label: 'Volunteer Registrations', icon: UserCheck }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-0 ${
                  activeTab === tab.id
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs text-gray-400 font-bold">Loading submissions...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[40vh]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left w-16">S.R.</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Sender / Applicant</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Details</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Status</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Date</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'contact' && (
                    contactQueries.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-400 font-semibold">No queries found.</td></tr>
                    ) : (
                      contactQueries.map((q, idx) => (
                        <tr key={q._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                          <td className="px-4 py-4 font-bold text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                          <td className="px-4 py-4 font-bold text-gray-800">
                            {q.name}
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{q.email}</p>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-gray-600 line-clamp-1 max-w-xs">{q.subject}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              q.status === 'Replied' ? 'bg-green-50 text-green-700 border-green-200' :
                              q.status === 'Read' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>{q.status}</span>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-400 font-semibold">{new Date(q.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-4 text-right pr-6 relative overflow-visible">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(evt) => handleDropdownToggle(evt, q._id)}
                                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-gray-700 hover:text-green-700"
                              >
                                <Settings size={18} className={openMenuId === q._id ? 'animate-spin text-green-700' : ''} />
                              </button>
                              {openMenuId === q._id && (
                                <div className="absolute right-0 mt-2 z-30 bg-white border border-gray-100 rounded-xl shadow-xl w-44 py-2 text-left" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => { setSelectedItem(q); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Eye size={14} className="text-blue-500" /> View Details
                                  </button>
                                  <button
                                    onClick={() => { handleUpdateQueryStatus(q._id, 'Read'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Check size={14} className="text-green-500" /> Mark as Read
                                  </button>
                                  <button
                                    onClick={() => { handleUpdateQueryStatus(q._id, 'Replied'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Check size={14} className="text-green-500" /> Mark as Replied
                                  </button>
                                  <button
                                    onClick={() => { handleUpdateQueryStatus(q._id, 'Unread'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <X size={14} className="text-red-500" /> Mark as Unread
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  )}

                  {activeTab === 'membership' && (
                    pendingMembers.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-400 font-semibold">No pending memberships.</td></tr>
                    ) : (
                      pendingMembers.map((m, idx) => (
                        <tr key={m._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                          <td className="px-4 py-4 font-bold text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                          <td className="px-4 py-4 font-bold text-gray-800">
                            {m.fullName}
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{m.email || 'No Email'}</p>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                            {m.occupation || 'Not Specified'}{' '}
                            {m.requestedMembershipType ? (
                              <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Upgrade To: {m.requestedMembershipType} (Current: {m.membershipType})
                              </span>
                            ) : (
                              `(Type: ${m.membershipType})`
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-orange-50 text-orange-700 border-orange-200">Pending</span>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-400 font-semibold">{new Date(m.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-4 text-right pr-6 relative overflow-visible">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(evt) => handleDropdownToggle(evt, m._id)}
                                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-gray-700 hover:text-green-700"
                              >
                                <Settings size={18} className={openMenuId === m._id ? 'animate-spin text-green-700' : ''} />
                              </button>
                              {openMenuId === m._id && (
                                <div className="absolute right-0 mt-2 z-30 bg-white border border-gray-100 rounded-xl shadow-xl w-44 py-2 text-left" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => { setSelectedItem(m); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Eye size={14} className="text-blue-500" /> Review / View
                                  </button>
                                  <button
                                    onClick={() => { handleProcessMember(m._id, 'approve'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-green-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Check size={14} className="text-green-600" /> Approve Application
                                  </button>
                                  <button
                                    onClick={() => { handleProcessMember(m._id, 'reject'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <X size={14} className="text-red-500" /> Reject Application
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  )}

                  {activeTab === 'volunteer' && (
                    pendingVolunteers.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-400 font-semibold">No pending volunteer registrations.</td></tr>
                    ) : (
                      pendingVolunteers.map((v, idx) => (
                        <tr key={v._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                          <td className="px-4 py-4 font-bold text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                          <td className="px-4 py-4 font-bold text-gray-800">
                            {v.fullName}
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{v.email || 'No Email'}</p>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-gray-600">Mobile: {v.mobileNumber}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-orange-50 text-orange-700 border-orange-200">Pending</span>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-400 font-semibold">{new Date(v.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-4 text-right pr-6 relative overflow-visible">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(evt) => handleDropdownToggle(evt, v._id)}
                                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-gray-700 hover:text-green-700"
                              >
                                <Settings size={18} className={openMenuId === v._id ? 'animate-spin text-green-700' : ''} />
                              </button>
                              {openMenuId === v._id && (
                                <div className="absolute right-0 mt-2 z-30 bg-white border border-gray-100 rounded-xl shadow-xl w-44 py-2 text-left" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => { setSelectedItem(v); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Eye size={14} className="text-blue-500" /> Review / View
                                  </button>
                                  <button
                                    onClick={() => { handleProcessVolunteer(v._id, 'approve'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-green-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Check size={14} className="text-green-600" /> Approve Application
                                  </button>
                                  <button
                                    onClick={() => { handleProcessVolunteer(v._id, 'reject'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <X size={14} className="text-red-500" /> Reject Application
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  )}
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
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  {activeTab === 'contact' ? 'Inquiry Details' : activeTab === 'membership' ? 'Membership Request' : 'Volunteer Application'}
                </h3>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">Auditing Form Submission</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Sender</span>
                  <span className="font-bold text-gray-800">{selectedItem.name}</span>
                  <span className="block text-[10px] text-gray-400 font-bold">{selectedItem.email} | Mobile: {selectedItem.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subject</span>
                  <span className="font-bold text-gray-800">{selectedItem.subject}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Message Content</span>
                  <p className="text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100 italic font-semibold">
                    "{selectedItem.message}"
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Remarks / Follow-up Notes</label>
                  <textarea
                    value={selectedItem.notes || ''}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setSelectedItem(p => ({ ...p, notes: val }));
                      await fetchAPI(`${CMS_API}/queries/${selectedItem._id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ notes: val })
                      });
                    }}
                    placeholder="Write action notes..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-20 resize-none font-semibold text-gray-700"
                  />
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
                  <div className="flex gap-2">
                    {['Unread', 'Read', 'Replied'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateQueryStatus(selectedItem._id, st)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          selectedItem.status === st ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-3 border-t border-gray-100">
                  <button onClick={() => setSelectedItem(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer bg-white">
                    Close Details
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'membership' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name</span>
                    <span className="font-bold text-gray-800">{selectedItem.fullName}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Membership Type</span>
                    <span className="font-bold text-gray-800">
                      {selectedItem.requestedMembershipType ? (
                        <span className="text-amber-600 font-bold">
                          Upgrade To: {selectedItem.requestedMembershipType} (Current: {selectedItem.membershipType})
                        </span>
                      ) : (
                        selectedItem.membershipType
                      )}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Mobile Number</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Email Address</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Occupation</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.occupation || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Applied On</span>
                    <span className="text-xs font-bold text-gray-700">{new Date(selectedItem.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                </div>
                {selectedItem.requestedMembershipType && selectedItem.upgradePaymentMode && (
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-150 space-y-2 text-xs text-left">
                    <p className="font-bold text-amber-850 uppercase tracking-wide text-[10px]">Submitted Upgrade Payment Verification</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold">PAYMENT MODE</span>
                        <span className="font-bold text-gray-700">{selectedItem.upgradePaymentMode}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold">TRANSACTION REF ID (UTR)</span>
                        <span className="font-bold text-gray-700 font-mono select-all">{selectedItem.upgradeTransactionId || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleProcessMember(selectedItem._id, 'approve')}
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#1B5E20] text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Approve Applicant
                  </button>
                  <button
                    onClick={() => handleProcessMember(selectedItem._id, 'reject')}
                    disabled={submitting}
                    className="flex-1 py-3 bg-red-650 text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />} Reject Application
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'volunteer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Volunteer Name</span>
                    <span className="font-bold text-gray-800">{selectedItem.fullName}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Availability</span>
                    <span className="font-bold text-gray-800">{selectedItem.availability || 'Full-Time'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Mobile Number</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Email Address</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Applied On</span>
                    <span className="text-xs font-bold text-gray-700">{new Date(selectedItem.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleProcessVolunteer(selectedItem._id, 'approve')}
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#1B5E20] text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Approve Registration
                  </button>
                  <button
                    onClick={() => handleProcessVolunteer(selectedItem._id, 'reject')}
                    disabled={submitting}
                    className="flex-1 py-3 bg-red-650 text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />} Reject Registration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminForms;

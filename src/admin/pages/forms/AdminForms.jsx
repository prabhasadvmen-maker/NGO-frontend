import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Mail, Users, Check, X, Eye, Loader2, UserCheck, Settings
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const CMS_API = `${API_BASE_URL}/api/admin/cms`;
const MEMBER_API = `${API_BASE_URL}/api/admin/members`;
const VOLUNTEER_API = `${API_BASE_URL}/api/admin/volunteers`;

const AdminForms = ({ defaultTab = 'contact' }) => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data lists
  const [contactQueries, setContactQueries] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Detail View
  const [selectedItem, setSelectedItem] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

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
          setTotalPages(json.pagination.totalPages);
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

  // Actions for Members
  const handleProcessMember = async (id, status) => {
    setSubmitting(true);
    const data = await fetchAPI(`${MEMBER_API}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    setSubmitting(false);
    if (data && data.success) {
      toast.success(`Membership application set to ${status}`);
      setSelectedItem(null);
      loadData();
    }
  };

  // Actions for Volunteers
  const handleProcessVolunteer = async (id, status) => {
    setSubmitting(true);
    const data = await fetchAPI(`${VOLUNTEER_API}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    setSubmitting(false);
    if (data && data.success) {
      toast.success(`Volunteer application set to ${status}`);
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
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[40vh]" onClick={() => setOpenMenuId(null)}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left w-16">S.R.</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Sender / Applicant</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Details</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Status</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Date</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-right pr-6">Action</th>
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
                          <td className="px-4 py-4 text-right pr-6">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === q._id ? null : q._id); }}
                                className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                              >
                                <Settings size={14} className="text-gray-500" />
                              </button>
                              {openMenuId === q._id && (
                                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-32 py-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => { setSelectedItem(q); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Eye size={13} className="text-blue-500" /> View
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
                          <td className="px-4 py-4 text-xs font-semibold text-gray-600">{m.occupation || 'Not Specified'} (Type: {m.membershipType})</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-orange-50 text-orange-700 border-orange-200">Pending</span>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-400 font-semibold">{new Date(m.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-4 text-right pr-6">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === m._id ? null : m._id); }}
                                className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                              >
                                <Settings size={14} className="text-gray-500" />
                              </button>
                              {openMenuId === m._id && (
                                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-32 py-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => { setSelectedItem(m); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Eye size={13} className="text-blue-500" /> Review / View
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
                          <td className="px-4 py-4 text-right pr-6">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === v._id ? null : v._id); }}
                                className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                              >
                                <Settings size={14} className="text-gray-500" />
                              </button>
                              {openMenuId === v._id && (
                                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-32 py-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => { setSelectedItem(v); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                                  >
                                    <Eye size={13} className="text-blue-500" /> Review / View
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800 font-mono">
                  {activeTab === 'contact' ? 'Inquiry Details' : activeTab === 'membership' ? 'Membership Request' : 'Volunteer Application'}
                </h3>
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
                    Close
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'membership' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Full Name</span>
                    <span className="font-bold text-gray-800">{selectedItem.fullName}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Membership Type</span>
                    <span className="font-bold text-gray-800">{selectedItem.membershipType}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Mobile Number</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Email Address</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleProcessMember(selectedItem._id, 'Active')}
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#1B5E20] text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Approve Applicant
                  </button>
                  <button
                    onClick={() => handleProcessMember(selectedItem._id, 'Inactive')}
                    disabled={submitting}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    <X size={14} /> Reject Application
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'volunteer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Volunteer Name</span>
                    <span className="font-bold text-gray-800">{selectedItem.fullName}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Availability</span>
                    <span className="font-bold text-gray-800">{selectedItem.availability || 'Full-Time'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Mobile Number</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Email Address</span>
                    <span className="text-xs font-bold text-gray-700">{selectedItem.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleProcessVolunteer(selectedItem._id, 'Active')}
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#1B5E20] text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Approve Registration
                  </button>
                  <button
                    onClick={() => handleProcessVolunteer(selectedItem._id, 'Inactive')}
                    disabled={submitting}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    <X size={14} /> Reject Registration
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

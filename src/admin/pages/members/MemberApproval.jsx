import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, XCircle, Search, Loader2, Users, FileText, Eye, X,
  ChevronLeft, ChevronRight, AlertCircle, User, Phone, Mail, Calendar,
  MapPin, Briefcase, CreditCard, Lock, ShieldCheck, Settings
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/admin/members`;

const MemberApproval = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `${API_BASE}?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setMembers(resData.data);
        setTotalCount(resData.pagination.total);
        setTotalPages(resData.pagination.totalPages);
      } else {
        toast.error(resData.message || 'Failed to fetch members');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter, toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleViewClick = (member) => {
    setViewingMember(member);
    setIsViewOpen(true);
    setActiveDropdownId(null);
  };

  const handleApprove = async (memberId) => {
    const member = members.find(m => m._id === memberId);
    if (!member?.email) {
      toast.error('Member must have an email address to approve. Please add email first.');
      return;
    }
    if (!window.confirm('Approve this member? They will be able to login to the portal.')) return;

    setApproving(true);
    try {
      const res = await fetch(`${API_BASE}/${memberId}/approve-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Member approved successfully');
        fetchMembers();
        setIsViewOpen(false);
      } else {
        toast.error(resData.message || 'Failed to approve member');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error approving member');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (memberId) => {
    if (!window.confirm('Reject this member? They will not be able to login.')) return;

    setRejecting(true);
    try {
      const res = await fetch(`${API_BASE}/${memberId}/reject-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Member rejected');
        fetchMembers();
        setIsViewOpen(false);
      } else {
        toast.error(resData.message || 'Failed to reject member');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error rejecting member');
    } finally {
      setRejecting(false);
    }
  };

  const handleDropdownToggle = (e, memberId) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === memberId ? null : memberId));
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const split = name.trim().split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return split[0][0].toUpperCase();
  };

  return (
    <Layout>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="text-[#1B5E20]" size={28} />
              Member Approval & Verification
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">Review and approve pending member registrations</p>
          </div>
        </div>

        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
          }}
        >
          <div className="mb-6 border-b border-gray-200 pb-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={16} className="text-[#1B5E20]" /> Pending Approvals ({totalCount})
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center min-w-[200px]">
                  <Search className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, mobile, email..."
                    className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading pending approvals...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Users size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Members to Review</p>
                <p className="text-xs text-gray-400 mt-1">All pending members have been processed</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Member ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Applied Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, idx) => (
                    <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="w-9 h-9 rounded-full bg-[#1B5E20]/10 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0 text-xs font-bold text-[#1B5E20]">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(member.fullName)
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-800 text-xs">{member.memberId}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-700 truncate max-w-[150px]">{member.fullName}</td>
                      <td className="px-4 py-3.5 text-gray-500 font-medium">{member.mobileNumber}</td>
                      <td className="px-4 py-3.5 text-gray-500 font-medium text-xs truncate max-w-[150px]">{member.email || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          member.status === 'Active' ? 'bg-green-100 text-green-700' :
                          member.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 font-semibold text-xs">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right relative">
                        <button
                          onClick={(e) => handleDropdownToggle(e, member._id)}
                          className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer shadow-sm text-gray-600 hover:text-green-700 active:scale-95 inline-flex items-center justify-center"
                          title="Actions Menu"
                        >
                          <Settings size={16} className={activeDropdownId === member._id ? 'animate-spin-slow text-[#1B5E20]' : ''} />
                        </button>

                        {activeDropdownId === member._id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-up"
                            style={{
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
                            }}
                          >
                            {/* View Profile */}
                            <button
                              onClick={() => {
                                handleViewClick(member);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:text-[#1B5E20] hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Eye size={14} className="text-gray-400" /> View Profile
                            </button>

                            {member.status === 'Pending' && (
                              <>
                                <div className="border-t border-gray-100 my-1"></div>

                                {/* Approve */}
                                <button
                                  onClick={() => {
                                    handleApprove(member._id);
                                    setActiveDropdownId(null);
                                  }}
                                  disabled={approving || !member.email}
                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-green-600 hover:bg-green-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckCircle size={14} className="text-green-400" /> Approve
                                </button>

                                {/* Reject */}
                                <button
                                  onClick={() => {
                                    handleReject(member._id);
                                    setActiveDropdownId(null);
                                  }}
                                  disabled={rejecting}
                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <XCircle size={14} className="text-red-400" /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-4">
                  <p className="text-xs text-gray-400 font-bold">
                    Showing Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* VIEW MEMBER DETAILS MODAL */}
        {isViewOpen && viewingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div
              className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setViewingMember(null);
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-gray-200 pb-5">
                <div className="w-20 h-20 rounded-full bg-[#1B5E20]/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-md text-2xl font-bold text-[#1B5E20] flex-shrink-0">
                  {viewingMember.photoUrl ? (
                    <img src={viewingMember.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(viewingMember.fullName)
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-[#1B5E20]/15 text-[#1B5E20]">
                    {viewingMember.memberId}
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-800 mt-1">{viewingMember.fullName}</h3>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    viewingMember.status === 'Active' ? 'bg-green-100 text-green-700' :
                    viewingMember.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {viewingMember.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User size={14} className="text-[#1B5E20]" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Mobile Number</span>
                      <span className="font-bold text-gray-800">{viewingMember.mobileNumber}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Email</span>
                      <span className="font-bold text-gray-800">{viewingMember.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Date of Birth</span>
                      <span className="font-bold text-gray-800">
                        {viewingMember.dateOfBirth ? new Date(viewingMember.dateOfBirth).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Gender</span>
                      <span className="font-bold text-gray-800">{viewingMember.gender || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#1B5E20]" /> Location Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50 text-xs">
                    <div className="sm:col-span-2">
                      <span className="text-xs text-gray-400 font-semibold block">Address</span>
                      <span className="font-bold text-gray-800 text-sm">{viewingMember.address || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">District</span>
                      <span className="font-bold text-gray-800 text-sm">{viewingMember.district || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">State</span>
                      <span className="font-bold text-gray-800 text-sm">{viewingMember.state || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">PIN Code</span>
                      <span className="font-bold text-gray-800 text-sm">{viewingMember.pinCode || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {viewingMember.status === 'Pending' && (
                  <>
                    {!viewingMember.email && (
                      <div className="text-xs text-red-600 font-semibold flex items-center gap-1">
                        ⚠ Email required to approve
                      </div>
                    )}
                    <button
                      onClick={() => handleReject(viewingMember._id)}
                      disabled={rejecting}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {rejecting ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(viewingMember._id)}
                      disabled={approving || !viewingMember.email}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-green-600 hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {approving ? 'Approving...' : 'Approve Member'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsViewOpen(false);
                    setViewingMember(null);
                  }}
                  className="px-6 py-2.5 rounded-xl transition-all font-bold text-xs text-white cursor-pointer hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#1B5E20' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MemberApproval;

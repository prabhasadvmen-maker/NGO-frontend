import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Edit2, Trash2, Loader2, Users, FileText, Eye, X,
  ChevronLeft, ChevronRight, AlertCircle, Settings, User, Phone, Mail,
  Calendar, MapPin, Briefcase, CreditCard, Lock, ShieldCheck, CheckCircle
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/admin/members`;

const MembersList = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);
  const [loggingInMemberId, setLoggingInMemberId] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `${API_BASE}?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${statusFilter}&membershipType=${typeFilter}`;
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
  }, [token, page, search, statusFilter, typeFilter, toast]);

  const fetchMembershipTypes = useCallback(async () => {
    if (!token) return;
    setLoadingTypes(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/membership-types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setMembershipTypes(resData.data);
      }
    } catch (err) {
      console.error('Error fetching membership types:', err);
    } finally {
      setLoadingTypes(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMembers();
    fetchMembershipTypes();
  }, [fetchMembers, fetchMembershipTypes]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleViewClick = (member) => {
    setViewingMember(member);
    setIsViewOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Delete this member? This action is irreversible.')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Member deleted successfully');
        fetchMembers();
      } else {
        toast.error(resData.message || 'Failed to delete member');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting member');
    }
  };

  const handleLoginAsMember = async (memberId) => {
    if (!token) {
      toast.error('Not authenticated');
      return;
    }

    setLoggingInMemberId(memberId);
    try {
      const res = await fetch(`${API_BASE}/${memberId}/login-as`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        const memberDashboardUrl = `https://savitramfoundation.org/member/dashboard?session=${data.token}`;
        window.open(memberDashboardUrl, '_blank');
        toast.success('Opening member portal...');
      } else {
        toast.error(data.message || 'Failed to generate login link');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error generating login link');
    } finally {
      setLoggingInMemberId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const split = name.trim().split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return split[0][0].toUpperCase();
  };

  const handleDropdownToggle = (e, memberId) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === memberId ? null : memberId));
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
              <Users className="text-[#1B5E20]" size={28} />
              Members Directory
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">View all registered members and manage their profiles</p>
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
                <FileText size={16} className="text-[#1B5E20]" /> All Members ({totalCount})
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center min-w-[200px]">
                  <Search className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, mobile, id..."
                    className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer"
                  disabled={loadingTypes}
                >
                  <option value="">All Types</option>
                  {membershipTypes.map(type => (
                    <option key={type._id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Users size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Members Found</p>
                <p className="text-xs text-gray-400 mt-1">Try modifying your filters or search queries</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Member ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joining Date</th>
                    <th className="px-4 py-3">Portal Login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200/50">
                          {member.membershipType}
                        </span>
                      </td>
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
                        {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        {member.email ? (
                          <button
                            onClick={() => handleLoginAsMember(member._id)}
                            disabled={loggingInMemberId === member._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-200/50 hover:bg-green-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loggingInMemberId === member._id ? 'Loading...' : 'Login'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No credentials</span>
                        )}
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
                            <button
                              onClick={() => {
                                handleViewClick(member);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:text-[#1B5E20] hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Eye size={14} className="text-gray-400" /> View Profile
                            </button>
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
                    <CreditCard size={14} className="text-[#1B5E20]" /> Membership Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Membership Type</span>
                      <span className="font-bold text-gray-800">{viewingMember.membershipType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Membership Fee</span>
                      <span className="font-bold text-gray-800">₹{viewingMember.membershipFee || 0}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Joining Date</span>
                      <span className="font-bold text-gray-800">
                        {viewingMember.joiningDate ? new Date(viewingMember.joiningDate).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Expiry Date</span>
                      <span className="font-bold text-gray-800">
                        {viewingMember.expiryDate ? new Date(viewingMember.expiryDate).toLocaleDateString('en-IN') : 'Lifetime'}
                      </span>
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

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewOpen(false);
                    setViewingMember(null);
                  }}
                  className="px-6 py-2.5 rounded-xl transition-all font-bold text-xs text-white cursor-pointer hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#1B5E20' }}
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MembersList;

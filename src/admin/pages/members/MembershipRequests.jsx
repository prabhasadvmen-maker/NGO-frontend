import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, CheckCircle, XCircle, Loader2, Users, FileText, Eye, X,
  ChevronLeft, ChevronRight, Clock, User, Phone, Mail, Calendar,
  MapPin, CreditCard, ShieldCheck, AlertCircle
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';

const API_BASE = 'http://localhost:5000/api/admin/members';

const MembershipRequests = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `${API_BASE}?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        const filteredRequests = resData.data.filter(m => m.requestedMembershipType);
        setRequests(filteredRequests);
        setTotalCount(filteredRequests.length);
        setTotalPages(Math.ceil(filteredRequests.length / 10));
      } else {
        toast.error(resData.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleViewClick = (request) => {
    setViewingRequest(request);
    setIsViewOpen(true);
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Approve this membership request?')) return;

    setApproving(true);
    try {
      const res = await fetch(`${API_BASE}/${requestId}/approve-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Request approved successfully');
        fetchRequests();
        setIsViewOpen(false);
      } else {
        toast.error(resData.message || 'Failed to approve request');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error approving request');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Reject this membership request?')) return;

    setRejecting(true);
    try {
      const res = await fetch(`${API_BASE}/${requestId}/reject-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Request rejected');
        fetchRequests();
        setIsViewOpen(false);
      } else {
        toast.error(resData.message || 'Failed to reject request');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error rejecting request');
    } finally {
      setRejecting(false);
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
              <Clock className="text-[#1B5E20]" size={28} />
              Membership Requests
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">Review and process membership upgrade and change requests</p>
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
                <FileText size={16} className="text-[#1B5E20]" /> Membership Requests ({totalCount})
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center min-w-[200px]">
                  <Search className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, member ID..."
                    className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading membership requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Requests Found</p>
                <p className="text-xs text-gray-400 mt-1">All membership requests have been processed</p>
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
                    <th className="px-4 py-3">Current Type</th>
                    <th className="px-4 py-3">Requested Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Request Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="w-9 h-9 rounded-full bg-[#1B5E20]/10 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0 text-xs font-bold text-[#1B5E20]">
                          {request.photoUrl ? (
                            <img src={request.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(request.fullName)
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-800 text-xs">{request.memberId}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-700 truncate max-w-[150px]">{request.fullName}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-600 border border-blue-200/50">
                          {request.currentMembershipType || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-600 border border-purple-200/50">
                          {request.requestedMembershipType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          request.requestStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                          request.requestStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {request.requestStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 font-semibold text-xs">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewClick(request)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer active:scale-95"
                          >
                            View
                          </button>
                          {request.requestStatus === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request._id)}
                                disabled={approving}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request._id)}
                                disabled={rejecting}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
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

        {/* VIEW REQUEST DETAILS MODAL */}
        {isViewOpen && viewingRequest && (
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
                  setViewingRequest(null);
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-gray-200 pb-5">
                <div className="w-20 h-20 rounded-full bg-[#1B5E20]/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-md text-2xl font-bold text-[#1B5E20] flex-shrink-0">
                  {viewingRequest.photoUrl ? (
                    <img src={viewingRequest.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(viewingRequest.fullName)
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-[#1B5E20]/15 text-[#1B5E20]">
                    {viewingRequest.memberId}
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-800 mt-1">{viewingRequest.fullName}</h3>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    viewingRequest.requestStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                    viewingRequest.requestStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {viewingRequest.requestStatus || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-[#1B5E20]" /> Membership Request Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Current Membership</span>
                      <span className="font-bold text-gray-800">{viewingRequest.currentMembershipType || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Requested Membership</span>
                      <span className="font-bold text-gray-800">{viewingRequest.requestedMembershipType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Request Date</span>
                      <span className="font-bold text-gray-800">
                        {viewingRequest.createdAt ? new Date(viewingRequest.createdAt).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Request Reason</span>
                      <span className="font-bold text-gray-800">{viewingRequest.requestReason || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User size={14} className="text-[#1B5E20]" /> Member Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Mobile Number</span>
                      <span className="font-bold text-gray-800">{viewingRequest.mobileNumber}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Email</span>
                      <span className="font-bold text-gray-800">{viewingRequest.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Joining Date</span>
                      <span className="font-bold text-gray-800">
                        {viewingRequest.joiningDate ? new Date(viewingRequest.joiningDate).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Current Status</span>
                      <span className={`font-bold text-xs ${viewingRequest.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {viewingRequest.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {viewingRequest.requestStatus === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleReject(viewingRequest._id)}
                      disabled={rejecting}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {rejecting ? 'Rejecting...' : 'Reject Request'}
                    </button>
                    <button
                      onClick={() => handleApprove(viewingRequest._id)}
                      disabled={approving}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-green-600 hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {approving ? 'Approving...' : 'Approve Request'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsViewOpen(false);
                    setViewingRequest(null);
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

export default MembershipRequests;

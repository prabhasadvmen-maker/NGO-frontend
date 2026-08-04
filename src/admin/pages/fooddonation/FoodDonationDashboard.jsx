import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Eye, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Phone,
  MapPin,
  Building2,
  Settings,
  User,
  Calendar,
  Truck,
  Copy,
  CheckCircle2,
  Image,
  Trash2,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../../shared/apiConfig';
import Layout from '../../components/Layout';

const getAuthToken = () => {
  return (
    localStorage.getItem('savitram_admin_token') ||
    localStorage.getItem('savitram_superadmin_token') ||
    localStorage.getItem('savitram_member_token') ||
    localStorage.getItem('token') ||
    ''
  );
};

const ActionDropdown = ({ item, onVerify, onAssign, onView, onDelete }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 flex items-center justify-center cursor-pointer shadow-xs"
        title="Actions"
      >
        <Settings size={16} className={`transition-transform duration-200 ${open ? 'rotate-90 text-emerald-700' : 'text-slate-600'}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 text-left">
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                onVerify(item);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer text-left"
            >
              <CheckCircle size={15} className="text-emerald-600" />
              <span>Verify Request</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onAssign(item);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer text-left"
            >
              <UserPlus size={15} className="text-purple-600" />
              <span>Assign Volunteer</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onView(item);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <Eye size={15} className="text-blue-600" />
              <span>View Details</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete(item);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
            >
              <Trash2 size={15} className="text-red-600" />
              <span>Delete Request</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function FoodDonationDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [assigningVolunteerId, setAssigningVolunteerId] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDonations = () => {
    setLoading(true);
    const token = getAuthToken();
    axios
      .get(`${API_BASE_URL}/api/admin/food-donations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter, priority: priorityFilter, search },
      })
      .then((res) => {
        if (res.data?.success) {
          setDonations(res.data.data.donations || []);
        }
      })
      .catch((err) => console.error('Error fetching admin donations:', err))
      .finally(() => setLoading(false));
  };

  const handleOpenViewModal = (item) => {
    setSelectedDonation(item);
    setLoadingDetails(true);
    setDetailData(null);
    const token = getAuthToken();
    axios
      .get(`${API_BASE_URL}/api/admin/food-donations/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success) {
          setDetailData(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching donation details:', err))
      .finally(() => setLoadingDetails(false));
  };

  const fetchVolunteers = () => {
    const token = getAuthToken();
    axios
      .get(`${API_BASE_URL}/api/admin/food-donations/volunteers/available`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success) {
          setVolunteers(res.data.data || []);
        }
      })
      .catch((err) => console.error('Error fetching volunteers:', err));
  };

  useEffect(() => {
    fetchDonations();
    fetchVolunteers();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleVerify = (action) => {
    if (!verifyModal) return;
    const token = getAuthToken();
    axios
      .put(
        `${API_BASE_URL}/api/admin/food-donations/${verifyModal._id}/verify`,
        { action, rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data?.success) {
          setVerifyModal(null);
          setRejectionReason('');
          fetchDonations();
        }
      })
      .catch((err) => alert(err.response?.data?.message || 'Verification failed'));
  };

  const handleAssignVolunteer = () => {
    if (!assignModal || !assigningVolunteerId) return;
    const token = getAuthToken();
    axios
      .put(
        `${API_BASE_URL}/api/admin/food-donations/${assignModal._id}/assign-volunteer`,
        { volunteerId: assigningVolunteerId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data?.success) {
          setAssignModal(null);
          setAssigningVolunteerId('');
          fetchDonations();
        }
      })
      .catch((err) => alert(err.response?.data?.message || 'Assignment failed'));
  };

  const handleDeleteDonation = () => {
    if (!deleteModal) return;
    setDeleting(true);
    const token = getAuthToken();
    axios
      .delete(`${API_BASE_URL}/api/admin/food-donations/${deleteModal._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success) {
          setDeleteModal(null);
          fetchDonations();
        }
      })
      .catch((err) => alert(err.response?.data?.message || 'Failed to delete donation'))
      .finally(() => setDeleting(false));
  };

  return (
    <Layout title="Food Donation | Admin Panel">
      <div className="p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Utensils className="text-emerald-600" />
              <span>Food Donation</span>
            </h1>
            <p className="text-xs text-slate-500">Monitor surplus food donations, verify requests, and dispatch volunteers.</p>
          </div>
          <div className="flex items-center gap-3 self-start">
            <a
              href="/volunteer/food-donation"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <ExternalLink size={14} />
              <span>Open Volunteer Portal ↗</span>
            </a>
            <button
              onClick={fetchDonations}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Refresh List</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search donor, ID, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending Verification</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Volunteer Assigned</option>
              <option value="Collected">Collected</option>
              <option value="Distributed">Distributed / Completed</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading food donations...</div>
          ) : donations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No food donations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 text-center w-12">SR NO.</th>
                    <th className="px-3 py-3">Tracking ID</th>
                    <th className="px-3 py-3">Donor & Org</th>
                    <th className="px-3 py-3">Food & Quantity</th>
                    <th className="px-3 py-3 max-w-[200px]">Pickup Location</th>
                    <th className="px-3 py-3 text-center">Priority</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3">Assigned Volunteer</th>
                    <th className="px-3 py-3 text-center w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {donations.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-3 font-black text-emerald-700 whitespace-nowrap">{item.donationId}</td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-slate-900">{item.donorName}</p>
                        <p className="text-[11px] text-slate-500">{item.organizationType} • {item.donorPhone}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-slate-900">{item.foodType}</p>
                        <p className="text-[11px] text-slate-500">{item.quantity}</p>
                      </td>
                      <td className="px-3 py-3 max-w-[220px]">
                        <p className="truncate font-semibold text-slate-800" title={`${item.pickupAddress}, ${item.city}`}>{item.pickupAddress}, {item.city}</p>
                        <p className="text-[10px] text-slate-400">Window: {item.pickupTimeWindow}</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.priority === 'Urgent'
                              ? 'bg-red-100 text-red-800'
                              : item.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'Verified'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : item.status === 'Completed' || item.status === 'Distributed'
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : item.status === 'Collected'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : item.status === 'Assigned'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : item.status === 'Rejected'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {item.assignedVolunteer ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.assignedVolunteer.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <ActionDropdown
                          item={item}
                          onVerify={setVerifyModal}
                          onAssign={setAssignModal}
                          onView={handleOpenViewModal}
                          onDelete={setDeleteModal}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification Modal */}
        {verifyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="font-bold text-slate-900 text-lg">Verify Food Donation: {verifyModal.donationId}</h3>
              <p className="text-xs text-slate-500">
                Donor: {verifyModal.donorName} ({verifyModal.donorPhone})
                <br />
                Food: {verifyModal.foodType} - {verifyModal.quantity}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                  Rejection Reason (If rejecting)
                </label>
                <textarea
                  rows="2"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Food prepared beyond safe shelf life limit"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setVerifyModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify('reject')}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleVerify('approve')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Approve & Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Volunteer Assignment Modal */}
        {assignModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="font-bold text-slate-900 text-lg">Assign Volunteer to Pickup</h3>
              <p className="text-xs text-slate-500">
                Donation: {assignModal.donationId} ({assignModal.city})
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                  Select Active Volunteer
                </label>
                <select
                  value={assigningVolunteerId}
                  onChange={(e) => setAssigningVolunteerId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Choose Active Volunteer --</option>
                  {volunteers.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.fullName} ({v.mobileNumber}) - {v.city || 'Lucknow'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setAssignModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignVolunteer}
                  disabled={!assigningVolunteerId}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Delete Food Donation</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Are you sure you want to delete tracking ID <strong className="text-slate-900">{deleteModal.donationId}</strong>? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDonation}
                  disabled={deleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details View Modal - Full Comprehensive Details */}
        {selectedDonation && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 md:p-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border border-slate-100">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900">{selectedDonation.donationId}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedDonation.donationId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-slate-400 hover:text-emerald-700 p-1 transition-colors cursor-pointer"
                      title="Copy Tracking ID"
                    >
                      {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Submitted on {new Date(selectedDonation.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      selectedDonation.status === 'Verified'
                        ? 'bg-emerald-600 text-white'
                        : selectedDonation.status === 'Completed' || selectedDonation.status === 'Distributed'
                        ? 'bg-emerald-800 text-white'
                        : selectedDonation.status === 'Assigned'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : selectedDonation.status === 'Rejected'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {selectedDonation.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDonation(null);
                      setDetailData(null);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {loadingDetails ? (
                <div className="py-12 text-center text-slate-400 font-medium">Loading full donation details...</div>
              ) : (
                <div className="space-y-6">
                  {/* Grid 1: Donor & Food Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Donor Information */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200/60 pb-2">
                        <User size={16} className="text-emerald-700" />
                        <span>Donor Details</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <p><strong className="text-slate-900">Name:</strong> {selectedDonation.donorName}</p>
                        <p><strong className="text-slate-900">Phone:</strong> {selectedDonation.donorPhone}</p>
                        <p><strong className="text-slate-900">Email:</strong> {selectedDonation.donorEmail}</p>
                        <p><strong className="text-slate-900">Org Category:</strong> {selectedDonation.organizationType} {selectedDonation.organizationName ? `(${selectedDonation.organizationName})` : ''}</p>
                      </div>
                    </div>

                    {/* Food Details */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200/60 pb-2">
                        <Utensils size={16} className="text-emerald-700" />
                        <span>Food Specifications</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <p><strong className="text-slate-900">Category:</strong> {selectedDonation.foodType}</p>
                        <p><strong className="text-slate-900">Quantity:</strong> {selectedDonation.quantity}</p>
                        <p><strong className="text-slate-900">Est. People Served:</strong> {selectedDonation.estimatedPeopleServed || 'N/A'}</p>
                        <p><strong className="text-slate-900">Event Type:</strong> {selectedDonation.eventType || 'N/A'}</p>
                        <p><strong className="text-slate-900">Prepared Time:</strong> {selectedDonation.preparedDateTime ? new Date(selectedDonation.preparedDateTime).toLocaleString() : 'N/A'}</p>
                        <p><strong className="text-slate-900">Shelf Life:</strong> {selectedDonation.shelfLifeHours} Hours</p>
                      </div>
                    </div>
                  </div>

                  {/* Food Items Description */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Detailed Food Description</p>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200/60">
                      {selectedDonation.foodItemsDescription || 'No additional item details provided.'}
                    </p>
                  </div>

                  {/* Pickup Address & Schedule */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200/60 pb-2">
                      <MapPin size={16} className="text-emerald-700" />
                      <span>Pickup Location & Schedule</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                      <div>
                        <strong className="text-slate-900 block mb-0.5">Address:</strong>
                        <p>{selectedDonation.pickupAddress}</p>
                        <p>{selectedDonation.city}, {selectedDonation.state} - {selectedDonation.pinCode}</p>
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-0.5">Pickup Time Window:</strong>
                        <p className="font-bold text-emerald-800">{selectedDonation.pickupTimeWindow}</p>
                        {selectedDonation.pickupInstructions && (
                          <p className="mt-1 text-slate-500">Instructions: {selectedDonation.pickupInstructions}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Volunteer & Operations Details */}
                  <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-900 uppercase tracking-wider border-b border-purple-200/60 pb-2">
                      <Truck size={16} className="text-purple-700" />
                      <span>Assigned Volunteer & Field Updates</span>
                    </div>
                    {selectedDonation.assignedVolunteer ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-purple-950">
                        <div>
                          <p><strong className="text-purple-900">Volunteer Name:</strong> {selectedDonation.assignedVolunteer.fullName}</p>
                          <p><strong className="text-purple-900">Mobile:</strong> {selectedDonation.assignedVolunteer.mobileNumber}</p>
                          <p><strong className="text-purple-900">Email:</strong> {selectedDonation.assignedVolunteer.email}</p>
                        </div>
                        <div>
                          <p><strong className="text-purple-900">Assigned Date:</strong> {selectedDonation.assignedAt ? new Date(selectedDonation.assignedAt).toLocaleString() : 'N/A'}</p>
                          <p><strong className="text-purple-900">Collected Date:</strong> {selectedDonation.collectedAt ? new Date(selectedDonation.collectedAt).toLocaleString() : 'Pending'}</p>
                          <p><strong className="text-purple-900">Distributed Date:</strong> {selectedDonation.distributedAt ? new Date(selectedDonation.distributedAt).toLocaleString() : 'Pending'}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-purple-700 font-semibold italic">No field volunteer assigned yet.</p>
                    )}
                  </div>

                  {/* Proof Photos Gallery */}
                  {detailData && (detailData.photoUrls?.length > 0 || detailData.collectionUrls?.length > 0 || detailData.distributionUrls?.length > 0) && (
                    <div className="space-y-4 pt-2">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Image size={16} className="text-emerald-700" />
                        <span>Verification & Proof Photos</span>
                      </p>

                      {/* Food Photos */}
                      {detailData.photoUrls?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-500 uppercase">Donor Uploaded Photos:</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {detailData.photoUrls.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-full h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform bg-slate-900">
                                <img src={url} alt={`Food photo ${i + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Collection Proof */}
                      {detailData.collectionUrls?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-500 uppercase">Volunteer Pickup Proof:</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {detailData.collectionUrls.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-full h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform bg-slate-900">
                                <img src={url} alt={`Collection proof ${i + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Distribution Proof */}
                      {detailData.distributionUrls?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-500 uppercase">Distribution Proof:</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {detailData.distributionUrls.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-full h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform bg-slate-900">
                                <img src={url} alt={`Distribution proof ${i + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audit History Timeline */}
                  {detailData?.history?.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Status Audit History</p>
                      <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 divide-y divide-slate-200/60">
                        {detailData.history.map((h, i) => (
                          <div key={i} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                            <div>
                              <span className="font-extrabold text-slate-900">{h.status}</span>
                              <span className="text-slate-500 ml-2">by {h.changedByRole || 'System'}</span>
                              {h.notes && <p className="text-slate-600 text-[11px] mt-0.5">{h.notes}</p>}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold">{new Date(h.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

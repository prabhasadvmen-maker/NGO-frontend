import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Upload, 
  Users, 
  Award,
  Truck,
  Sparkles,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../../Website/components/Navbar';
import Footer from '../../Website/components/Footer';
import SEOHead from '../../Website/components/SEOHead';
import axios from 'axios';
import API_BASE_URL from '../../shared/apiConfig';
import DonationCard from '../components/DonationCard';
import PhotoUpload from '../components/PhotoUpload';

const getAuthToken = () => {
  return (
    localStorage.getItem('savitram_volunteer_token') ||
    localStorage.getItem('savitram_admin_token') ||
    localStorage.getItem('savitram_superadmin_token') ||
    localStorage.getItem('savitram_member_token') ||
    localStorage.getItem('token') ||
    ''
  );
};

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my-assignments' | 'history'
  const [myAssignments, setMyAssignments] = useState([]);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('');

  // Modals
  const [viewDonation, setViewDonation] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'collect' | 'distribute', donation }
  const [proofPhotos, setProofPhotos] = useState([]);
  const [actualQuantity, setActualQuantity] = useState('');
  const [peopleServed, setPeopleServed] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAssignments = () => {
    const token = getAuthToken();
    axios
      .get(`${API_BASE_URL}/api/volunteer/food-donations/my-assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success) {
          setMyAssignments(res.data.data || []);
        }
      })
      .catch((err) => console.error('Error fetching assignments:', err));
  };

  const fetchAvailableDonations = () => {
    setLoading(true);
    const token = getAuthToken();
    axios
      .get(`${API_BASE_URL}/api/volunteer/food-donations/available`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { priority: priorityFilter, foodType: foodTypeFilter, search },
      })
      .then((res) => {
        if (res.data?.success) {
          setAvailableDonations(res.data.data || []);
        }
      })
      .catch((err) => console.error('Error fetching available donations:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssignments();
    fetchAvailableDonations();
  }, [priorityFilter, foodTypeFilter]);

  const handleAcceptAssignment = (donationId) => {
    setAcceptingId(donationId);
    const token = getAuthToken();
    axios
      .post(
        `${API_BASE_URL}/api/volunteer/food-donations/${donationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data?.success) {
          fetchAssignments();
          fetchAvailableDonations();
          setActiveTab('my-assignments');
        }
      })
      .catch((err) => alert(err.response?.data?.message || 'Failed to accept assignment'))
      .finally(() => setAcceptingId(null));
  };

  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (!actionModal) return;

    setSubmittingAction(true);
    const token = getAuthToken();
    const isCollect = actionModal.type === 'collect';
    const endpoint = isCollect
      ? `${API_BASE_URL}/api/volunteer/food-donations/${actionModal.donation._id}/collect`
      : `${API_BASE_URL}/api/volunteer/food-donations/${actionModal.donation._id}/distribute`;

    const payload = isCollect
      ? {
          collectionProofPhotos: proofPhotos,
          actualQuantityCollected: actualQuantity || actionModal.donation.quantity,
          collectionNotes: actionNotes,
        }
      : {
          distributionProofPhotos: proofPhotos,
          actualPeopleServed: Number(peopleServed) || actionModal.donation.estimatedPeopleServed || 25,
          distributionNotes: actionNotes,
        };

    axios
      .put(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data?.success) {
          setActionModal(null);
          setProofPhotos([]);
          setActualQuantity('');
          setPeopleServed('');
          setActionNotes('');
          fetchAssignments();
          fetchAvailableDonations();
        }
      })
      .catch((err) => alert(err.response?.data?.message || 'Update failed'))
      .finally(() => setSubmittingAction(false));
  };

  const activeAssignments = myAssignments.filter((a) => a.status === 'Assigned' || a.status === 'Collected');
  const completedAssignments = myAssignments.filter((a) => a.status === 'Completed' || a.status === 'Distributed');
  const totalBeneficiariesFed = completedAssignments.reduce((acc, curr) => acc + (curr.actualPeopleServed || curr.estimatedPeopleServed || 20), 0);
  const totalHours = (completedAssignments.length * 1.5).toFixed(1);

  const filteredAvailable = availableDonations.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      item.donorName?.toLowerCase().includes(term) ||
      item.city?.toLowerCase().includes(term) ||
      item.donationId?.toLowerCase().includes(term) ||
      item.foodType?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      <SEOHead
        title="Food Donation | Volunteer Portal"
        description="Volunteer dashboard for food rescue missions, pickup assignment tracking, and beneficiary distribution."
      />
      <Navbar />

      <main className="flex-grow pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Header Banner Card */}
        <div className="bg-gradient-to-r from-[#0A1628] via-[#11223F] to-[#1B5E20] text-white rounded-2xl p-4 md:p-5 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                <Truck size={12} />
                <span>Food Rescue Volunteer Portal</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Food Donation</h1>
              <p className="text-xs text-slate-300 font-medium leading-normal">
                Accept surplus food rescue requests, collect fresh meals from donors, and deliver directly to community beneficiaries.
              </p>
            </div>

            <button
              onClick={() => {
                fetchAssignments();
                fetchAvailableDonations();
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer shadow-xs self-start md:self-auto shrink-0"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Portal</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Utensils size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rescues Done</p>
              <p className="text-2xl font-black text-slate-900">{completedAssignments.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">People Fed</p>
              <p className="text-2xl font-black text-slate-900">{totalBeneficiariesFed}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Tasks</p>
              <p className="text-2xl font-black text-amber-800">{activeAssignments.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Award size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Impact Hours</p>
              <p className="text-2xl font-black text-purple-700">{totalHours} <span className="text-xs text-slate-400">hrs</span></p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'available'
                ? 'bg-white text-[#1B5E20] shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Utensils size={16} />
            <span>Available Requests</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'available' ? 'bg-emerald-100 text-[#1B5E20]' : 'bg-slate-300 text-slate-700'
            }`}>
              {filteredAvailable.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my-assignments')}
            className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'my-assignments'
                ? 'bg-white text-[#1B5E20] shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Truck size={16} />
            <span>My Active Assignments</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'my-assignments' ? 'bg-purple-100 text-purple-800' : 'bg-slate-300 text-slate-700'
            }`}>
              {activeAssignments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-white text-[#1B5E20] shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>Completed History</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'history' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
            }`}>
              {completedAssignments.length}
            </span>
          </button>
        </div>

        {/* Filters & Search (Visible on Available tab) */}
        {activeTab === 'available' && (
          <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search donor, city, or ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#1B5E20]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="Urgent">Urgent Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
              </select>

              <select
                value={foodTypeFilter}
                onChange={(e) => setFoodTypeFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
              >
                <option value="">All Food Types</option>
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Groceries">Groceries / Ration</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 1: AVAILABLE PICKUP REQUESTS */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-3">
                <RefreshCw size={28} className="animate-spin text-[#1B5E20] mx-auto" />
                <p className="font-bold text-sm">Loading available food rescue requests...</p>
              </div>
            ) : filteredAvailable.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-3">
                <Utensils size={40} className="text-slate-300 mx-auto" />
                <p className="font-extrabold text-base text-slate-800">No Available Pickup Requests Right Now</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All current surplus food donations are assigned. New food donations submitted by donors will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAvailable.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    onAccept={handleAcceptAssignment}
                    onViewDetails={setViewDonation}
                    acceptingId={acceptingId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY ACTIVE ASSIGNMENTS */}
        {activeTab === 'my-assignments' && (
          <div className="space-y-6">
            {activeAssignments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-3">
                <Truck size={40} className="text-slate-300 mx-auto" />
                <p className="font-extrabold text-base text-slate-800">No Active Assignments</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You don't have any active food pickup assignments. Switch to "Available Requests" to accept food rescue tasks.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAssignments.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    onCollect={(item) => {
                      setActionModal({ type: 'collect', donation: item });
                      setProofPhotos([]);
                    }}
                    onDistribute={(item) => {
                      setActionModal({ type: 'distribute', donation: item });
                      setProofPhotos([]);
                    }}
                    onViewDetails={setViewDonation}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPLETED HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {completedAssignments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-3">
                <CheckCircle2 size={40} className="text-slate-300 mx-auto" />
                <p className="font-extrabold text-base text-slate-800">No Completed Missions Yet</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Complete food pickup & beneficiary distribution tasks to build your verified impact log.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAssignments.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    onViewDetails={setViewDonation}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* VIEW DETAILS MODAL */}
      {viewDonation && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xl font-black text-slate-900">{viewDonation.donationId}</span>
                <p className="text-xs text-slate-500 font-semibold">{viewDonation.foodType} • {viewDonation.city}</p>
              </div>
              <button
                onClick={() => setViewDonation(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Donor Information</p>
                <p className="text-slate-700 font-bold">{viewDonation.donorName} ({viewDonation.organizationType || 'Donor'})</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  <a href={`tel:${viewDonation.donorPhone}`} className="text-emerald-700 font-bold underline">
                    {viewDonation.donorPhone}
                  </a>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Pickup Location & Window</p>
                <p className="text-slate-700 font-medium">{viewDonation.pickupAddress}, {viewDonation.city}, {viewDonation.state} - {viewDonation.pinCode}</p>
                <p className="text-emerald-800 font-bold">Window: {viewDonation.pickupTimeWindow}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Food Specifications</p>
                <p className="text-slate-700 font-bold">{viewDonation.foodType} • Quantity: {viewDonation.quantity}</p>
                <p className="text-slate-600">{viewDonation.foodItemsDescription || 'No detailed description provided.'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewDonation(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION WORKFLOW MODAL (COLLECT / DISTRIBUTE) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {actionModal.type === 'collect' ? 'Record Pickup Collection' : 'Record Beneficiary Distribution'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">ID: {actionModal.donation.donationId}</p>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              <PhotoUpload
                photos={proofPhotos}
                onChange={setProofPhotos}
                label={actionModal.type === 'collect' ? 'Upload Collection Photo Proof' : 'Upload Beneficiary Distribution Photo Proof'}
              />

              {actionModal.type === 'collect' ? (
                <div className="space-y-1.5">
                  <label className="block font-black text-slate-900 uppercase tracking-wider">
                    Actual Quantity Collected
                  </label>
                  <input
                    type="text"
                    value={actualQuantity}
                    onChange={(e) => setActualQuantity(e.target.value)}
                    placeholder={`Original quantity: ${actionModal.donation.quantity}`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-[#1B5E20]"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block font-black text-slate-900 uppercase tracking-wider">
                    Actual Beneficiaries Served
                  </label>
                  <input
                    type="number"
                    value={peopleServed}
                    onChange={(e) => setPeopleServed(e.target.value)}
                    placeholder={`Estimated: ${actionModal.donation.estimatedPeopleServed || 25} people`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-[#1B5E20]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-black text-slate-900 uppercase tracking-wider">
                  Field Notes / Status Remarks
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Enter any additional field notes or delivery status..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-black cursor-pointer disabled:opacity-50"
                >
                  {submittingAction ? 'Saving...' : actionModal.type === 'collect' ? 'Confirm Collection' : 'Confirm Distribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

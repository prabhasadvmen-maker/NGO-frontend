import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  HandHeart, DollarSign, Calendar, Filter, Plus, Pencil, Trash2, Eye,
  Loader2, Search, X, Check, FileText, Printer, Building2, User, Settings, Phone, Mail
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/superadmin/donations`;
const BRANCH_API = `${API_BASE_URL}/api/superadmin/branches`;

const ActionMenu = ({ donation, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(p => !p)} 
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
        title="Actions"
      >
        <Settings size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button 
            onClick={() => { onView(donation); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-55 transition-colors cursor-pointer text-left"
          >
            <Eye size={14} className="text-blue-500" /> View Receipt
          </button>
          <button 
            onClick={() => { onEdit(donation); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-55 transition-colors cursor-pointer text-left"
          >
            <Pencil size={14} className="text-green-600" /> Edit Record
          </button>
          <div className="border-t border-gray-100" />
          <button 
            onClick={() => { onDelete(donation._id); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <Trash2 size={14} /> Delete Record
          </button>
        </div>
      )}
    </div>
  );
};

const Donations = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [donations, setDonations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    totalAmount: 0,
    methodBreakdown: [],
    purposeBreakdown: [],
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDonation, setViewingDonation] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    donorName: 'Anonymous',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    transactionId: '',
    purpose: 'General',
    branch: '',
    notes: '',
    donationDate: new Date().toISOString().split('T')[0]
  });

  // Fetch branches for selection
  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(BRANCH_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBranches(data.data.filter(b => b.isActive));
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [token]);

  // Fetch donations with pagination and filters
  const fetchDonations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&paymentStatus=${filterStatus}` : '';
      const methodParam = filterMethod ? `&paymentMethod=${filterMethod}` : '';
      const purposeParam = filterPurpose ? `&purpose=${encodeURIComponent(filterPurpose)}` : '';
      const branchParam = filterBranch ? `&branch=${filterBranch}` : '';
      const startParam = startDate ? `&startDate=${startDate}` : '';
      const endParam = endDate ? `&endDate=${endDate}` : '';
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${methodParam}${purposeParam}${branchParam}${startParam}${endParam}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      } else {
        toast.error(data.message || 'Failed to fetch donations');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error fetching donations');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, filterMethod, filterPurpose, filterBranch, startDate, endDate, toast]);

  // Fetch stats summary
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, [fetchDonations, fetchStats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      donorName: 'Anonymous',
      donorEmail: '',
      donorPhone: '',
      amount: '',
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      transactionId: '',
      purpose: 'General',
      branch: '',
      notes: '',
      donationDate: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (donation) => {
    setFormData({
      donorName: donation.donorName || 'Anonymous',
      donorEmail: donation.donorEmail || '',
      donorPhone: donation.donorPhone || '',
      amount: donation.amount || '',
      paymentMethod: donation.paymentMethod || 'cash',
      paymentStatus: donation.paymentStatus || 'completed',
      transactionId: donation.transactionId || '',
      purpose: donation.purpose || 'General',
      branch: donation.branch?._id || donation.branch || '',
      notes: donation.notes || '',
      donationDate: donation.donationDate ? new Date(donation.donationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditingId(donation._id);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (donation) => {
    setViewingDonation(donation);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Donation saved successfully');
        setIsModalOpen(false);
        resetForm();
        fetchDonations();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to save donation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving donation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation record?')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Donation deleted successfully');
        fetchDonations();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete donation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting donation');
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Receipt - ${viewingDonation?.receiptNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body onload="window.print();window.close()">
          <div class="max-w-3xl mx-auto border p-8 rounded-lg mt-10 bg-white">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getPurposeLabel = (purpose) => {
    switch (purpose) {
      case 'General': return 'General NGO Fund';
      case 'Education': return 'Education & Literacy Campaign';
      case 'Medical': return 'Medical Aid & Healthcare';
      case 'Disaster Relief': return 'Disaster Relief Fund';
      default: return purpose;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <HandHeart className="text-[#1B5E20]" size={28} />
              Donations Management
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage and track organization-wide donation records</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Plus size={18} />
            Record Donation
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Collected', value: `₹${stats.totalAmount.toLocaleString('en-IN')}`, color: COLORS.primary, sub: 'Completed donations' },
            { label: 'Transactions Count', value: stats.totalCount, color: '#2196F3', sub: 'All payment methods' },
            { label: 'Completed Status', value: stats.completedCount, color: COLORS.success, sub: 'Verified receipts' },
            { label: 'Pending Approvals', value: stats.pendingCount, color: COLORS.warning, sub: 'Cheques / bank transfers' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 flex items-center gap-4 bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                <DollarSign size={22} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-800 leading-tight">{card.value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{card.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Panel */}
        <div 
          className="rounded-2xl p-5 bg-white space-y-4" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Filter size={16} className="text-gray-500" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, receipt, txn ID..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Method</label>
              <select
                value={filterMethod}
                onChange={(e) => { setFilterMethod(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="online">Online Payment</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Purpose</label>
              <select
                value={filterPurpose}
                onChange={(e) => { setFilterPurpose(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
              >
                <option value="">All Purposes</option>
                <option value="General">General Fund</option>
                <option value="Education">Education</option>
                <option value="Medical">Medical Aid</option>
                <option value="Disaster Relief">Disaster Relief</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">NGO Branch</label>
              <select
                value={filterBranch}
                onChange={(e) => { setFilterBranch(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
            </div>
          </div>
        </div>

        {/* List Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-gray-50/40">
            <h3 className="font-bold text-gray-800">Donation Transactions</h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-green-50 text-green-700">
              Page {page} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No donations match filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Receipt No', 'Donor', 'Contact Info', 'Branch', 'Purpose', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-3.5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation, idx) => (
                    <tr key={donation._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      
                      {/* Sr No */}
                      <td className="px-2.5 py-3 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                      
                      {/* Receipt No */}
                      <td className="px-3.5 py-3 font-bold text-gray-700">{donation.receiptNumber}</td>
                      
                      {/* Donor */}
                      <td className="px-3.5 py-3">
                        <div>
                          <p className="font-bold text-gray-800 leading-tight">{donation.donorName}</p>
                          <p className="text-[10px] text-gray-500 font-semibold capitalize">{donation.paymentMethod.replace('_', ' ')} Method</p>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-3.5 py-3">
                        <div className="space-y-0.5">
                          {donation.donorPhone ? (
                            <p className="text-gray-700 font-semibold text-xs flex items-center gap-1">
                              <Phone size={11} className="text-gray-500" /> {donation.donorPhone}
                            </p>
                          ) : (
                            <p className="text-gray-400 text-xs italic">No Phone</p>
                          )}
                          {donation.donorEmail ? (
                            <p className="text-gray-500 text-[11px] flex items-center gap-1 max-w-[150px] truncate animate-none" title={donation.donorEmail}>
                              <Mail size={11} className="text-gray-400" /> {donation.donorEmail}
                            </p>
                          ) : (
                            <p className="text-gray-400 text-[10px] italic">No Email</p>
                          )}
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="px-3.5 py-3">
                        {donation.branch ? (
                          <div>
                            <p className="font-bold text-gray-700">{donation.branch.name}</p>
                            <p className="text-[10px] text-gray-500 font-semibold">Code: {donation.branch.code}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Unassigned</span>
                        )}
                      </td>

                      {/* Purpose */}
                      <td className="px-3.5 py-3">
                        <div>
                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-green-50 text-green-700 border border-green-100">
                            {donation.purpose}
                          </span>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1">Ref: {donation.transactionId || 'N/A'}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-3.5 py-3 font-black text-gray-800 text-sm">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          donation.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                          donation.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {donation.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3">
                        <ActionMenu 
                          donation={donation}
                          onView={handleOpenViewModal}
                          onEdit={handleOpenEditModal}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-55 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500 font-bold">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-55 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record / Edit Donation Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800">
                {editingId ? 'Edit Donation Record' : 'Record New Donation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Donor Name</label>
                  <input
                    type="text"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Donor Email</label>
                    <input
                      type="email"
                      name="donorEmail"
                      value={formData.donorEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Donor Phone</label>
                    <input
                      type="text"
                      name="donorPhone"
                      value={formData.donorPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Amount (INR)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Donation Date</label>
                    <input
                      type="date"
                      name="donationDate"
                      value={formData.donationDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online Payment</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Payment Status</label>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Purpose</label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="General">General Fund</option>
                      <option value="Education">Education</option>
                      <option value="Medical">Medical Aid</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">NGO Branch</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="">No Branch Association</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Transaction ID / Reference</label>
                  <input
                    type="text"
                    name="transactionId"
                    placeholder="e.g., UPI, Cheque number, Bank transfer reference"
                    value={formData.transactionId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Notes / Remarks</label>
                  <textarea
                    name="notes"
                    rows="2"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer transition-colors bg-white hover:bg-gray-55"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Update Record' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Invoice Receipt Detail Modal */}
      {isViewModalOpen && viewingDonation && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-green-700" />
                Donation Receipt
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-0 bg-green-800 text-white font-bold text-xs cursor-pointer hover:bg-green-700 transition-colors"
                >
                  <Printer size={14} />
                  Print Receipt
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Scrollable Wrapper */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {/* Printable Area */}
              <div id="receipt-print-area" className="p-6 bg-white border border-gray-200 rounded-xl space-y-8 font-sans">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src="/NGO logo.jpeg" alt="NGO Logo" className="h-14 w-14 rounded-full object-cover border" />
                    <div>
                      <h2 className="text-xl font-extrabold text-green-950 tracking-wide uppercase">SAVITRAM FOUNDATION</h2>
                      <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Regd No. ADV/2024/99124</p>
                      <p className="text-xs text-gray-500 font-medium">Helping hands for a better society</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded bg-green-50 text-green-800 text-xs font-black uppercase tracking-wider border border-green-100">
                      TAX EXEMPTED
                    </span>
                    <p className="text-xs text-gray-400 mt-2 font-bold font-mono">Receipt: {viewingDonation.receiptNumber}</p>
                    <p className="text-xs text-gray-400 font-bold font-mono">
                      Date: {new Date(viewingDonation.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-1">Donation Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Received from (Donor)</span>
                      <span className="font-extrabold text-gray-800 block text-base">{viewingDonation.donorName}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Donation Amount</span>
                      <span className="font-black text-green-800 text-lg block">₹{viewingDonation.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Payment Mode</span>
                      <span className="font-semibold text-gray-700 capitalize block">{viewingDonation.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Payment Status</span>
                      <span className="font-bold text-gray-700 block uppercase">{viewingDonation.paymentStatus}</span>
                    </div>
                    {viewingDonation.transactionId && (
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block">Txn Reference ID</span>
                        <span className="font-mono text-gray-600 block text-xs">{viewingDonation.transactionId}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Campaign / Purpose</span>
                      <span className="font-semibold text-gray-700 block">{getPurposeLabel(viewingDonation.purpose)}</span>
                    </div>
                    {viewingDonation.branch && (
                      <div className="col-span-2">
                        <span className="text-xs font-bold text-gray-400 uppercase block">Assigned Branch</span>
                        <span className="font-semibold text-gray-700 block">
                          {viewingDonation.branch.name} ({viewingDonation.branch.code})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {viewingDonation.notes && (
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 italic">
                    <strong>Notes:</strong> {viewingDonation.notes}
                  </div>
                )}

                <div className="flex justify-between items-end pt-10">
                  <div className="text-xs text-gray-400 font-medium">
                    <p>All donations are tax exempted under Section 80G.</p>
                    <p>Thank you for your generous contribution.</p>
                  </div>
                  <div className="text-center w-40 flex flex-col items-center">
                    <div className="h-10 w-24 flex items-center justify-center opacity-70 border-b border-gray-300 border-dashed text-[10px] text-gray-400 font-mono">
                      Signed Electronically
                    </div>
                    <span className="text-xs font-bold text-gray-500 mt-2 block uppercase tracking-wider">Authorized Officer</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
};

export default Donations;

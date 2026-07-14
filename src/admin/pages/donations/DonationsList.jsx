import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  HandHeart, DollarSign, Plus, Pencil, Trash2, Eye,
  Loader2, Search, X, Check, FileText, Printer, Settings, Phone, Mail, User
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/donations`;

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
    <div className="relative inline-block text-left" ref={ref}>
      <button 
        onClick={() => setOpen(p => !p)} 
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent" 
        title="Actions"
      >
        <Settings size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-150 bg-white shadow-lg z-10 overflow-hidden text-left">
          <button 
            onClick={() => { onView(donation); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-0 bg-transparent text-left font-semibold"
          >
            <Eye size={14} className="text-blue-500" /> View Receipt
          </button>
          <button 
            onClick={() => { onEdit(donation); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-0 bg-transparent text-left font-semibold"
          >
            <Pencil size={14} className="text-green-600" /> Edit Record
          </button>
          <div className="border-t border-gray-100" />
          <button 
            onClick={() => { onDelete(donation._id); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent text-left font-semibold"
          >
            <Trash2 size={14} /> Delete Record
          </button>
        </div>
      )}
    </div>
  );
};

const DonationsList = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    totalAmount: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('');
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

  const fetchDonations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&paymentStatus=${filterStatus}` : '';
      const methodParam = filterMethod ? `&paymentMethod=${filterMethod}` : '';
      const purposeParam = filterPurpose ? `&purpose=${encodeURIComponent(filterPurpose)}` : '';
      const startParam = startDate ? `&startDate=${startDate}` : '';
      const endParam = endDate ? `&endDate=${endDate}` : '';
      
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${methodParam}${purposeParam}${startParam}${endParam}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, filterMethod, filterPurpose, startDate, endDate, toast]);

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
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, [fetchDonations, fetchStats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'paymentMethod' && value === 'cash') {
        next.transactionId = '';
      }
      return next;
    });
  };

  const resetForm = () => {
    const userBranchId = typeof user?.branch === 'object' ? user.branch._id : user?.branch;
    setFormData({
      donorName: 'Anonymous',
      donorEmail: '',
      donorPhone: '',
      amount: '',
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      transactionId: '',
      purpose: 'General',
      branch: userBranchId || '',
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
      toast.error('Amount must be positive');
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
    if (!window.confirm('Delete this donation record?')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Donation deleted');
        fetchDonations();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
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

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <HandHeart className="text-[#1B5E20]" size={28} />
              Recorded Donations
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">Manage and audit donations you recorded</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold transition-all transform hover:opacity-95 active:scale-[0.99] cursor-pointer shadow-sm bg-[#1B5E20] border-0 text-xs"
          >
            <Plus size={14} />
            Record Donation
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            { label: 'Your Collections', value: `₹${stats.totalAmount.toLocaleString('en-IN')}`, color: '#1B5E20', sub: 'Total amount collected' },
            { label: 'Transactions Count', value: stats.totalCount, color: '#2196F3', sub: 'All recorded payments' },
            { label: 'Verified Completed', value: stats.completedCount, color: '#4CAF50', sub: 'Cleared receipts' },
            { label: 'Awaiting Verification', value: stats.pendingCount, color: '#FF9800', sub: 'Awaiting clear' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-3xl p-5 bg-white flex items-center gap-4 transition-all duration-300 hover:scale-[1.01] border border-gray-100 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}10` }}>
                <DollarSign size={20} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-xl font-black text-gray-800 leading-tight">{card.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{card.label}</p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-3xl p-5 bg-white border border-gray-100 shadow-sm space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Search</label>
              <input
                type="text"
                placeholder="Donor details, receipt..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none border border-gray-250 focus:border-green-500 transition-colors bg-gray-50/50 font-semibold text-gray-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer font-semibold text-gray-600"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</label>
              <select
                value={filterMethod}
                onChange={(e) => { setFilterMethod(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer font-semibold text-gray-600"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Purpose</label>
              <select
                value={filterPurpose}
                onChange={(e) => { setFilterPurpose(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer font-semibold text-gray-600"
              >
                <option value="">All Purposes</option>
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Medical">Medical Aid</option>
                <option value="Disaster Relief">Disaster Relief</option>
              </select>
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm text-left">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold text-xs uppercase tracking-wider">No donations recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 border-gray-150">
                    {['#', 'Receipt No', 'Donor', 'Contact Info', 'Branch', 'Purpose', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-450">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-650">
                  {donations.map((donation, idx) => (
                    <tr key={donation._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-4 text-gray-400 font-bold">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-5 py-4 font-bold text-gray-800">{donation.receiptNumber}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-extrabold text-gray-800 leading-tight">{donation.donorName}</p>
                          <p className="text-[9px] text-gray-400 font-bold capitalize mt-0.5">{donation.paymentMethod.replace('_', ' ')}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {donation.donorPhone ? (
                            <p className="text-gray-700 font-bold text-xs flex items-center gap-1">
                              <Phone size={11} className="text-gray-400" /> {donation.donorPhone}
                            </p>
                          ) : (
                            <p className="text-gray-400 italic">No Phone</p>
                          )}
                          {donation.donorEmail ? (
                            <p className="text-gray-400 text-[10px] flex items-center gap-1 max-w-[150px] truncate" title={donation.donorEmail}>
                              <Mail size={11} className="text-gray-300" /> {donation.donorEmail}
                            </p>
                          ) : (
                            <p className="text-gray-450 text-[9px] italic">No Email</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-extrabold text-gray-850">{donation.branch?.name || 'Local Branch'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-green-50 text-green-700 border border-green-150">
                          {donation.purpose}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-gray-800 text-sm">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          donation.paymentStatus === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {donation.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
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

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-xl cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-xl cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record/Edit Donation Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-800">
                {editingId ? 'Edit Donation Record' : 'Record New Donation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-8 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">Donor Name</label>
                  <input
                    type="text"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">Donor Email</label>
                    <input
                      type="email"
                      name="donorEmail"
                      value={formData.donorEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">Donor Phone</label>
                    <input
                      type="text"
                      name="donorPhone"
                      value={formData.donorPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">Amount (INR)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">Donation Date</label>
                    <input
                      type="date"
                      name="donationDate"
                      value={formData.donationDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer font-semibold text-gray-600"
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online Payment</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">Status</label>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer font-semibold text-gray-600"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">Purpose</label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer font-semibold text-gray-600"
                    >
                      <option value="General">General Fund</option>
                      <option value="Education">Education</option>
                      <option value="Medical">Medical Aid</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">NGO Branch Association</label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={user?.branch?.name || 'Central Head Office'}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>

                {formData.paymentMethod !== 'cash' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      {formData.paymentMethod === 'cheque' 
                        ? 'Cheque Number / Reference *' 
                        : formData.paymentMethod === 'bank_transfer'
                        ? 'Bank Reference / UTR Number *'
                        : 'Transaction ID / Online Ref ID *'}
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      required
                      placeholder={
                        formData.paymentMethod === 'cheque'
                          ? 'Enter 6-digit cheque number'
                          : 'Enter transfer transaction reference ID'
                      }
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-255 focus:border-green-500 transition-colors bg-gray-50/50 font-semibold"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md flex items-center justify-center gap-2 bg-[#1B5E20] hover:opacity-95"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Viewing Receipt */}
      {isViewModalOpen && viewingDonation && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-green-700" />
                Donation Details
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-0 bg-green-800 text-white font-bold text-xs cursor-pointer hover:bg-green-700 transition-colors"
                >
                  <Printer size={14} />
                  Print
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Scrollable Wrapper */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div id="receipt-print-area" className="p-6 bg-white border border-gray-200 rounded-xl space-y-8 text-left">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src="/NGO logo.jpeg" alt="NGO Logo" className="h-12 w-12 rounded-full object-cover border" />
                    <div>
                      <h2 className="text-sm font-extrabold text-green-950 tracking-wide uppercase">ADVMEN NGO</h2>
                      <p className="text-[9px] text-gray-400 font-semibold tracking-wider">Regd No. ADV/2024/99124</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded bg-green-50 text-green-800 text-[10px] font-black uppercase tracking-wider border border-green-100">
                      TAX EXEMPTED
                    </span>
                    <p className="text-[10px] text-gray-450 mt-2 font-mono font-bold">Receipt: {viewingDonation.receiptNumber}</p>
                    <p className="text-[10px] text-gray-450 font-mono font-bold">
                      Date: {new Date(viewingDonation.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-4 text-xs font-semibold text-gray-700">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Received from (Donor)</span>
                    <span className="font-extrabold text-gray-800 block text-sm">{viewingDonation.donorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Donation Amount</span>
                    <span className="font-black text-green-800 text-base block">₹{viewingDonation.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment Mode</span>
                    <span className="font-semibold text-gray-700 capitalize block">{viewingDonation.paymentMethod}</span>
                  </div>
                  {viewingDonation.transactionId && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Transaction Reference ID</span>
                      <span className="font-mono text-gray-650 block text-[11px]">{viewingDonation.transactionId}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Assigned Branch</span>
                    <span className="font-bold text-gray-800 block">
                      {viewingDonation.branch?.name || user?.branch?.name || 'Central Head Office'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-10">
                  <div className="text-[10px] text-gray-400 font-medium">
                    <p>All donations are tax exempted under Section 80G.</p>
                    <p>Thank you for your generous contribution.</p>
                  </div>
                  <div className="text-center w-40 flex flex-col items-center">
                    <div className="h-10 w-24 flex items-center justify-center opacity-70 border-b border-gray-300 border-dashed text-[10px] text-gray-400 font-mono">
                      Signed Electronically
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 mt-2 block uppercase tracking-wider">Authorized Officer</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
};

export default DonationsList;

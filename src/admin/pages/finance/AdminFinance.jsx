import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Wallet, IndianRupee, ArrowUpRight, ArrowDownRight, Plus, Eye,
  Trash2, X, Search, Filter, Loader2, Calendar, FileText, CheckCircle2, ShieldCheck, Settings, Printer, Pencil
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const DONATION_API = `${API_BASE_URL}/api/admin/donations`;
const EXPENSE_API = `${API_BASE_URL}/api/admin/expenses`;
const BRANCH_API = `${API_BASE_URL}/api/branches`;

const AdminFinance = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Local state for active tab selection ('donations' default as shown in screenshot)
  const [activeTab, setActiveTab] = useState('donations'); // 'ledger', 'donations', 'expenses'

  // States
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    pendingExpensesCount: 0
  });

  const [ledger, setLedger] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [myBranches, setMyBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals state
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Detail View & Edit target records
  const [viewingDonation, setViewingDonation] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [editingDonation, setEditingDonation] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Forms state
  const [donationForm, setDonationForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    purpose: 'Branch Donation',
    branch: '',
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Others',
    paymentMethod: 'cash',
    branch: '',
    notes: ''
  });

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDropdownToggle = (e, id) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === id ? null : id));
  };

  const fetchMyBranches = useCallback(async () => {
    try {
      const res = await fetch(BRANCH_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyBranches(data.data || []);
        if (data.data && data.data.length > 0) {
          setDonationForm(p => ({ ...p, branch: data.data[0]._id }));
          setExpenseForm(p => ({ ...p, branch: data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const [donStatsRes, expStatsRes] = await Promise.all([
        fetch(`${DONATION_API}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${EXPENSE_API}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const donStats = await donStatsRes.json();
      const expStats = await expStatsRes.json();

      const income = donStats.success ? donStats.data.totalAmount : 0;
      const spent = expStats.success ? expStats.data.totalAmount : 0;

      setStats({
        totalIncome: income,
        totalExpenses: spent,
        netBalance: income - spent,
        pendingExpensesCount: expStats.success ? expStats.data.pendingCount : 0
      });
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const categoryParam = filterCategory ? `&category=${filterCategory}` : '';
      const statusParam = filterStatus ? `&paymentStatus=${filterStatus}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';

      if (activeTab === 'donations') {
        const res = await fetch(`${DONATION_API}?page=${page}&limit=10${searchParam}${statusParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setDonations(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      } else if (activeTab === 'expenses') {
        const res = await fetch(`${EXPENSE_API}?page=${page}&limit=10${searchParam}${statusParam}${categoryParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setExpenses(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      } else {
        // Unified ledger timeline
        const [donRes, expRes] = await Promise.all([
          fetch(`${DONATION_API}?page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${EXPENSE_API}?page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const donJson = await donRes.json();
        const expJson = await expRes.json();

        const combined = [
          ...(donJson.success ? donJson.data.filter(d => d.paymentStatus === 'completed').map(d => ({ ...d, type: 'credit', date: d.donationDate, title: `Donation: ${d.donorName}` })) : []),
          ...(expJson.success ? expJson.data.filter(e => e.paymentStatus === 'approved').map(e => ({ ...e, type: 'debit', date: e.date, title: e.title })) : [])
        ];

        combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLedger(combined.slice(0, 15));
        setTotalPages(1);
      }
    } catch (err) {
      toast.error('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, page, search, filterCategory, filterStatus, toast]);

  useEffect(() => {
    fetchMyBranches();
  }, [fetchMyBranches]);

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [fetchStats, fetchData]);

  const handleTabChange = (tab) => {
    setPage(1);
    setSearch('');
    setFilterCategory('');
    setFilterStatus('');
    setActiveTab(tab);
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(DONATION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(donationForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Donation recorded successfully');
        setIsDonationModalOpen(false);
        setDonationForm(p => ({
          ...p,
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          amount: '',
          paymentMethod: 'cash',
          notes: ''
        }));
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || 'Failed to record donation');
      }
    } catch (err) {
      toast.error('Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDonationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${DONATION_API}/${editingDonation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(donationForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Donation record updated successfully');
        setEditingDonation(null);
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update donation record');
      }
    } catch (err) {
      toast.error('Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(EXPENSE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(expenseForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Expense request submitted');
        setIsExpenseModalOpen(false);
        setExpenseForm(p => ({
          ...p,
          title: '',
          amount: '',
          category: 'Others',
          paymentMethod: 'cash',
          notes: ''
        }));
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || 'Failed to submit expense request');
      }
    } catch (err) {
      toast.error('Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${EXPENSE_API}/${editingExpense._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(expenseForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Expense request updated successfully');
        setEditingExpense(null);
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update expense request');
      }
    } catch (err) {
      toast.error('Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense request?')) return;
    try {
      const res = await fetch(`${EXPENSE_API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Expense request deleted');
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || 'Failed to delete request');
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation record?')) return;
    try {
      const res = await fetch(`${DONATION_API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Donation record deleted');
        fetchStats();
        fetchData();
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleUpdateExpenseStatus = async (id, status) => {
    try {
      const res = await fetch(`${EXPENSE_API}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Expense request ${status} successfully`);
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || `Failed to ${status} request`);
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const openEditDonationModal = (d) => {
    setEditingDonation(d);
    setDonationForm({
      donorName: d.donorName || '',
      donorEmail: d.donorEmail || '',
      donorPhone: d.donorPhone || '',
      amount: d.amount || '',
      paymentMethod: d.paymentMethod || 'cash',
      paymentStatus: d.paymentStatus || 'completed',
      purpose: d.purpose || 'Branch Donation',
      branch: d.branch?._id || d.branch || '',
      notes: d.notes || ''
    });
  };

  const openEditExpenseModal = (e) => {
    setEditingExpense(e);
    setExpenseForm({
      title: e.title || '',
      amount: e.amount || '',
      category: e.category || 'Others',
      paymentMethod: e.paymentMethod || 'cash',
      branch: e.branch?._id || e.branch || '',
      notes: e.notes || ''
    });
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <IndianRupee className="text-[#1B5E20]" size={28} />
              Branch Finance Board
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 font-bold">Manage branch income, request expenditures approvals, and view local ledger logs</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0 bg-green-700"
            >
              <Plus size={18} />
              Record Donation
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-green-700 font-bold border border-green-700 bg-white hover:bg-green-50 transition-all cursor-pointer shadow-sm"
            >
              <Plus size={18} />
              Request Expense
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branch Income</p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">₹{stats.totalIncome.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-green-600 font-bold mt-1.5 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> Received
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-700">
              <IndianRupee size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved Expenses</p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">₹{stats.totalExpenses.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-0.5">
                <ArrowDownRight size={12} /> Spent
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-700">
              <ArrowDownRight size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net balance</p>
              <h3 className={`text-2xl font-extrabold mt-1 ${stats.netBalance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                ₹{stats.netBalance.toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-1.5">Available Funds</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
              <Wallet size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-extrabold text-orange-600 mt-1">{stats.pendingExpensesCount}</h3>
              <p className="text-[10px] text-gray-400 font-bold mt-1.5">Submitted Requests</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl text-orange-700">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        {/* Unified Internal Tabs */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 pt-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-6">
              {[
                { id: 'ledger', label: 'Branch Ledger Timeline' },
                { id: 'donations', label: 'Income Logs' },
                { id: 'expenses', label: 'Expenses Requests' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`pb-4 text-sm font-bold tracking-wide relative cursor-pointer border-0 bg-transparent transition-all ${
                    activeTab === tab.id ? 'text-[#1B5E20]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1B5E20] rounded-t-full animate-fade-in" />
                  )}
                </button>
              ))}
            </div>

            {/* Quick search input */}
            {activeTab !== 'ledger' && (
              <div className="pb-3 flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-green-500 w-44 bg-gray-50/50"
                  />
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {activeTab === 'expenses' && (
                  <select
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-550"
                  >
                    <option value="">All Categories</option>
                    {[
                      'Project Expenditure', 'Event Expenses', 'Staff Salary', 'Utilities & Bills',
                      'Rent', 'Office Supplies', 'Travel & Transport', 'Campaign Marketing', 'Others'
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}

                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-550"
                >
                  <option value="">All Statuses</option>
                  {activeTab === 'donations' ? (
                    <>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending Audit</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Unified Content Panels */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-green-700" size={32} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compiling Records...</p>
            </div>
          ) : activeTab === 'ledger' ? (
            <div className="p-6 space-y-4">
              {ledger.length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-semibold">No transactions recorded in branch ledger yet.</div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {ledger.map((item, idx) => (
                    <div key={`${item._id}-${idx}`} className="flex items-start gap-4 relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${
                        item.type === 'credit' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {item.type === 'credit' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div className="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{item.purpose || item.category || 'General'}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{new Date(item.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-base ${item.type === 'credit' ? 'text-green-700' : 'text-red-600'}`}>
                            {item.type === 'credit' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide bg-white px-2 py-0.5 rounded border border-gray-150 mt-1.5 inline-block">
                            {item.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'donations' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['Donor', 'Receipt #', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 ${h === 'Actions' ? 'text-right pr-6' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-400 font-semibold">No donations found.</td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr key={d._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-bold text-gray-800">{d.donorName}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">{d.donorEmail || 'No Email'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-600">{d.receiptNumber}</td>
                        <td className="px-4 py-4 font-bold text-green-700">₹{d.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-xs font-semibold uppercase text-gray-500">{d.paymentMethod}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            d.paymentStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            d.paymentStatus === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {d.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                          {new Date(d.donationDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-4 text-right relative overflow-visible pr-6">
                          <div className="inline-block text-left">
                            <button
                              onClick={(e) => handleDropdownToggle(e, d._id)}
                              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-gray-700 hover:text-green-700"
                            >
                              <Settings size={18} className={activeDropdownId === d._id ? 'animate-spin text-green-700' : ''} />
                            </button>
                            {activeDropdownId === d._id && (
                              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left">
                                <button
                                  onClick={() => setViewingDonation(d)}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Eye size={14} className="text-gray-400" /> View Details
                                </button>
                                <button
                                  onClick={() => openEditDonationModal(d)}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Pencil size={14} className="text-gray-400" /> Edit Record
                                </button>
                                <button
                                  onClick={() => handleDeleteDonation(d._id)}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-red-650 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Trash2 size={14} className="text-red-400" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['Expense Item', 'Category', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 ${h === 'Actions' ? 'text-right pr-6' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-400 font-semibold">No expenses found.</td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr key={e._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-bold text-gray-800">{e.title}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">
                              {e.project ? `Project: ${e.project.title}` : 'General Expense'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-600">{e.category}</td>
                        <td className="px-4 py-4 font-bold text-red-600">₹{e.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-xs font-semibold uppercase text-gray-500">{e.paymentMethod}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            e.paymentStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            e.paymentStatus === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {e.paymentStatus === 'pending' ? 'Pending Audit' : e.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                          {new Date(e.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-4 text-right relative overflow-visible pr-6">
                          <div className="inline-block text-left">
                            <button
                              onClick={(evt) => handleDropdownToggle(evt, e._id)}
                              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-gray-700 hover:text-green-700"
                            >
                              <Settings size={18} className={activeDropdownId === e._id ? 'animate-spin text-green-700' : ''} />
                            </button>
                            {activeDropdownId === e._id && (
                              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left">
                                <button
                                  onClick={() => setViewingExpense(e)}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Eye size={14} className="text-gray-400" /> View Details
                                </button>
                                
                                {e.paymentStatus === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => openEditExpenseModal(e)}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                    >
                                      <Pencil size={14} className="text-gray-400" /> Edit Request
                                    </button>
                                    <button
                                      onClick={() => handleUpdateExpenseStatus(e._id, 'approved')}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                    >
                                      <CheckCircle2 size={14} className="text-green-500" /> Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateExpenseStatus(e._id, 'rejected')}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                    >
                                      <X size={14} className="text-orange-400" /> Reject
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExpense(e._id)}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-red-650 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                    >
                                      <Trash2 size={14} className="text-red-400" /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {activeTab !== 'ledger' && totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 font-bold">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Record branch donation Modal */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Record Cash/Online Donation</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Log a donation received locally under your branch jurisdiction</p>
              </div>
              <button onClick={() => setIsDonationModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleDonationSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Name *</label>
                  <input
                    type="text" required placeholder="Anil Kumar"
                    value={donationForm.donorName}
                    onChange={(e) => setDonationForm(p => ({ ...p, donorName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount *</label>
                  <input
                    type="number" required placeholder="500"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Email</label>
                  <input
                    type="email" placeholder="donor@gmail.com"
                    value={donationForm.donorEmail}
                    onChange={(e) => setDonationForm(p => ({ ...p, donorEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Phone</label>
                  <input
                    type="text" placeholder="9876543210"
                    value={donationForm.donorPhone}
                    onChange={(e) => setDonationForm(p => ({ ...p, donorPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                  <select
                    value={donationForm.paymentMethod}
                    onChange={(e) => setDonationForm(p => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online / UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Purpose / Tag</label>
                  <input
                    type="text" placeholder="General Donation"
                    value={donationForm.purpose}
                    onChange={(e) => setDonationForm(p => ({ ...p, purpose: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Internal notes</label>
                <textarea
                  placeholder="Record transactional references..."
                  value={donationForm.notes}
                  onChange={(e) => setDonationForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50 h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setIsDonationModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Save Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit donation Modal */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Edit Donation Record</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Update this logged donation details in database</p>
              </div>
              <button onClick={() => setEditingDonation(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditDonationSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Name *</label>
                  <input
                    type="text" required placeholder="Anil Kumar"
                    value={donationForm.donorName}
                    onChange={(e) => setDonationForm(p => ({ ...p, donorName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount *</label>
                  <input
                    type="number" required placeholder="500"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Email</label>
                  <input
                    type="email" placeholder="donor@gmail.com"
                    value={donationForm.donorEmail}
                    onChange={(e) => setDonationForm(p => ({ ...p, donorEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Phone</label>
                  <input
                    type="text" placeholder="9876543210"
                    value={donationForm.donorPhone}
                    onChange={(e) => setDonationForm(p => ({ ...p, donorPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                  <select
                    value={donationForm.paymentMethod}
                    onChange={(e) => setDonationForm(p => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online / UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Purpose / Tag</label>
                  <input
                    type="text" placeholder="General Donation"
                    value={donationForm.purpose}
                    onChange={(e) => setDonationForm(p => ({ ...p, purpose: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Internal notes</label>
                <textarea
                  placeholder="Record references..."
                  value={donationForm.notes}
                  onChange={(e) => setDonationForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50 h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setEditingDonation(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Submit Expense Request</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Request approval for local branch expenditures</p>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expense Item / Title *</label>
                  <input
                    type="text" required placeholder="Electricity bill, office supplies..."
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Requested Amount *</label>
                  <input
                    type="number" required placeholder="1200"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    {[
                      'Project Expenditure', 'Event Expenses', 'Staff Salary', 'Utilities & Bills',
                      'Rent', 'Office Supplies', 'Travel & Transport', 'Campaign Marketing', 'Others'
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm(p => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card Payment</option>
                    <option value="online">Online / UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Remarks / Expense Notes</label>
                <textarea
                  placeholder="Describe the nature of expense for auditing approval..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50 h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Edit Expense Request</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Update details of your pending expense request</p>
              </div>
              <button onClick={() => setEditingExpense(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expense Item / Title *</label>
                  <input
                    type="text" required placeholder="Electricity bill, office supplies..."
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Requested Amount *</label>
                  <input
                    type="number" required placeholder="1200"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    {[
                      'Project Expenditure', 'Event Expenses', 'Staff Salary', 'Utilities & Bills',
                      'Rent', 'Office Supplies', 'Travel & Transport', 'Campaign Marketing', 'Others'
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm(p => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card Payment</option>
                    <option value="online">Online / UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Remarks / Expense Notes</label>
                <textarea
                  placeholder="Describe the nature of expense..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50 h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setEditingExpense(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Donation Modal */}
      {viewingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-800">Donation Details Auditor</h3>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">Clearing Receipt Logs</p>
              </div>
              <button onClick={() => setViewingDonation(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Donor Fullname</p>
                <p className="font-extrabold text-gray-700 mt-0.5">{viewingDonation.donorName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Receipt Number</p>
                <p className="font-mono font-bold text-gray-600 mt-0.5">{viewingDonation.receiptNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Amount Cleared</p>
                <p className="font-extrabold text-green-700 text-lg mt-0.5">₹{viewingDonation.amount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Payment Method</p>
                <p className="font-extrabold text-gray-500 uppercase mt-0.5">{viewingDonation.paymentMethod}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Donor Contact</p>
                <p className="font-semibold text-gray-600 mt-0.5">{viewingDonation.donorPhone || 'N/A'}</p>
                <p className="text-[11px] text-gray-400 font-semibold">{viewingDonation.donorEmail || 'No Email'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Donation Date</p>
                <p className="font-semibold text-gray-600 mt-0.5">{new Date(viewingDonation.donationDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Purpose / Description</p>
                <p className="font-semibold text-gray-600 mt-0.5 bg-gray-55 p-3 rounded-xl border border-gray-100">{viewingDonation.purpose || 'Branch General donation'}</p>
              </div>
              {viewingDonation.notes && (
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Internal Notes</p>
                  <p className="font-semibold text-gray-500 mt-0.5 italic">{viewingDonation.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setViewingDonation(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-150 transition-colors border-0 cursor-pointer"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Expense Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-800">Expense Audit Details</h3>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">Auditing Branch Expenditures</p>
              </div>
              <button onClick={() => setViewingExpense(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Expense Title</p>
                <p className="font-extrabold text-gray-700 mt-0.5">{viewingExpense.title}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Auditing Status</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-1.5 ${
                  viewingExpense.paymentStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                  viewingExpense.paymentStatus === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {viewingExpense.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Requested Amount</p>
                <p className="font-extrabold text-red-650 text-lg mt-0.5">₹{viewingExpense.amount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Payment Method</p>
                <p className="font-extrabold text-gray-500 uppercase mt-0.5">{viewingExpense.paymentMethod}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Expense Category</p>
                <p className="font-extrabold text-gray-600 mt-0.5">{viewingExpense.category}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Log Creation Date</p>
                <p className="font-semibold text-gray-600 mt-0.5">{new Date(viewingExpense.date).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Associated Program / Project</p>
                <p className="font-bold text-green-700 mt-0.5">{viewingExpense.project?.title || 'General Branch Operations'}</p>
              </div>
              {viewingExpense.notes && (
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Remarks / Notes</p>
                  <p className="font-semibold text-gray-500 mt-0.5 bg-gray-55 p-3 rounded-xl border border-gray-100">{viewingExpense.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-2">
              {viewingExpense.paymentStatus === 'pending' && (
                <>
                  <button
                    onClick={() => { handleUpdateExpenseStatus(viewingExpense._id, 'approved'); setViewingExpense(null); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-700 hover:opacity-90 transition-colors border-0 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={13} /> Approve Request
                  </button>
                  <button
                    onClick={() => { handleUpdateExpenseStatus(viewingExpense._id, 'rejected'); setViewingExpense(null); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:opacity-90 transition-colors border-0 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X size={13} /> Reject Request
                  </button>
                </>
              )}
              <button
                onClick={() => setViewingExpense(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-150 transition-colors border-0 cursor-pointer"
              >
                Dismiss Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AdminFinance;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Plus, Eye,
  Trash2, Check, X, Search, Filter, Loader2, Calendar, FileText, CheckCircle2, ShieldCheck, Settings, Printer, Edit2
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS } from '../../shared/colors';

const DONATION_API = `${API_BASE_URL}/api/superadmin/donations`;
const EXPENSE_API = `${API_BASE_URL}/api/superadmin/expenses`;
const BRANCH_API = `${API_BASE_URL}/api/superadmin/branches`;
const PROJECT_API = `${API_BASE_URL}/api/superadmin/projects`;
const EVENT_API = `${API_BASE_URL}/api/superadmin/events`;

const Finance = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('ledger'); // ledger, donations, expenses
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    pendingExpensesCount: 0
  });

  // Data lists
  const [ledger, setLedger] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Form states
  const [donationForm, setDonationForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    purpose: 'General Donation',
    branch: '',
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Others',
    paymentMethod: 'cash',
    paymentStatus: 'approved',
    branch: '',
    project: '',
    event: '',
    notes: ''
  });

  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [editExpenseForm, setEditExpenseForm] = useState({
    _id: '',
    title: '',
    amount: '',
    category: 'Others',
    paymentMethod: 'cash',
    paymentStatus: 'approved',
    branch: '',
    project: '',
    event: '',
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
        if (res.status === 429) {
          toast.error('Too many requests. Please wait a moment.');
        } else {
          console.error(`API Error ${res.status}: ${res.statusText}`);
        }
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('Fetch operation error:', err);
      return null;
    }
  }, [token, toast]);

  const fetchBranches = useCallback(async () => {
    const data = await fetchAPI(BRANCH_API);
    if (data && data.success) setBranches(data.data || []);
  }, [fetchAPI]);

  const fetchProjects = useCallback(async () => {
    const data = await fetchAPI(PROJECT_API);
    if (data && data.success) setProjects(data.data || []);
  }, [fetchAPI]);

  const fetchEvents = useCallback(async () => {
    const data = await fetchAPI(EVENT_API);
    if (data && data.success) setEvents(data.data || []);
  }, [fetchAPI]);

  const fetchStats = useCallback(async () => {
    const [donStats, expStats] = await Promise.all([
      fetchAPI(`${DONATION_API}/stats`),
      fetchAPI(`${EXPENSE_API}/stats`)
    ]);

    const income = (donStats && donStats.success) ? donStats.data.totalAmount : 0;
    const spent = (expStats && expStats.success) ? expStats.data.totalAmount : 0;

    setStats({
      totalIncome: income,
      totalExpenses: spent,
      netBalance: income - spent,
      pendingExpensesCount: (expStats && expStats.success) ? expStats.data.pendingCount : 0
    });
  }, [fetchAPI]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const categoryParam = filterCategory ? `&category=${filterCategory}` : '';
      const branchParam = filterBranch ? `&branch=${filterBranch}` : '';
      const statusParam = filterStatus ? `&paymentStatus=${filterStatus}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';

      if (activeTab === 'donations') {
        const json = await fetchAPI(`${DONATION_API}?page=${page}&limit=10${searchParam}${branchParam}${statusParam}`);
        if (json && json.success) {
          setDonations(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      } else if (activeTab === 'expenses') {
        const json = await fetchAPI(`${EXPENSE_API}?page=${page}&limit=10${searchParam}${branchParam}${statusParam}${categoryParam}`);
        if (json && json.success) {
          setExpenses(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      } else {
        const [donJson, expJson] = await Promise.all([
          fetchAPI(`${DONATION_API}?page=1&limit=50`),
          fetchAPI(`${EXPENSE_API}?page=1&limit=50`)
        ]);

        const combined = [
          ...(donJson && donJson.success ? donJson.data.map(d => ({ ...d, type: 'credit', date: d.donationDate, title: `Donation: ${d.donorName}` })) : []),
          ...(expJson && expJson.success ? expJson.data.map(e => ({ ...e, type: 'debit', date: e.date, title: e.title })) : [])
        ];

        combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLedger(combined.slice(0, 15));
        setTotalPages(1);
      }
    } catch (err) {
      toast.error('Failed to load transaction logs');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, page, search, filterCategory, filterBranch, filterStatus, fetchAPI, toast]);

  useEffect(() => {
    fetchBranches();
    fetchProjects();
    fetchEvents();
  }, [fetchBranches, fetchProjects, fetchEvents]);

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [fetchStats, fetchData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setFilterCategory('');
    setFilterBranch('');
    setFilterStatus('');
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
        setDonationForm({
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          amount: '',
          paymentMethod: 'cash',
          paymentStatus: 'completed',
          purpose: 'General Donation',
          branch: '',
          notes: ''
        });
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || 'Failed to record donation');
      }
    } catch (err) {
      toast.error('Server connection failed');
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
        toast.success('Expense recorded successfully');
        setIsExpenseModalOpen(false);
        setExpenseForm({
          title: '',
          amount: '',
          category: 'Others',
          paymentMethod: 'cash',
          paymentStatus: 'approved',
          branch: '',
          project: '',
          event: '',
          notes: ''
        });
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || 'Failed to record expense');
      }
    } catch (err) {
      toast.error('Server connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseApprove = async (id, status) => {
    try {
      const res = await fetch(`${EXPENSE_API}/${id}`, {
        method: 'PUT',
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
        toast.error(data.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Server error');
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
      toast.error('Deletion failed');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await fetch(`${EXPENSE_API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Expense record deleted');
        fetchStats();
        fetchData();
      }
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const handleEditClick = (expense) => {
    setEditExpenseForm({
      _id: expense._id,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      paymentStatus: expense.paymentStatus,
      branch: expense.branch?._id || expense.branch || '',
      project: expense.project?._id || expense.project || '',
      event: expense.event?._id || expense.event || '',
      notes: expense.notes || ''
    });
    setIsEditExpenseModalOpen(true);
  };

  const handleEditExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${EXPENSE_API}/${editExpenseForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editExpenseForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Expense updated successfully');
        setIsEditExpenseModalOpen(false);
        fetchStats();
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update expense');
      }
    } catch (err) {
      toast.error('Server connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Wallet className="text-[#1B5E20]" size={28} />
              Finance Manager
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">NGO Double-Entry Ledger, branch expenses approvals, and donation summaries</p>
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
              Record Expense
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Income</p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">₹{stats.totalIncome.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> Live Donations
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-700">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">₹{stats.totalExpenses.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-0.5">
                <ArrowDownRight size={12} /> Approved Debits
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-700">
              <ArrowDownRight size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Reserve Balance</p>
              <h3 className={`text-2xl font-extrabold mt-1 ${stats.netBalance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                ₹{stats.netBalance.toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Central Treasury Pool</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
              <Wallet size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Expense Audits</p>
              <h3 className="text-2xl font-extrabold text-orange-600 mt-1">{stats.pendingExpensesCount}</h3>
              <p className="text-[10px] text-orange-500 font-bold mt-1">Awaiting Approvals</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 gap-6">
          {[
            { id: 'ledger', label: 'Ledger Audit Timeline' },
            { id: 'donations', label: 'Income & Donations' },
            { id: 'expenses', label: 'Expenditures & Requests' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`pb-3 font-bold text-sm border-b-2 cursor-pointer transition-all border-0 bg-transparent ${
                activeTab === t.id ? 'border-green-700 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters Panel (Only for specific list tabs) */}
        {activeTab !== 'ledger' && (
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search description, receipt, ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

            <select
              value={filterBranch}
              onChange={(e) => { setFilterBranch(e.target.value); setPage(1); }}
              className="px-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="">All Statuses</option>
              {activeTab === 'donations' ? (
                <>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </>
              ) : (
                <>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Audit</option>
                  <option value="rejected">Rejected</option>
                </>
              )}
            </select>

            {activeTab === 'expenses' && (
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="px-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
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
          </div>
        )}

        {/* Content Table / Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
          ) : activeTab === 'ledger' ? (
            <div className="divide-y divide-gray-100">
              <div className="p-4 bg-gray-50 flex items-center justify-between border-b">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Double-Entry Ledger Audit Timeline (Last 15 records)</span>
                <span className="text-xs font-semibold text-gray-400">Chronological list</span>
              </div>
              {ledger.length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-semibold">No transactions recorded yet in the ledger.</div>
              ) : (
                ledger.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {item.type === 'credit' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(item.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          {item.branch && <span>• Branch: {item.branch.name || 'Central'}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${item.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
                        {item.type === 'credit' ? '+' : '-'} ₹{item.amount.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {item.paymentMethod} • {item.paymentStatus || item.status || 'Success'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'donations' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['S.R.', 'Donor', 'Receipt #', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 ${h === 'Actions' ? 'text-right pr-6' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-gray-400 font-semibold">No donations found.</td>
                    </tr>
                  ) : (
                    donations.map((d, idx) => (
                      <tr key={d._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4 font-semibold text-gray-600">{(page - 1) * 10 + idx + 1}</td>
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
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left">
                                <button
                                  onClick={() => { setSelectedTransaction(d); setIsDonationModalOpen(false); }}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Eye size={14} className="text-gray-400" /> View Details
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => handleDeleteDonation(d._id)}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
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
                    {['S.R.', 'Expense Item', 'Category', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 ${h === 'Actions' ? 'text-right pr-6' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-gray-400 font-semibold">No expenses found.</td>
                    </tr>
                  ) : (
                    expenses.map((exp, idx) => (
                      <tr key={exp._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4 font-semibold text-gray-600">{(page - 1) * 10 + idx + 1}</td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-bold text-gray-800">{exp.title}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">
                              {exp.branch?.name || 'Central Pool'} {exp.project ? `• Project: ${exp.project.title}` : ''}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-600">{exp.category}</td>
                        <td className="px-4 py-4 font-bold text-red-600">₹{exp.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-xs font-semibold uppercase text-gray-500">{exp.paymentMethod}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            exp.paymentStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            exp.paymentStatus === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {exp.paymentStatus === 'pending' ? 'Pending Audit' : exp.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                          {new Date(exp.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-4 text-right relative overflow-visible pr-6">
                          <div className="inline-block text-left">
                            <button
                              onClick={(e) => handleDropdownToggle(e, exp._id)}
                              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-gray-700 hover:text-green-700"
                            >
                              <Settings size={18} className={activeDropdownId === exp._id ? 'animate-spin text-green-700' : ''} />
                            </button>
                            {activeDropdownId === exp._id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left">
                                <button
                                  onClick={() => { setSelectedTransaction(exp); }}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Eye size={14} className="text-gray-400" /> View Details
                                </button>
                                <button
                                  onClick={() => handleEditClick(exp)}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Edit2 size={14} className="text-gray-400" /> Edit Expense
                                </button>
                                {exp.paymentStatus === 'pending' && (
                                  <>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      onClick={() => handleExpenseApprove(exp._id, 'approved')}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-green-600 hover:bg-green-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                    >
                                      <Check size={14} className="text-green-400" /> Approve
                                    </button>
                                    <button
                                      onClick={() => handleExpenseApprove(exp._id, 'rejected')}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                    >
                                      <X size={14} className="text-orange-400" /> Reject
                                    </button>
                                  </>
                                )}
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => handleDeleteExpense(exp._id)}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
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

      {/* Record Donation Modal */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Record New Donation</h3>
                <p className="text-xs text-gray-400 mt-0.5">Record a physical/online donation received directly</p>
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
                    type="text" required placeholder="e.g. Anil Kumar"
                    value={donationForm.donorName}
                    onChange={(e) => setDonationForm(p => ({ ...p, donorName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (INR) *</label>
                  <input
                    type="number" required placeholder="e.g. 5000"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
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
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Phone</label>
                  <input
                    type="text" placeholder="9876543210"
                    value={donationForm.donorPhone}
                    onChange={(e) => setDonationForm(p => ({ ...p, donorPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
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
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Branch</label>
                  <select
                    value={donationForm.branch}
                    onChange={(e) => setDonationForm(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">Central / NGO Treasury</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Purpose / Campaign Description</label>
                <input
                  type="text" placeholder="e.g. Winter Clothing Drive"
                  value={donationForm.purpose}
                  onChange={(e) => setDonationForm(p => ({ ...p, purpose: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Internal Notes</label>
                <textarea
                  placeholder="Record transactional references, etc."
                  value={donationForm.notes}
                  onChange={(e) => setDonationForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-20 resize-none"
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

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Record New Expense</h3>
                <p className="text-xs text-gray-400 mt-0.5">Add utility bills, project costs, salaries, or event expenditures</p>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expense Title / Item *</label>
                  <input
                    type="text" required placeholder="e.g. Office Electricity Bill"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (INR) *</label>
                  <input
                    type="number" required placeholder="e.g. 1500"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
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

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Branch</label>
                  <select
                    value={expenseForm.branch}
                    onChange={(e) => setExpenseForm(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">Central Pool</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Project Link</label>
                  <select
                    value={expenseForm.project}
                    onChange={(e) => setExpenseForm(p => ({ ...p, project: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Event Link</label>
                  <select
                    value={expenseForm.event}
                    onChange={(e) => setExpenseForm(p => ({ ...p, event: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">None</option>
                    {events.map(ev => (
                      <option key={ev._id} value={ev._id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expenditure Details / Remarks</label>
                <textarea
                  placeholder="Describe the nature of expenditure"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-20 resize-none"
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-lg bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Transaction Details</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Consolidated audit parameters</p>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</p>
                <h2 className={`text-3xl font-extrabold mt-1 ${selectedTransaction.receiptNumber ? 'text-green-700' : 'text-red-600'}`}>
                  ₹{selectedTransaction.amount?.toLocaleString('en-IN')}
                </h2>
                <span className={`inline-block px-2.5 py-0.5 mt-2 rounded text-[10px] font-extrabold border uppercase tracking-wider ${
                  selectedTransaction.receiptNumber ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {selectedTransaction.receiptNumber ? 'Credit (Donation)' : 'Debit (Expense)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference ID</span>
                  <span className="font-bold text-gray-800">{selectedTransaction.receiptNumber || selectedTransaction.expenseId || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaction Date</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(selectedTransaction.donationDate || selectedTransaction.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{selectedTransaction.receiptNumber ? 'Donor Name' : 'Item / Title'}</span>
                  <span className="font-bold text-gray-800">{selectedTransaction.donorName || selectedTransaction.title}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</span>
                  <span className="font-semibold text-gray-700 uppercase">{selectedTransaction.paymentMethod}</span>
                </div>
              </div>

              {selectedTransaction.receiptNumber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</span>
                    <span className="font-semibold text-gray-700">{selectedTransaction.donorEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                    <span className="font-semibold text-gray-700">{selectedTransaction.donorPhone || 'N/A'}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Purpose / Category</span>
                  <span className="font-semibold text-gray-700">{selectedTransaction.purpose || selectedTransaction.category || 'General'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Branch Pool</span>
                  <span className="font-semibold text-gray-700">{selectedTransaction.branch?.name || 'Central pool / Central HQ'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Auditing Remarks</span>
                <p className="text-xs text-gray-600 italic bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 mt-1">
                  {selectedTransaction.notes || 'No remarks recorded for this transaction.'}
                </p>
              </div>

              {selectedTransaction.createdBy && (
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-[11px] text-gray-400 font-bold">
                  <div>
                    <span>Created By:</span>
                    <span className="block text-gray-600 font-bold mt-0.5">{selectedTransaction.createdBy.name || 'Admin'}</span>
                  </div>
                  {selectedTransaction.approvedBy && (
                    <div>
                      <span>Approved By:</span>
                      <span className="block text-gray-600 font-bold mt-0.5">{selectedTransaction.approvedBy.name || 'System Auto'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button" onClick={() => setSelectedTransaction(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {isEditExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Edit Expense Record</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Modify utility bills, project allocations, or event costs</p>
              </div>
              <button onClick={() => setIsEditExpenseModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expense Title / Item *</label>
                  <input
                    type="text" required placeholder="e.g. Office Electricity Bill"
                    value={editExpenseForm.title}
                    onChange={(e) => setEditExpenseForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (INR) *</label>
                  <input
                    type="number" required placeholder="e.g. 1500"
                    value={editExpenseForm.amount}
                    onChange={(e) => setEditExpenseForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={editExpenseForm.category}
                    onChange={(e) => setEditExpenseForm(p => ({ ...p, category: e.target.value }))}
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
                    value={editExpenseForm.paymentMethod}
                    onChange={(e) => setEditExpenseForm(p => ({ ...p, paymentMethod: e.target.value }))}
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

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Branch</label>
                  <select
                    value={editExpenseForm.branch}
                    onChange={(e) => setEditExpenseForm(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">Central Pool</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Project Link</label>
                  <select
                    value={editExpenseForm.project}
                    onChange={(e) => setEditExpenseForm(p => ({ ...p, project: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Event Link</label>
                  <select
                    value={editExpenseForm.event}
                    onChange={(e) => setEditExpenseForm(p => ({ ...p, event: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">None</option>
                    {events.map(ev => (
                      <option key={ev._id} value={ev._id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expenditure Details / Remarks</label>
                <textarea
                  placeholder="Describe the nature of expenditure"
                  value={editExpenseForm.notes}
                  onChange={(e) => setEditExpenseForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setIsEditExpenseModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Update Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Finance;

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Plus, Eye,
  Trash2, X, Search, Filter, Loader2, Calendar, FileText, CheckCircle2, ShieldCheck, Settings, Printer
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

  // Determine active tab from current route pathname
  const getTabFromPath = (path) => {
    if (path.includes('/income')) return 'donations';
    if (path.includes('/expenses')) return 'expenses';
    return 'ledger';
  };

  const activeTab = getTabFromPath(location.pathname);

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

  // Modals
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Forms
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
        // Autofill branch ID for form payloads
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
        // Unified timeline
        const [donRes, expRes] = await Promise.all([
          fetch(`${DONATION_API}?page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${EXPENSE_API}?page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const donJson = await donRes.json();
        const expJson = await expRes.json();

        const combined = [
          ...(donJson.success ? donJson.data.map(d => ({ ...d, type: 'credit', date: d.donationDate, title: `Donation: ${d.donorName}` })) : []),
          ...(expJson.success ? expJson.data.map(e => ({ ...e, type: 'debit', date: e.date, title: e.title })) : [])
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
    if (tab === 'donations') navigate('/admin/finance/income');
    else if (tab === 'expenses') navigate('/admin/finance/expenses');
    else navigate('/admin/finance/transactions');
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
        toast.success('Expense approval request submitted successfully');
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

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Wallet className="text-[#1B5E20]" size={28} />
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
              <DollarSign size={24} />
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
              <p className="text-[10px] text-orange-500 font-bold mt-1.5">Submitted Requests</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 gap-6">
          {[
            { id: 'ledger', label: 'Branch Ledger Timeline' },
            { id: 'donations', label: 'Income Logs' },
            { id: 'expenses', label: 'Expenses Requests' }
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

        {/* Filters Panel (Only for specific lists) */}
        {activeTab !== 'ledger' && (
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

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
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Ledger Timeline (Last 15 records)</span>
                <span className="text-xs font-semibold text-gray-400">Chronological entries</span>
              </div>
              {ledger.length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-semibold">No transactions recorded in branch ledger yet.</div>
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
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left">
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
                          {e.paymentStatus === 'pending' ? (
                            <button
                              onClick={() => handleDeleteExpense(e._id)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-500 border border-red-200 bg-white cursor-pointer"
                              title="Delete Request"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 font-semibold">Audited</span>
                          )}
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

      {/* Add branch donation */}
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
    </Layout>
  );
};

export default AdminFinance;

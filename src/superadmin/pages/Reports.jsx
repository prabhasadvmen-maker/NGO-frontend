import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, FileText, Download, Printer, Filter, Calendar,
  TrendingUp, Wallet, Users, Award, ShieldAlert, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, GitBranch
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const REPORT_API = `${API_BASE_URL}/api/reports/superadmin`;
const BRANCH_API = `${API_BASE_URL}/api/superadmin/branches`;

const Reports = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [branches, setBranches] = useState([]);

  // Filter States
  const [filterBranch, setFilterBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(BRANCH_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBranches(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const branchParam = filterBranch ? `&branchId=${filterBranch}` : '';
      const startParam = startDate ? `&startDate=${startDate}` : '';
      const endParam = endDate ? `&endDate=${endDate}` : '';
      
      const res = await fetch(`${REPORT_API}?${branchParam}${startParam}${endParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setReportData(json.data);
      } else {
        toast.error(json.message || 'Failed to compile reports');
      }
    } catch (err) {
      toast.error('Server connection failed');
    } finally {
      setLoading(false);
    }
  }, [token, filterBranch, startDate, endDate, toast]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Export data helper
  const handleExportCSV = (type) => {
    if (!reportData) return;
    let headers = [];
    let rows = [];
    let filename = '';

    if (type === 'monthly') {
      headers = ['Month Label', 'Donations (INR)', 'Expenses (INR)'];
      rows = reportData.monthlyTrend.map(t => [t.label, t.donations, t.expenses]);
      filename = 'monthly_financial_report.csv';
    } else if (type === 'categories') {
      headers = ['Category', 'Amount spent (INR)'];
      rows = reportData.expenseCategories.map(c => [c._id || 'Uncategorized', c.value]);
      filename = 'category_expense_distribution.csv';
    } else {
      headers = ['Branch Name', 'Branch Code', 'Total Donations (INR)', 'Total Expenses (INR)'];
      rows = reportData.branchComparison.map(b => [b.name, b.code, b.totalDonations, b.totalExpenses]);
      filename = 'branch_financial_comparison.csv';
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const handlePrintAudit = () => {
    window.print();
  };

  const trend = reportData?.monthlyTrend || [];
  const maxTrendVal = trend.length ? Math.max(...trend.map(t => Math.max(t.donations, t.expenses))) || 1 : 1;

  const categories = reportData?.expenseCategories || [];
  const totalCategorySpent = categories.reduce((sum, c) => sum + c.value, 0) || 1;

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-[#1B5E20]" size={28} />
              Financial & Audit Reports
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 font-bold">Compile aggregate metrics, budget balances, and transaction distribution graphs</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrintAudit}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-green-700 font-bold border border-green-700 bg-white hover:bg-green-50 transition-all cursor-pointer shadow-sm"
            >
              <Printer size={18} />
              Print Audit Log
            </button>
            <button
              onClick={() => fetchReports()}
              className="p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-600"
              title="Refresh Stats"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center gap-3 print:hidden shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Filter size={14} /> Filters:
          </div>
          
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer flex-1 sm:flex-none"
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            />
            <span className="text-gray-400 text-xs font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            />
          </div>
        </div>

        {loading || !reportData ? (
          <div className="flex justify-center items-center py-40">
            <Loader2 className="animate-spin text-green-700" size={32} />
          </div>
        ) : (
          <>
            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Income (Donations)</p>
                <h3 className="text-2xl font-extrabold text-gray-800 mt-2">₹{reportData.summary.totalIncome.toLocaleString('en-IN')}</h3>
                <p className="text-[10px] text-green-600 font-bold mt-1.5 flex items-center gap-0.5">
                  <ArrowUpRight size={12} /> Positive Cash flow
                </p>
                <div className="absolute -right-6 -bottom-6 opacity-5 text-green-800">
                  <TrendingUp size={96} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Expenses</p>
                <h3 className="text-2xl font-extrabold text-gray-800 mt-2">₹{reportData.summary.totalExpenses.toLocaleString('en-IN')}</h3>
                <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-0.5">
                  <ArrowDownRight size={12} /> Outflow debits
                </p>
                <div className="absolute -right-6 -bottom-6 opacity-5 text-red-800">
                  <ArrowDownRight size={96} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Funds pool</p>
                <h3 className={`text-2xl font-extrabold mt-2 ${reportData.summary.netFunds >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  ₹{reportData.summary.netFunds.toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1.5">Consolidated Cash Reserve</p>
                <div className="absolute -right-6 -bottom-6 opacity-5 text-gray-800">
                  <Wallet size={96} />
                </div>
              </div>
            </div>

            {/* Custom SVG Charts Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Trend Bar Chart */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-gray-50 print:pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Income vs Expenditures Trend</h3>
                    <p className="text-[10px] text-gray-400">Monthly chronological comparison (Last 6 Months)</p>
                  </div>
                  <button
                    onClick={() => handleExportCSV('monthly')}
                    className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-500 print:hidden"
                    title="Export CSV"
                  >
                    <Download size={14} />
                  </button>
                </div>

                {/* SVG Trend Bars */}
                <div className="h-60 mt-6 flex items-end justify-between px-2 gap-4">
                  {trend.map((t, i) => {
                    const donHeight = (t.donations / maxTrendVal) * 100;
                    const expHeight = (t.expenses / maxTrendVal) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                        <div className="w-full flex items-end gap-1.5 h-full max-h-[85%]">
                          {/* Donation bar */}
                          <div 
                            style={{ height: `${Math.max(donHeight, 4)}%` }}
                            className="flex-1 bg-green-700 rounded-t-sm transition-all duration-500 relative group"
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 font-mono">
                              ₹{t.donations}
                            </span>
                          </div>
                          {/* Expense bar */}
                          <div 
                            style={{ height: `${Math.max(expHeight, 4)}%` }}
                            className="flex-1 bg-red-500 rounded-t-sm transition-all duration-500 relative group"
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 font-mono">
                              ₹{t.expenses}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 mt-2">{t.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 items-center justify-center pt-4 border-t border-gray-50 mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-green-700 rounded-sm"></span> Donations (Income)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-500 rounded-sm"></span> Expenses (Expenditures)
                  </div>
                </div>
              </div>

              {/* Expense Category Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-gray-50 print:pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Category Expenditures</h3>
                    <p className="text-[10px] text-gray-400">Expense breakdown by transactional category</p>
                  </div>
                  <button
                    onClick={() => handleExportCSV('categories')}
                    className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-500 print:hidden"
                    title="Export CSV"
                  >
                    <Download size={14} />
                  </button>
                </div>

                {/* Progress bar list representing Category breakdown */}
                <div className="space-y-4 mt-6 flex-1 justify-center flex flex-col">
                  {categories.length === 0 ? (
                    <p className="text-center text-gray-400 font-semibold py-10">No expenses recorded yet.</p>
                  ) : (
                    categories.map((c, i) => {
                      const percentage = (c.value / totalCategorySpent) * 100;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-gray-600">
                            <span>{c._id || 'Uncategorized'}</span>
                            <span className="font-mono">₹{c.value.toLocaleString('en-IN')} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${percentage}%` }}
                              className="h-full bg-green-700 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Branch Performance Comparison */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-50 print:pb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Branch Financial comparison</h3>
                  <p className="text-[10px] text-gray-400">Inflow vs outflow overview for all active branch networks</p>
                </div>
                <button
                  onClick={() => handleExportCSV('branches')}
                  className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-500 print:hidden"
                  title="Export CSV"
                >
                  <Download size={14} />
                </button>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#E5E7EB' }}>
                      <th className="py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                      <th className="py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-green-700">Total Donations</th>
                      <th className="py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-red-500">Total Expenses</th>
                      <th className="py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right pr-4">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.branchComparison.map((b, idx) => {
                      const bal = b.totalDonations - b.totalExpenses;
                      return (
                        <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                          <td className="py-3 font-bold text-gray-800">{b.name}</td>
                          <td className="py-3 font-semibold text-gray-500">{b.code}</td>
                          <td className="py-3 font-bold text-green-700">₹{b.totalDonations.toLocaleString('en-IN')}</td>
                          <td className="py-3 font-bold text-red-500">₹{b.totalExpenses.toLocaleString('en-IN')}</td>
                          <td className={`py-3 font-extrabold text-right pr-4 ${bal >= 0 ? 'text-green-800' : 'text-red-700'}`}>
                            ₹{bal.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;

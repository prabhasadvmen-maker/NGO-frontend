import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, FileText, Download, Printer, Filter, Calendar,
  TrendingUp, Wallet, Users, Award, ShieldAlert, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, GitBranch
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const REPORT_API = `${API_BASE_URL}/api/reports/admin`;

const AdminReports = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve active subreport tab from pathname
  const getTabFromPath = (path) => {
    if (path.includes('/members')) return 'members';
    if (path.includes('/projects')) return 'projects';
    if (path.includes('/events')) return 'events';
    return 'donations';
  };

  const activeTab = getTabFromPath(location.pathname);

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(REPORT_API, {
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
  }, [token, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleTabChange = (tab) => {
    if (tab === 'members') navigate('/admin/reports/members');
    else if (tab === 'projects') navigate('/admin/reports/projects');
    else if (tab === 'events') navigate('/admin/reports/events');
    else navigate('/admin/reports/donations');
  };

  const handlePrintAudit = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeTab === 'donations') {
      headers = ['Purpose', 'Total Amount Received (INR)'];
      rows = reportData.donationPurposes.map(d => [d._id || 'General', d.value]);
      filename = 'branch_donations_by_purpose.csv';
    } else {
      headers = ['Category', 'Total Expenditure (INR)'];
      rows = reportData.expenseCategories.map(c => [c._id || 'Uncategorized', c.value]);
      filename = 'branch_expenses_by_category.csv';
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
    toast.success('Branch report exported successfully');
  };

  const categories = reportData?.expenseCategories || [];
  const totalCategorySpent = categories.reduce((sum, c) => sum + c.value, 0) || 1;

  const purposes = reportData?.donationPurposes || [];
  const totalDonationReceived = purposes.reduce((sum, p) => sum + p.value, 0) || 1;

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-[#1B5E20]" size={28} />
              Branch Audit & Analytics
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 font-bold">Consolidated analytics reports compiled for active branch jurisdictions</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrintAudit}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-green-700 font-bold border border-green-700 bg-white hover:bg-green-50 transition-all cursor-pointer shadow-sm"
            >
              <Printer size={18} />
              Print Branch Report
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0 bg-green-700"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 gap-6 print:hidden">
          {[
            { id: 'donations', label: 'Donations & Purpose Breakdown' },
            { id: 'members', label: 'Member & Volunteer Metrics' },
            { id: 'projects', label: 'Projects Financial Reports' },
            { id: 'events', label: 'Branch Events Audits' }
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

        {loading || !reportData ? (
          <div className="flex justify-center items-center py-40">
            <Loader2 className="animate-spin text-green-700" size={32} />
          </div>
        ) : (
          <>
            {/* Core Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branch Income</p>
                <h3 className="text-2xl font-extrabold text-gray-800 mt-2">₹{reportData.summary.totalIncome.toLocaleString('en-IN')}</h3>
                <p className="text-[10px] text-green-600 font-bold mt-1">Cash Inflow</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved Expenses</p>
                <h3 className="text-2xl font-extrabold text-gray-800 mt-2">₹{reportData.summary.totalExpenses.toLocaleString('en-IN')}</h3>
                <p className="text-[10px] text-red-500 font-bold mt-1">Cash Outflow</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Balance</p>
                <h3 className={`text-2xl font-extrabold mt-2 ${reportData.summary.netFunds >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  ₹{reportData.summary.netFunds.toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Liquidity</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branch Directory</p>
                <h3 className="text-2xl font-extrabold text-gray-800 mt-2">
                  {reportData.summary.membersCount + reportData.summary.volunteersCount} Users
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1">
                  {reportData.summary.membersCount} Members / {reportData.summary.volunteersCount} Volunteers
                </p>
              </div>
            </div>

            {/* Custom SVG Distribution Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donation purpose */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-3">Income Purpose Distribution</h3>
                <div className="space-y-4 mt-4">
                  {purposes.length === 0 ? (
                    <p className="text-center text-gray-400 font-semibold py-10">No donations received under purpose categories.</p>
                  ) : (
                    purposes.map((p, i) => {
                      const percentage = (p.value / totalDonationReceived) * 100;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-gray-600">
                            <span>{p._id || 'General Purpose'}</span>
                            <span className="font-mono">₹{p.value.toLocaleString('en-IN')} ({percentage.toFixed(1)}%)</span>
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

              {/* Expense category */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-3">Expense Category Breakdown</h3>
                <div className="space-y-4 mt-4">
                  {categories.length === 0 ? (
                    <p className="text-center text-gray-400 font-semibold py-10">No expenses approved for this branch.</p>
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
                              className="h-full bg-red-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Custom Tab Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-3 uppercase tracking-wider text-xs">
                Audit Listing: {activeTab.toUpperCase()}
              </h3>
              <div className="py-10 text-center text-gray-400 font-semibold">
                Use the dedicated left sidebar links to edit, print, or manage detailed records. This page compiles high-level balance audits.
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminReports;

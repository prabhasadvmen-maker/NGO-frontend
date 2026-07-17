import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, FileText, Download, Printer, Filter, Calendar,
  TrendingUp, Wallet, Users, Award, ShieldAlert, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, GitBranch, CheckCircle2
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const REPORT_API = `${API_BASE_URL}/api/reports/admin`;

const AdminReports = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  // Local state for active tab selection ('donations' default)
  const [activeTab, setActiveTab] = useState('donations'); // 'donations', 'members', 'projects', 'events'

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
    setActiveTab(tab);
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
    } else if (activeTab === 'projects') {
      headers = ['Category', 'Total Expenditure (INR)'];
      rows = reportData.expenseCategories.map(c => [c._id || 'Uncategorized', c.value]);
      filename = 'branch_expenses_by_category.csv';
    } else if (activeTab === 'members') {
      headers = ['Directory Type', 'Count'];
      rows = [
        ['Registered Members', reportData.summary.membersCount],
        ['Registered Volunteers', reportData.summary.volunteersCount],
        ['Total Community Users', reportData.summary.membersCount + reportData.summary.volunteersCount]
      ];
      filename = 'branch_member_volunteer_directory_counts.csv';
    } else {
      headers = ['Metric Item', 'Branch Scope Count'];
      rows = [
        ['Active Projects', reportData.summary.projectsCount],
        ['Associated Volunteers', reportData.summary.volunteersCount]
      ];
      filename = 'branch_event_and_projects_summary.csv';
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
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden print:hidden">
          <div className="px-6 pt-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-6">
              {[
                { id: 'donations', label: 'Donations & Purpose Breakdown' },
                { id: 'members', label: 'Member & Volunteer Metrics' },
                { id: 'projects', label: 'Projects Financial Reports' },
                { id: 'events', label: 'Branch Events Audits' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`pb-4 text-sm font-bold tracking-wide relative cursor-pointer border-0 bg-transparent transition-all ${
                    activeTab === t.id ? 'text-[#1B5E20]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t.label}
                  {activeTab === t.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1B5E20] rounded-t-full animate-fade-in" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading || !reportData ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-green-700" size={32} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compiling Analytics...</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Core Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branch Income</p>
                    <h3 className="text-2xl font-extrabold text-gray-800 mt-2">₹{reportData.summary.totalIncome.toLocaleString('en-IN')}</h3>
                    <p className="text-[10px] text-green-600 font-bold mt-1.5 flex items-center gap-0.5">
                      <ArrowUpRight size={12} /> Cash Inflow
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-green-700">
                    <TrendingUp size={24} />
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved Expenses</p>
                    <h3 className="text-2xl font-extrabold text-gray-800 mt-2">₹{reportData.summary.totalExpenses.toLocaleString('en-IN')}</h3>
                    <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-0.5">
                      <ArrowDownRight size={12} /> Cash Outflow
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl text-red-700">
                    <ArrowDownRight size={24} />
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Balance</p>
                    <h3 className={`text-2xl font-extrabold mt-2 ${reportData.summary.netFunds >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      ₹{reportData.summary.netFunds.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1.5">Liquidity Available</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
                    <Wallet size={24} />
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branch Directory</p>
                    <h3 className="text-2xl font-extrabold text-gray-800 mt-2">
                      {reportData.summary.membersCount + reportData.summary.volunteersCount} Users
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1.5">
                      {reportData.summary.membersCount} Members / {reportData.summary.volunteersCount} Volunteers
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
                    <Users size={24} />
                  </div>
                </div>
              </div>

              {/* Dynamic Tabs Breakdown */}
              {activeTab === 'donations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Income Purpose Distribution</h3>
                    <div className="space-y-4">
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
                              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${percentage}%` }}
                                  className="h-full bg-green-700 rounded-full transition-all duration-500"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Income Operations Health</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100">
                          <CheckCircle2 className="text-green-600" size={20} />
                          <div>
                            <p className="text-xs font-bold text-gray-700">Financial Liquidity: Excellent</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Donations fully cover branch operations overheads.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <GitBranch className="text-indigo-600" size={20} />
                          <div>
                            <p className="text-xs font-bold text-gray-700">Campaign Contributions</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Crowdfunding logs tracked under specific social drive metrics.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 italic">
                      High-level summary of active cash inflows logged inside branch jurisdiction. Use 'Finance' tab for ledger modifications.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Community Structure</h3>
                    <div className="space-y-4 mt-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-b border-gray-50 pb-2">
                        <span>Total Members</span>
                        <span className="font-mono bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100">{reportData.summary.membersCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-b border-gray-50 pb-2">
                        <span>Active Volunteers</span>
                        <span className="font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">{reportData.summary.volunteersCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600 pb-2">
                        <span>Total Directory Capacity</span>
                        <span className="font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
                          {reportData.summary.membersCount + reportData.summary.volunteersCount} Users
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Directory Operations</h3>
                      <p className="text-xs text-gray-500 leading-relaxed mt-3">
                        Volunteers and members are mapped under your branch jurisdiction. Staff members utilize the admin console to generate certificates, print ID cards, and record attendance details.
                      </p>
                    </div>
                    <div className="text-[11px] text-gray-400 italic">
                      Detailed rosters can be updated in 'Members' and 'Volunteers' sidebars respectively.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Expenses Category Breakdown</h3>
                    <div className="space-y-4">
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
                              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${percentage}%` }}
                                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Project Expenditures Status</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                          <TrendingUp className="text-red-500" size={20} />
                          <div>
                            <p className="text-xs font-bold text-gray-700">Total Program Funding Spent</p>
                            <p className="text-sm font-black text-red-600 mt-0.5">₹{reportData.summary.totalExpenses.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100">
                          <Award className="text-green-700" size={20} />
                          <div>
                            <p className="text-xs font-bold text-gray-700">Active Social Drives</p>
                            <p className="text-sm font-black text-green-700 mt-0.5">{reportData.summary.projectsCount} Programs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 italic">
                      Detailed bills and invoices logs can be audited inside individual project panel pages.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Event Audit Metrics</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2">
                      Event registrations and local social camps are recorded inside your branch dashboard. High-level attendance reports and certificate issuances are cross-referenced with this summary.
                    </p>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                        <span>Assigned Campaign Drives</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">{reportData.summary.projectsCount} Drives</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                        <span>Staff Directory Size</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">{reportData.summary.volunteersCount} Staffs</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Public Engagements</h3>
                      <p className="text-xs text-gray-500 leading-relaxed mt-3">
                        All local campaign registries are compiled automatically. Detailed rosters can be exported directly via CSV for public reporting and NGO transparency updates.
                      </p>
                    </div>
                    <div className="text-[11px] text-gray-400 italic">
                      Use 'Events' sidebar option to inspect participant registries and print certifications.
                    </div>
                  </div>
                </div>
              )}

              {/* Information Footer */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-150">
                <p className="text-xs text-gray-500 leading-relaxed font-bold flex items-center gap-2">
                  <ShieldAlert size={14} className="text-green-700" />
                  This page compiles high-level balance audits and directory registrations. To edit, print, or manage detailed records, use the respective left sidebar tabs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminReports;

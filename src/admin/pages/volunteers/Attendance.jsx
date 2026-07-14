import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, CheckCircle2, AlertCircle, Users, Landmark, Search, Clock, Save, RefreshCw, X, FileText, Filter, List, Loader2, User, Phone
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import { COLORS } from '../../../shared/colors';
import API_BASE_URL from '../../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Attendance = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'history'
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Mark Attendance states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [sheetData, setSheetData] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // History states
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyBranch, setHistoryBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  // Fetch active branches
  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(`${API}/branches?isActive=true`, { headers });
      const data = await res.json();
      if (data.success) {
        setBranches(data.data);
        if (data.data.length > 0) {
          setSelectedBranch(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [headers]);

  // Fetch sheet data for selected branch and date
  const fetchSheet = useCallback(async () => {
    if (!selectedBranch || !attendanceDate) return;
    setLoadingSheet(true);
    try {
      const res = await fetch(`${API}/admin/volunteers/attendance/sheet?branch=${selectedBranch}&date=${attendanceDate}`, { headers });
      const data = await res.json();
      if (data.success) {
        setSheetData(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch attendance sheet');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading attendance sheet');
    } finally {
      setLoadingSheet(false);
    }
  }, [selectedBranch, attendanceDate, headers, toast]);

  // Fetch history records
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const queryParams = new URLSearchParams({
        page: historyPage,
        limit,
        search: historySearch,
        branch: historyBranch,
        startDate,
        endDate
      });
      const res = await fetch(`${API}/admin/volunteers/attendance/history?${queryParams}`, { headers });
      const data = await res.json();
      if (data.success) {
        setHistoryData(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.message || 'Failed to fetch history logs');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading history');
    } finally {
      setLoadingHistory(false);
    }
  }, [historyPage, limit, historySearch, historyBranch, startDate, endDate, headers, toast]);

  useEffect(() => {
    if (token) fetchBranches();
  }, [token, fetchBranches]);

  useEffect(() => {
    if (activeTab === 'mark') {
      fetchSheet();
    } else {
      fetchHistory();
    }
  }, [activeTab, fetchSheet, fetchHistory]);

  const handleStatusChange = (volunteerId, status) => {
    setSheetData(prev => prev.map(item => {
      if (item._id === volunteerId) {
        return {
          ...item,
          attendance: { ...item.attendance, status }
        };
      }
      return item;
    }));
  };

  const handleRemarksChange = (volunteerId, remarks) => {
    setSheetData(prev => prev.map(item => {
      if (item._id === volunteerId) {
        return {
          ...item,
          attendance: { ...item.attendance, remarks }
        };
      }
      return item;
    }));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (sheetData.length === 0) return;
    setSubmitting(true);
    try {
      const records = sheetData.map(item => ({
        volunteerId: item._id,
        status: item.attendance.status,
        remarks: item.attendance.remarks
      }));

      const res = await fetch(`${API}/admin/volunteers/attendance/save`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          branch: selectedBranch,
          date: attendanceDate,
          records
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Attendance records submitted successfully');
        fetchSheet();
      } else {
        toast.error(data.message || 'Failed to save attendance');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearHistoryFilters = () => {
    setHistorySearch('');
    setHistoryBranch('');
    setStartDate('');
    setEndDate('');
    setHistoryPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-700 border-green-200';
      case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
      case 'Late': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Half-day': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Calendar className="text-[#1B5E20]" size={28} />
              Volunteers Attendance
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Mark daily attendance and track volunteer activity logs</p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl max-w-xs self-start sm:self-center">
            <button
              onClick={() => setActiveTab('mark')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'mark' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle2 size={14} /> Mark Daily
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'history' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={14} /> Log History
            </button>
          </div>
        </div>

        {/* -------------------- TAB: MARK ATTENDANCE -------------------- */}
        {activeTab === 'mark' && (
          <div className="space-y-6">
            
            {/* Sheet Configurations Card */}
            <div 
              className="rounded-2xl p-5 bg-white"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date Selector</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 text-gray-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">NGO Branch Assignment *</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 text-gray-600 font-semibold cursor-pointer"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={fetchSheet}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} /> Refresh sheet
                  </button>
                </div>

              </div>
            </div>

            {/* Attendance Roster Table */}
            <div 
              className="rounded-2xl overflow-hidden bg-white"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              {loadingSheet ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
                  <p className="text-sm font-semibold text-gray-400">Fetching attendance sheet...</p>
                </div>
              ) : !selectedBranch ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                  <Landmark size={44} className="opacity-30" />
                  <p className="font-semibold text-sm">Please select a Branch assignment to retrieve sheet</p>
                </div>
              ) : sheetData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                  <Users size={44} className="opacity-30" />
                  <p className="font-semibold text-sm">No active volunteers registered under this branch</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitAttendance}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                          {['#', 'ID', 'Volunteer Profile', 'Contact', 'Mark Status', 'Remarks Log'].map(h => (
                            <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheetData.map((item, idx) => (
                          <tr key={item._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            
                            {/* Sr No */}
                            <td className="px-4 py-4 text-gray-500 font-medium">{idx + 1}</td>

                            {/* Volunteer ID */}
                            <td className="px-4 py-4 font-bold text-gray-700">{item.volunteerId}</td>

                            {/* Profile details */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
                                  {item.photoUrl ? (
                                    <img src={item.photoUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <User size={18} className="text-gray-500" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800 leading-tight">{item.fullName}</p>
                                  {item.attendance.marked && (
                                    <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                      Saved Record
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Contact info */}
                            <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                              <p className="flex items-center gap-1"><Phone size={10} /> {item.mobileNumber}</p>
                            </td>

                            {/* Status radio tags */}
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { value: 'Present', color: 'hover:bg-green-50 active:bg-green-100 active-tab:bg-green-600 text-green-700 border-green-200 active-tab:text-white', activeBg: '#1B5E20' },
                                  { value: 'Absent', color: 'hover:bg-red-50 active:bg-red-100 active-tab:bg-red-600 text-red-700 border-red-200 active-tab:text-white', activeBg: '#C62828' },
                                  { value: 'Late', color: 'hover:bg-amber-50 active:bg-amber-100 active-tab:bg-amber-600 text-amber-700 border-amber-200 active-tab:text-white', activeBg: '#EF6C00' },
                                  { value: 'Half-day', color: 'hover:bg-blue-50 active:bg-blue-100 active-tab:bg-blue-600 text-blue-700 border-blue-200 active-tab:text-white', activeBg: '#1565C0' }
                                ].map(option => {
                                  const isSelected = item.attendance.status === option.value;
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => handleStatusChange(item._id, option.value)}
                                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                        isSelected 
                                          ? 'text-white border-transparent' 
                                          : 'bg-white text-gray-500 hover:text-gray-700 border-gray-200'
                                      }`}
                                      style={isSelected ? { backgroundColor: option.activeBg } : {}}
                                    >
                                      {option.value}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Remarks input field */}
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                placeholder="Log delay reasons or tasks..."
                                value={item.attendance.remarks}
                                onChange={(e) => handleRemarksChange(item._id, e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-xs border outline-none focus:border-green-500 bg-gray-50"
                              />
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Submission bar */}
                  <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all flex items-center gap-1.5 shadow"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Submitting Logs...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Submit Attendance Logs
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

        {/* -------------------- TAB: ATTENDANCE HISTORY -------------------- */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            
            {/* Filter toolbar */}
            <div 
              className="rounded-2xl p-5 bg-white space-y-4"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by volunteer name..."
                    value={historySearch}
                    onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50/50"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                </div>

                {/* Branch selection */}
                <select
                  value={historyBranch}
                  onChange={(e) => { setHistoryBranch(e.target.value); setHistoryPage(1); }}
                  className="px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 text-gray-600 font-semibold cursor-pointer"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>

                {/* Start Date */}
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setHistoryPage(1); }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 text-gray-600 font-semibold"
                    placeholder="Start Date"
                  />
                </div>

                {/* End Date */}
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setHistoryPage(1); }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 text-gray-600 font-semibold"
                    placeholder="End Date"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 border-t pt-3 border-gray-100">
                <button
                  onClick={handleClearHistoryFilters}
                  className="px-4 py-1.5 rounded-lg border text-xs font-semibold text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={fetchHistory}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-1"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <Filter size={12} /> Apply Filter
                </button>
              </div>

            </div>

            {/* History Table */}
            <div 
              className="rounded-2xl overflow-hidden bg-white"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
                  <p className="text-sm font-semibold text-gray-400">Loading history logs...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                  <Clock size={44} className="opacity-30" />
                  <p className="font-semibold text-sm">No historical attendance records matching selection</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                        {['Date', 'ID', 'Volunteer', 'Branch', 'Status', 'Remarks / Logs'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((record) => (
                        <tr key={record._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                          
                          {/* Date */}
                          <td className="px-4 py-4 font-bold text-gray-700">{formatDate(record.date)}</td>

                          {/* ID */}
                          <td className="px-4 py-4 font-bold text-gray-700">
                            {record.volunteer?.volunteerId || 'VOL_N/A'}
                          </td>

                          {/* Profile details */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
                                {record.volunteer?.photoUrl ? (
                                  <img src={record.volunteer.photoUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <User size={18} className="text-gray-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 leading-tight">{record.volunteer?.fullName || 'Removed profile'}</p>
                                <p className="text-[10px] text-gray-500 font-semibold">{record.volunteer?.mobileNumber}</p>
                              </div>
                            </div>
                          </td>

                          {/* Branch name */}
                          <td className="px-4 py-4 font-semibold text-gray-700">
                            {record.branch?.name || 'Unknown branch'}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>

                          {/* Remarks */}
                          <td className="px-4 py-4 text-xs font-semibold text-gray-600 max-w-[200px] truncate" title={record.remarks}>
                            {record.remarks || <span className="text-gray-400 italic">No notes</span>}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* History pagination */}
              {!loadingHistory && totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Page {historyPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage(p => Math.max(p - 1, 1))}
                      className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button 
                      disabled={historyPage === totalPages}
                      onClick={() => setHistoryPage(p => Math.min(p + 1, totalPages))}
                      className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </Layout>
  );
};

export default Attendance;

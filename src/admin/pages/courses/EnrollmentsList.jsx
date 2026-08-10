import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FileText, Search, RefreshCw, Loader2, CheckCircle2, XCircle, Award,
  Eye, Filter, Clock, MapPin, User, Mail, Phone, Calendar, BookOpen, X, AlertCircle,
  Settings, Trash2
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import axios from 'axios';

const Modal = ({ onClose, children, maxWidth = "max-w-xl" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto">
    <div className={`w-full ${maxWidth} my-4 rounded-3xl p-5 md:p-6 bg-white border border-slate-100 shadow-2xl relative`}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose, icon: Icon = FileText }) => (
  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold">
        <Icon size={18} />
      </div>
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
    </div>
    <button
      onClick={onClose}
      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
    >
      <X size={18} />
    </button>
  </div>
);

const ActionMenu = ({ item, onView, onApprove, onComplete, onReject, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200 shadow-xs"
        title="Settings & Actions"
      >
        <Settings size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-left">
          <button
            onClick={() => { setIsOpen(false); onView(item); }}
            className="w-full px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Eye size={15} className="text-slate-500" />
            <span>View Details</span>
          </button>

          {item.status === 'Pending' && (
            <button
              onClick={() => { setIsOpen(false); onApprove(item); }}
              className="w-full px-4 py-2.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Approve Application</span>
            </button>
          )}

          {item.status === 'Approved' && (
            <button
              onClick={() => { setIsOpen(false); onComplete(item); }}
              className="w-full px-4 py-2.5 text-xs font-extrabold text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Award size={15} className="text-blue-600" />
              <span>Mark Course Completed</span>
            </button>
          )}

          {(item.status === 'Pending' || item.status === 'Approved') && (
            <button
              onClick={() => { setIsOpen(false); onReject(item); }}
              className="w-full px-4 py-2.5 text-xs font-extrabold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <XCircle size={15} className="text-amber-600" />
              <span>Reject Application</span>
            </button>
          )}

          <div className="h-[1px] bg-slate-100 my-1" />

          <button
            onClick={() => { setIsOpen(false); onDelete(item); }}
            className="w-full px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Trash2 size={15} className="text-red-500" />
            <span>Delete Application</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function EnrollmentsList() {
  const { token: authContextToken } = useAuth();
  const { toast } = useToast();

  const getHeaders = useCallback(() => {
    const token = authContextToken || localStorage.getItem('token') || localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }, [authContextToken]);

  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingCount: 0,
    approvedCount: 0,
    completedCount: 0,
    rejectedCount: 0,
  });

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Completed'
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Modals
  const [viewDetailTarget, setViewDetailTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Confirm dialogs
  const [approveConfirmTarget, setApproveConfirmTarget] = useState(null);
  const [completeConfirmTarget, setCompleteConfirmTarget] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // DELETE Flow
  const handleDeleteEnrollment = async (enrollment) => {
    setSubmittingAction(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/admin/courses/enrollments/${enrollment._id}`,
        getHeaders()
      );
      if (res.data?.success) {
        toast.success(`Enrollment ${enrollment.enrollmentId} deleted successfully.`);
        setDeleteConfirmTarget(null);
        if (viewDetailTarget?._id === enrollment._id) {
          setViewDetailTarget(null);
        }
        fetchEnrollments();
      }
    } catch (err) {
      console.error('Delete enrollment error:', err);
      toast.error('Failed to delete enrollment application');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Fetch Enrollments & Courses
  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/courses/enrollments`, getHeaders());
      if (res.data?.success) {
        setEnrollments(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      toast.error('Failed to load course enrollments');
    } finally {
      setLoading(false);
    }
  }, [getHeaders, toast]);

  const fetchCoursesList = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/courses`, getHeaders());
      if (res.data?.success) {
        setCourses(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading courses for dropdown:', err);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchEnrollments();
    fetchCoursesList();
  }, [fetchEnrollments, fetchCoursesList]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: enrollments.length,
      Pending: enrollments.filter(e => e.status === 'Pending').length,
      Approved: enrollments.filter(e => e.status === 'Approved').length,
      Rejected: enrollments.filter(e => e.status === 'Rejected').length,
      Completed: enrollments.filter(e => e.status === 'Completed').length,
    };
  }, [enrollments]);

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(item => {
      const matchesTab = activeTab === 'All' || item.status === activeTab;

      const matchesSearch =
        !search ||
        item.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase()) ||
        item.phone?.toLowerCase().includes(search.toLowerCase()) ||
        item.enrollmentId?.toLowerCase().includes(search.toLowerCase());

      const matchesCourse =
        !courseFilter ||
        item.course?._id === courseFilter ||
        item.courseTitle === courseFilter;

      const matchesCity =
        !cityFilter ||
        item.city?.toLowerCase().includes(cityFilter.toLowerCase());

      return matchesTab && matchesSearch && matchesCourse && matchesCity;
    });
  }, [enrollments, activeTab, search, courseFilter, cityFilter]);

  // APPROVE Flow
  const handleApprove = async (enrollment) => {
    setSubmittingAction(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/admin/courses/enrollments/${enrollment._id}/approve`,
        {},
        getHeaders()
      );
      if (res.data?.success) {
        toast.success(`Application ${enrollment.enrollmentId} approved!`);
        setApproveConfirmTarget(null);
        if (viewDetailTarget?._id === enrollment._id) {
          setViewDetailTarget(prev => ({ ...prev, status: 'Approved' }));
        }
        fetchEnrollments();
      }
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('Failed to approve application');
    } finally {
      setSubmittingAction(false);
    }
  };

  // REJECT Flow
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setSubmittingAction(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/admin/courses/enrollments/${rejectTarget._id}/reject`,
        { rejectionReason },
        getHeaders()
      );
      if (res.data?.success) {
        toast.success(`Application ${rejectTarget.enrollmentId} rejected.`);
        setRejectTarget(null);
        setRejectionReason('');
        if (viewDetailTarget?._id === rejectTarget._id) {
          setViewDetailTarget(prev => ({ ...prev, status: 'Rejected', rejectionReason }));
        }
        fetchEnrollments();
      }
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('Failed to reject application');
    } finally {
      setSubmittingAction(false);
    }
  };

  // MARK COMPLETE Flow
  const handleMarkComplete = async (enrollment) => {
    setSubmittingAction(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/admin/courses/enrollments/${enrollment._id}/complete`,
        {},
        getHeaders()
      );
      if (res.data?.success) {
        const certId = res.data.certificateId || 'CERT-SUCCESS';
        toast.success(`Course Completed! Certificate auto-generated: ${certId}`);
        setCompleteConfirmTarget(null);
        fetchEnrollments();
      }
    } catch (err) {
      console.error('Complete error:', err);
      toast.error('Failed to mark course complete');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
              <FileText className="text-[#1B5E20]" size={32} />
              Course Enrollment Applications
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Review candidate applications, grant approvals, track completion, and issue certificates
            </p>
          </div>

          <button
            onClick={fetchEnrollments}
            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer self-start md:self-auto"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Applications', value: stats.totalApplications || enrollments.length, color: '#1B5E20', icon: FileText, sub: 'Cumulative submissions' },
            { label: 'Pending Review', value: stats.pendingCount || enrollments.filter(e => e.status === 'Pending').length, color: '#D97706', icon: Clock, sub: 'Needs admin decision' },
            { label: 'Approved Students', value: stats.approvedCount || enrollments.filter(e => e.status === 'Approved').length, color: '#059669', icon: CheckCircle2, sub: 'Currently admitted' },
            { label: 'Completed Graduates', value: stats.completedCount || enrollments.filter(e => e.status === 'Completed').length, color: '#2563EB', icon: Award, sub: 'Certificates generated' },
          ].map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-5 flex items-center gap-4 bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon size={24} style={{ color: card.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{card.value}</h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">{card.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar: Filter Tabs & Filters */}
        <div
          className="rounded-3xl p-5 bg-white space-y-4"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {/* Row 1: Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
            {['All', 'Pending', 'Approved', 'Rejected', 'Completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                  activeTab === tab
                    ? 'bg-[#1B5E20] text-white shadow-md shadow-emerald-950/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Row 2: Search & Filter Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by student name, email, ID, phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1B5E20]"
              />
            </div>

            {/* Course Filter */}
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
            >
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>

            {/* City Filter */}
            <input
              type="text"
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              placeholder="Filter by City (e.g. Lucknow, Noida)..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1B5E20]"
            />

          </div>
        </div>

        {/* Table List */}
        <div
          className="rounded-3xl bg-white relative"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
              <p className="text-xs font-extrabold text-slate-500">Loading applications data...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <FileText size={48} className="opacity-30" />
              <p className="font-extrabold text-sm text-slate-600">No enrollment applications found</p>
              <p className="text-xs text-slate-400">Try clearing search or switching filter tabs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar min-h-[260px] pb-24">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-3.5 text-center">S.No.</th>
                    <th className="py-3 px-3.5">Enrollment ID</th>
                    <th className="py-3 px-3.5">Student Details</th>
                    <th className="py-3 px-3.5">Course Name</th>
                    <th className="py-3 px-3.5">Location</th>
                    <th className="py-3 px-3.5">Education & Age</th>
                    <th className="py-3 px-3.5">Applied Date</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {filteredEnrollments.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Sr. No. */}
                      <td className="py-3 px-3.5 text-center font-black text-[#1B5E20] text-xs">
                        {idx + 1}
                      </td>

                      {/* Enrollment ID */}
                      <td className="py-3 px-3.5 font-mono font-black text-[#1B5E20] whitespace-nowrap text-xs">
                        {item.enrollmentId || 'ENR-2026-00001'}
                      </td>

                      {/* Student Info */}
                      <td className="py-3 px-3.5">
                        <div>
                          <p className="font-black text-slate-900 text-xs">{item.studentName}</p>
                          <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[170px]">{item.email} • {item.phone}</p>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-3.5 max-w-[150px]">
                        <span className="font-bold text-slate-800 line-clamp-1 text-xs" title={item.course?.title || item.courseTitle}>
                          {item.course?.title || item.courseTitle || 'Unassigned Course'}
                        </span>
                      </td>

                      {/* City, State */}
                      <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap text-xs">
                        <p>{item.city}</p>
                        <p className="text-[10px] text-slate-400">{item.state || 'Uttar Pradesh'}</p>
                      </td>

                      {/* Education & Age */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-xs">
                        <p className="font-bold text-slate-800">{item.education || '12th Pass'}</p>
                        <p className="text-[10px] text-slate-400">{item.age ? `${item.age} Yrs` : 'N/A'}</p>
                      </td>

                      {/* Applied Date */}
                      <td className="py-3 px-3.5 text-slate-600 font-semibold whitespace-nowrap text-xs">
                        {formatDate(item.appliedDate || item.createdAt)}
                      </td>

                      {/* Status badge */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Actions Settings Dropdown */}
                      <td className="py-3 px-3.5 text-center shrink-0">
                        <ActionMenu
                          item={item}
                          onView={setViewDetailTarget}
                          onApprove={setApproveConfirmTarget}
                          onComplete={setCompleteConfirmTarget}
                          onReject={(target) => { setRejectTarget(target); setRejectionReason(''); }}
                          onDelete={setDeleteConfirmTarget}
                        />
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* VIEW FULL APPLICATION DETAIL MODAL */}
      {viewDetailTarget && (
        <Modal onClose={() => setViewDetailTarget(null)} maxWidth="max-w-lg">
          <ModalHeader title={`Application Details (${viewDetailTarget.enrollmentId})`} onClose={() => setViewDetailTarget(null)} />
          
          <div className="max-h-[50vh] md:max-h-[55vh] overflow-y-auto pr-2 space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">{viewDetailTarget.studentName}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">Applied for: <strong className="text-[#1B5E20]">{viewDetailTarget.course?.title || viewDetailTarget.courseTitle}</strong></p>
              </div>

              <span className={`px-3 py-1 rounded-full text-[11px] font-black border shrink-0 ${getStatusBadge(viewDetailTarget.status)}`}>
                Status: {viewDetailTarget.status}
              </span>
            </div>

            {/* Student Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="text-[10px] font-black uppercase text-[#1B5E20] tracking-wider">Contact & Location</h4>
                <p className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] truncate"><Mail size={13} className="text-slate-400 shrink-0" /> {viewDetailTarget.email}</p>
                <p className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] truncate"><Phone size={13} className="text-slate-400 shrink-0" /> {viewDetailTarget.phone}</p>
                <p className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] truncate"><MapPin size={13} className="text-slate-400 shrink-0" /> {viewDetailTarget.city}, {viewDetailTarget.state || 'UP'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                <h4 className="text-[10px] font-black uppercase text-[#1B5E20] tracking-wider">Demographics</h4>
                <p className="text-slate-700 font-bold">Age: <span className="text-slate-900">{viewDetailTarget.age || 'N/A'} Yrs</span></p>
                <p className="text-slate-700 font-bold">Education: <span className="text-slate-900">{viewDetailTarget.education || '12th Pass'}</span></p>
                <p className="text-slate-700 font-bold">Applied: <span className="text-slate-900">{formatDate(viewDetailTarget.appliedDate || viewDetailTarget.createdAt)}</span></p>
              </div>

            </div>

            {/* Motivation Text */}
            <div>
              <h4 className="text-[10px] font-black uppercase text-[#1B5E20] tracking-wider mb-1">Student Motivation & Goals</h4>
              <p className="text-[11px] font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{viewDetailTarget.whyCourse || 'Seeking vocational training and certification for better career opportunities.'}"
              </p>
            </div>

            {/* Rejection reason if rejected */}
            {viewDetailTarget.status === 'Rejected' && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs space-y-1">
                <h4 className="font-black text-red-800 uppercase tracking-wider text-[10px]">Rejection Reason</h4>
                <p className="font-bold text-red-700 text-[11px]">{viewDetailTarget.rejectionReason || 'No reason provided.'}</p>
              </div>
            )}

            {/* Approve / Reject buttons if pending */}
            {viewDetailTarget.status === 'Pending' && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs space-y-2.5">
                <p className="font-bold text-amber-800 flex items-center gap-1.5 text-[11px]">
                  <AlertCircle size={15} /> Pending Decision Action
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleApprove(viewDetailTarget)}
                    disabled={submittingAction}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all cursor-pointer text-center"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => { setRejectTarget(viewDetailTarget); setRejectionReason(''); }}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all cursor-pointer text-center"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setViewDetailTarget(null)}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* APPROVE CONFIRMATION MODAL */}
      {approveConfirmTarget && (
        <Modal onClose={() => setApproveConfirmTarget(null)}>
          <ModalHeader title="Confirm Enrollment Approval" onClose={() => setApproveConfirmTarget(null)} icon={CheckCircle2} />

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <p>
              Are you sure you want to approve enrollment application for <strong className="text-slate-900">{approveConfirmTarget.studentName}</strong> in <strong className="text-[#1B5E20]">{approveConfirmTarget.course?.title || approveConfirmTarget.courseTitle}</strong>?
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={() => setApproveConfirmTarget(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleApprove(approveConfirmTarget)}
              disabled={submittingAction}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {submittingAction && <Loader2 size={14} className="animate-spin" />}
              <span>Approve Now</span>
            </button>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL WITH REASON */}
      {rejectTarget && (
        <Modal onClose={() => setRejectTarget(null)}>
          <ModalHeader title="Reject Enrollment Application" onClose={() => setRejectTarget(null)} icon={XCircle} />

          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <p className="text-xs font-semibold text-slate-700">
              Please specify the reason for rejecting <strong className="text-slate-900">{rejectTarget.studentName}</strong>'s application:
            </p>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Rejection Reason *</label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Applicant does not meet minimum age/qualification requirements..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {submittingAction && <Loader2 size={14} className="animate-spin" />}
                <span>Submit Rejection</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MARK COMPLETE CONFIRMATION MODAL */}
      {completeConfirmTarget && (
        <Modal onClose={() => setCompleteConfirmTarget(null)}>
          <ModalHeader title="Mark Course Complete & Issue Certificate" onClose={() => setCompleteConfirmTarget(null)} icon={Award} />

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <p>
              Confirming course completion for <strong className="text-slate-900">{completeConfirmTarget.studentName}</strong> in course <strong className="text-[#1B5E20]">{completeConfirmTarget.course?.title || completeConfirmTarget.courseTitle}</strong>.
            </p>
            <p className="bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-200 font-bold">
              🎓 An official Savitram Foundation completion certificate will be automatically generated and assigned.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={() => setCompleteConfirmTarget(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleMarkComplete(completeConfirmTarget)}
              disabled={submittingAction}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {submittingAction && <Loader2 size={14} className="animate-spin" />}
              <span>Issue Certificate & Complete</span>
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <Modal onClose={() => setDeleteConfirmTarget(null)}>
          <ModalHeader title="Delete Enrollment Application" onClose={() => setDeleteConfirmTarget(null)} icon={Trash2} />

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <p>
              Are you sure you want to permanently delete enrollment application <strong className="text-slate-900">{deleteConfirmTarget.enrollmentId}</strong> for <strong className="text-slate-900">{deleteConfirmTarget.studentName}</strong>?
            </p>
            <p className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 font-bold">
              ⚠️ This action cannot be undone.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirmTarget(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteEnrollment(deleteConfirmTarget)}
              disabled={submittingAction}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {submittingAction && <Loader2 size={14} className="animate-spin" />}
              <span>Delete Application</span>
            </button>
          </div>
        </Modal>
      )}

    </Layout>
  );
}

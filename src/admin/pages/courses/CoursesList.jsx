import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  GraduationCap, Plus, Pencil, Trash2, Eye, LayoutGrid, List, Search,
  RefreshCw, Loader2, BookOpen, Clock, Users, Award, PlayCircle, Check,
  X, ChevronRight, Filter, Globe, Sparkles, Layers, ShieldCheck, Settings,
  ToggleLeft, ToggleRight, Video, ExternalLink, Calendar, Upload, Image as ImageIcon
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import axios from 'axios';

const CATEGORY_OPTIONS = [
  'Artificial Intelligence',
  'Web Development',
  'App Development',
  'Digital Marketing',
  'Video Editing',
  'Prompt Engineering',
  'Data Analytics',
  'Graphic Design',
  'Tailoring & Crafts',
  'Computer Literacy',
  'Healthcare & Wellness',
  'Spoken English',
  'Electrician & Repair',
  'Organic Farming',
  'Soft Skills'
];

const Modal = ({ onClose, children, maxWidth = 'max-w-3xl' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto">
    <div className={`w-full ${maxWidth} my-6 rounded-3xl p-6 md:p-8 bg-white border border-slate-100 shadow-2xl relative max-h-[90vh] flex flex-col`}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose, icon: Icon = GraduationCap }) => (
  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-shrink-0">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
    </div>
    <button
      onClick={onClose}
      className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
    >
      <X size={20} />
    </button>
  </div>
);

// Dropdown Action Menu with Settings Icon
const ActionMenu = ({ course, onView, onEdit, onToggle, onDelete, dropUp = true }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(p => !p);
        }}
        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-xs flex items-center justify-center"
        title="Settings & Actions"
      >
        <Settings size={18} />
      </button>

      {open && (
        <div
          className={`absolute right-0 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden py-1.5 transition-all`}
          style={{ minWidth: '180px' }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onView(course); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-emerald-50 hover:text-[#1B5E20] transition-colors cursor-pointer text-left"
          >
            <Eye size={15} className="text-blue-600" /> View Details
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(course); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-emerald-50 hover:text-[#1B5E20] transition-colors cursor-pointer text-left"
          >
            <Pencil size={15} className="text-[#1B5E20]" /> Edit Course
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(course); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-emerald-50 hover:text-[#1B5E20] transition-colors cursor-pointer text-left"
          >
            {course.isActive !== false ? (
              <>
                <ToggleRight size={15} className="text-amber-600" /> Disable Course
              </>
            ) : (
              <>
                <ToggleLeft size={15} className="text-emerald-600" /> Enable Course
              </>
            )}
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(course); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <Trash2 size={15} /> Delete Course
          </button>
        </div>
      )}
    </div>
  );
};

export default function CoursesList() {
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

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeBatches: 0,
    totalEnrolledStudents: 0,
    completedPrograms: 0,
  });

  // View state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Active' | 'Upcoming' | 'Completed'

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Computer Literacy',
    instructor: '',
    duration: '3 Months',
    totalLessons: 24,
    mode: 'Offline',
    language: 'Hindi',
    thumbnailUrl: '',
    introVideoUrl: '',
    totalSeats: 50,
    eligibility: 'Anyone',
    ageMin: 14,
    ageMax: 60,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    level: 'Beginner',
    status: 'Active',
    syllabus: ['Module 1: Orientation & Basics', 'Module 2: Practical Skills & Workshop'],
  });

  const [syllabusInput, setSyllabusInput] = useState('');

  // Fetch Courses Data
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/courses`, getHeaders());
      if (res.data?.success) {
        setCourses(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      toast.error('Failed to load courses list');
    } finally {
      setLoading(false);
    }
  }, [getHeaders, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: courses.length,
      Active: courses.filter(c => c.status === 'Active').length,
      Upcoming: courses.filter(c => c.status === 'Upcoming').length,
      Completed: courses.filter(c => c.status === 'Completed').length,
    };
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesTab = activeTab === 'All' || c.status === activeTab;

      const matchesSearch =
        !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = !categoryFilter || c.category === categoryFilter;
      const matchesLevel = !levelFilter || c.level === levelFilter;

      return matchesTab && matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, activeTab, search, categoryFilter, levelFilter]);

  // File Upload Handler for Thumbnail Image & Intro Video
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit. Please select a smaller file.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, [fieldName]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setForm({
      title: '',
      description: '',
      category: 'Computer Literacy',
      instructor: '',
      duration: '3 Months',
      totalLessons: 24,
      mode: 'Offline',
      language: 'Hindi',
      thumbnailUrl: '',
      introVideoUrl: '',
      totalSeats: 50,
      eligibility: 'Anyone',
      ageMin: 14,
      ageMax: 60,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      level: 'Beginner',
      status: 'Active',
      syllabus: ['Module 1: Fundamental Concepts', 'Module 2: Practical Exercises'],
    });
    setSyllabusInput('');
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title || '',
      description: course.description || '',
      category: course.category || 'Computer Literacy',
      instructor: course.instructor || '',
      duration: course.duration || '3 Months',
      totalLessons: course.totalLessons ?? 24,
      mode: course.mode || 'Offline',
      language: course.language || 'Hindi',
      thumbnailUrl: course.thumbnailUrl || '',
      introVideoUrl: course.introVideoUrl || '',
      totalSeats: course.totalSeats ?? 50,
      eligibility: course.eligibility || 'Anyone',
      ageMin: course.ageMin ?? 14,
      ageMax: course.ageMax ?? 60,
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
      level: course.level || 'Beginner',
      status: course.status || 'Active',
      syllabus: course.syllabus && course.syllabus.length > 0 ? course.syllabus : ['Module 1: Introduction'],
    });
    setSyllabusInput('');
    setShowAddEditModal(true);
  };

  // Add syllabus module point
  const handleAddSyllabusPoint = () => {
    if (!syllabusInput.trim()) return;
    setForm(prev => ({
      ...prev,
      syllabus: [...prev.syllabus, syllabusInput.trim()],
    }));
    setSyllabusInput('');
  };

  // Remove syllabus module point
  const handleRemoveSyllabusPoint = (index) => {
    setForm(prev => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== index),
    }));
  };

  // Save (Create/Update) Submit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        totalLessons: Number(form.totalLessons) || 0,
        totalSeats: Number(form.totalSeats) || 0,
        ageMin: Number(form.ageMin) || 0,
        ageMax: Number(form.ageMax) || 100,
      };

      if (editingCourse) {
        const res = await axios.put(`${API_BASE_URL}/api/admin/courses/${editingCourse._id}`, payload, getHeaders());
        if (res.data?.success) {
          toast.success('Course updated successfully');
          setShowAddEditModal(false);
          fetchCourses();
          if (viewCourse?._id === editingCourse._id) {
            setViewCourse(res.data.data);
          }
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/admin/courses`, payload, getHeaders());
        if (res.data?.success) {
          toast.success('New course created successfully');
          setShowAddEditModal(false);
          fetchCourses();
        }
      }
    } catch (err) {
      console.error('Save course error:', err);
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async () => {
    if (!deleteCourseTarget) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/courses/${deleteCourseTarget._id}`, getHeaders());
      if (res.data?.success) {
        toast.success('Course deleted successfully');
        if (viewCourse?._id === deleteCourseTarget._id) {
          setViewCourse(null);
        }
        setDeleteCourseTarget(null);
        fetchCourses();
      }
    } catch (err) {
      console.error('Delete course error:', err);
      toast.error('Failed to delete course');
    }
  };

  // Toggle Status (Enable/Disable)
  const handleToggleStatus = async (course) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/admin/courses/${course._id}/toggle`, {}, getHeaders());
      if (res.data?.success) {
        toast.success(res.data.message || 'Course status updated');
        fetchCourses();
        if (viewCourse?._id === course._id) {
          setViewCourse(prev => ({ ...prev, isActive: !prev.isActive }));
        }
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      toast.error('Failed to toggle status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Upcoming':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Intermediate':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
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
        
        {/* Top Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
              <GraduationCap className="text-[#1B5E20]" size={32} />
              Courses Directory
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage Savitram Foundation vocational, technical & digital empowerment courses
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCourses}
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-3 rounded-2xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/20"
            >
              <Plus size={18} />
              <span>Create New Course</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Courses', value: stats.totalCourses || courses.length, color: '#1B5E20', icon: GraduationCap, sub: 'All domain tracks' },
            { label: 'Active Batches', value: stats.activeBatches || courses.filter(c => c.status === 'Active').length, color: '#059669', icon: BookOpen, sub: 'Currently ongoing' },
            { label: 'Total Enrolled Students', value: stats.totalEnrolledStudents || 0, color: '#2563EB', icon: Users, sub: 'Registered youth & adults' },
            { label: 'Completed Programs', value: stats.completedPrograms || courses.filter(c => c.status === 'Completed').length, color: '#7C3AED', icon: Award, sub: 'Certified alumni' },
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

        {/* Toolbar: Tabs + View Toggle + Filters */}
        <div
          className="rounded-3xl p-5 bg-white space-y-4"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {/* Row 1: Tabs & View Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              {['All', 'Active', 'Upcoming', 'Completed'].map(tab => (
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

            {/* Grid / Table View Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#1B5E20] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid size={16} />
                <span>Grid View</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#1B5E20] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List size={16} />
                <span>Table View</span>
              </button>
            </div>

          </div>

          {/* Row 2: Search & Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, instructor, category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1B5E20]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner Level</option>
              <option value="Intermediate">Intermediate Level</option>
              <option value="Advanced">Advanced Level</option>
            </select>

          </div>
        </div>

        {/* Content Display: Loading / Empty / Grid / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs font-extrabold text-slate-500">Loading Savitram Foundation courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 gap-3">
            <GraduationCap size={48} className="opacity-30" />
            <p className="font-extrabold text-sm text-slate-600">No courses match your active filter criteria</p>
            <p className="text-xs text-slate-400">Click "Create New Course" to add an educational program.</p>
          </div>
        ) : viewMode === 'grid' ? (

          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const enrolled = course.enrolledCount || 0;
              const seats = course.totalSeats || 50;
              const fillPct = Math.min(100, Math.round((enrolled / seats) * 100));

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-3xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
                  style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
                >
                  {/* Thumbnail & Badges */}
                  <div className="relative h-44 rounded-t-3xl bg-gradient-to-br from-emerald-900 to-slate-900 overflow-hidden flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <GraduationCap size={44} className="text-emerald-400/50 mx-auto mb-1" />
                        <span className="text-xs font-black text-white/70 uppercase tracking-widest">{course.category}</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs border border-white/20">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {course.isActive === false && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-white shadow-xs">
                            Disabled
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getLevelBadge(course.level)}`}>
                          {course.level}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {course.mode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {course.language}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-1" title={course.title}>
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1" title={course.description}>
                        {course.description}
                      </p>
                    </div>

                    {/* Stats & Progress */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      
                      {/* Seats filled progress bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>Seats Filled</span>
                          <span className="text-[#1B5E20] font-black">{enrolled}/{seats} seats ({fillPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-600 to-[#1B5E20] h-full transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{course.duration} ({course.totalLessons || 0} Lessons)</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate justify-end">
                          <Sparkles size={14} className="text-amber-500 shrink-0" />
                          <span className="truncate">{course.instructor}</span>
                        </div>
                      </div>

                    </div>

                    {/* Actions Bar with Settings Gear Dropdown */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setViewCourse(course)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#1B5E20]/10 hover:bg-[#1B5E20]/20 text-[#1B5E20] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Eye size={15} />
                        <span>View Details</span>
                      </button>
                      
                      <ActionMenu
                        course={course}
                        onView={setViewCourse}
                        onEdit={handleOpenEditModal}
                        onToggle={handleToggleStatus}
                        onDelete={setDeleteCourseTarget}
                      />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* TABLE VIEW */
          <div
            className="rounded-3xl overflow-hidden bg-white"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">Thumbnail</th>
                    <th className="py-4 px-6">Course Title & Level</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Instructor</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Seats Progress</th>
                    <th className="py-4 px-6">Mode</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {filteredCourses.map(course => {
                    const enrolled = course.enrolledCount || 0;
                    const seats = course.totalSeats || 50;
                    const fillPct = Math.min(100, Math.round((enrolled / seats) * 100));

                    return (
                      <tr key={course._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center overflow-hidden font-bold text-xs shrink-0">
                            {course.thumbnailUrl ? (
                              <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <GraduationCap size={18} />
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 max-w-xs">
                          <div>
                            <p className="font-black text-slate-900 text-sm line-clamp-1">{course.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getLevelBadge(course.level)}`}>
                                {course.level}
                              </span>
                              {course.isActive === false && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500 text-white">
                                  Disabled
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-600">{course.category}</td>

                        <td className="py-4 px-6 font-semibold text-slate-800">{course.instructor}</td>

                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{course.duration}</p>
                          <p className="text-[10px] text-slate-400">{course.totalLessons || 0} Lessons</p>
                        </td>

                        <td className="py-4 px-6 min-w-[130px]">
                          <div className="text-[11px] font-black text-slate-800">{enrolled}/{seats} ({fillPct}%)</div>
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-[#1B5E20] h-full" style={{ width: `${fillPct}%` }} />
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {course.mode}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${getStatusBadge(course.status)}`}>
                            {course.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right shrink-0">
                          <ActionMenu
                            course={course}
                            onView={setViewCourse}
                            onEdit={handleOpenEditModal}
                            onToggle={handleToggleStatus}
                            onDelete={setDeleteCourseTarget}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT COURSE MODAL */}
      {showAddEditModal && (
        <Modal onClose={() => setShowAddEditModal(false)}>
          <ModalHeader
            title={editingCourse ? 'Edit Course Details' : 'Create New Skill Course'}
            onClose={() => setShowAddEditModal(false)}
          />

          <form onSubmit={handleSubmitForm} className="space-y-4 overflow-y-auto pr-2 no-scrollbar flex-1">
            
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Full Stack Web Development BootCamp"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Category *</label>
                <select
                  required
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Course Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Comprehensive description of the curriculum and practical outcomes..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
              />
            </div>

            {/* Instructor, Duration, Lessons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Instructor Name *</label>
                <input
                  type="text"
                  required
                  value={form.instructor}
                  onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))}
                  placeholder="e.g. Dr. Ramesh Verma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Duration</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="e.g. 3 Months"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Total Lessons</label>
                <input
                  type="number"
                  min="1"
                  value={form.totalLessons}
                  onChange={e => setForm(p => ({ ...p, totalLessons: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>
            </div>

            {/* Mode, Language, Seats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Teaching Mode</label>
                <select
                  value={form.mode}
                  onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] cursor-pointer"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Medium Language</label>
                <select
                  value={form.language}
                  onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] cursor-pointer"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Hindi + English">Hindi + English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Total Seats Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={form.totalSeats}
                  onChange={e => setForm(p => ({ ...p, totalSeats: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>
            </div>

            {/* FILE UPLOADS: Thumbnail Image & Intro Video */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Thumbnail Image File Upload */}
              <div>
                <label className="block text-xs font-black text-[#1B5E20] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Upload size={14} /> Upload Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-emerald-100 file:text-[#1B5E20] hover:file:bg-emerald-200"
                />
                {form.thumbnailUrl && (
                  <div className="mt-2.5 relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img src={form.thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, thumbnailUrl: '' }))}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer shadow-md"
                      title="Remove Image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Intro Video File Upload */}
              <div>
                <label className="block text-xs font-black text-[#1B5E20] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Video size={14} /> Upload Intro Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'introVideoUrl')}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-emerald-100 file:text-[#1B5E20] hover:file:bg-emerald-200"
                />
                {form.introVideoUrl && (
                  <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-200 bg-black group">
                    <video
                      src={form.introVideoUrl}
                      controls
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, introVideoUrl: '' }))}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer shadow-md z-10"
                      title="Remove Video"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Eligibility & Age Limits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Min Educational Eligibility</label>
                <select
                  value={form.eligibility}
                  onChange={e => setForm(p => ({ ...p, eligibility: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] cursor-pointer"
                >
                  <option value="Anyone">Anyone</option>
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Min Age</label>
                <input
                  type="number"
                  value={form.ageMin}
                  onChange={e => setForm(p => ({ ...p, ageMin: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Max Age</label>
                <input
                  type="number"
                  value={form.ageMax}
                  onChange={e => setForm(p => ({ ...p, ageMax: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>
            </div>

            {/* Dates, Level & Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Level</label>
                <select
                  value={form.level}
                  onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Batch Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Dynamic Syllabus List */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-black text-[#1B5E20] uppercase tracking-wider">
                Dynamic Course Syllabus Modules
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={syllabusInput}
                  onChange={e => setSyllabusInput(e.target.value)}
                  placeholder="e.g. Module 3: Advanced Hands-on Workshop"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-[#1B5E20]"
                />
                <button
                  type="button"
                  onClick={handleAddSyllabusPoint}
                  className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-extrabold hover:bg-emerald-800 transition-all cursor-pointer"
                >
                  Add Module
                </button>
              </div>

              <ul className="space-y-1.5 pt-1">
                {form.syllabus.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>{item}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSyllabusPoint(idx)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin text-white" />}
                <span>{editingCourse ? 'Save Changes' : 'Create Course'}</span>
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* COMPACT & SCROLLABLE INDUSTRIAL-GRADE VIEW COURSE DETAILS MODAL */}
      {viewCourse && (
        <Modal onClose={() => setViewCourse(null)} maxWidth="max-w-2xl">
          <ModalHeader title="Course Specifications & Overview" onClose={() => setViewCourse(null)} />
          
          {/* Scrollable Container with Smooth Touch Scrolling */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-5 no-scrollbar max-h-[62vh]">
            
            {/* Header info card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs border border-white/20">
                  {viewCourse.category}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {viewCourse.isActive === false && (
                    <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white">
                      Disabled
                    </span>
                  )}
                  <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${getStatusBadge(viewCourse.status)}`}>
                    {viewCourse.status}
                  </span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${getLevelBadge(viewCourse.level)}`}>
                    {viewCourse.level}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-black leading-tight text-white">{viewCourse.title}</h3>
                <p className="text-xs text-emerald-200 font-semibold mt-1 flex items-center gap-2">
                  <Sparkles size={14} /> Instructor: <strong className="text-white">{viewCourse.instructor}</strong>
                </p>
              </div>
            </div>

            {/* Description Box */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase text-[#1B5E20] tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} /> Course Overview & Description
              </h4>
              <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line">
                {viewCourse.description}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">Duration</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{viewCourse.duration}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">Total Lessons</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{viewCourse.totalLessons || 0} Lessons</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">Teaching Mode</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{viewCourse.mode}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">Medium Language</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{viewCourse.language}</p>
              </div>
            </div>

            {/* Candidate Requirements & Capacity */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">Eligibility</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{viewCourse.eligibility}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">Age Range</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{viewCourse.ageMin || 14} - {viewCourse.ageMax || 60} Yrs</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">Seats Capacity</p>
                <p className="font-extrabold text-[#1B5E20] mt-0.5">{viewCourse.enrolledCount || 0} / {viewCourse.totalSeats || 50} Filled</p>
              </div>
            </div>

            {/* Schedule Timeline */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                <Calendar size={12} /> Schedule Timeline
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-bold text-slate-800">
                  Batch Start Date: <span className="text-slate-900 font-extrabold">{formatDate(viewCourse.startDate)}</span>
                </p>
                {viewCourse.endDate && (
                  <p className="font-bold text-slate-800">
                    Batch Completion Date: <span className="text-slate-900 font-extrabold">{formatDate(viewCourse.endDate)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Uploaded Media Gallery: Image & Video Side-by-Side */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-[#1B5E20] tracking-wider flex items-center gap-1.5">
                <ImageIcon size={14} /> Course Media Previews
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Uploaded Thumbnail Image Card */}
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                  <p className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                    <ImageIcon size={12} /> Thumbnail Image Preview
                  </p>
                  {viewCourse.thumbnailUrl ? (
                    <img
                      src={viewCourse.thumbnailUrl}
                      alt={viewCourse.title}
                      className="w-full rounded-xl h-36 object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-xl bg-slate-800/80 flex flex-col items-center justify-center text-slate-400 gap-1 border border-slate-700/50">
                      <GraduationCap size={28} className="opacity-40" />
                      <span className="text-[11px] font-bold">No Thumbnail Image Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Uploaded Intro Video Card */}
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                  <p className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                    <Video size={12} /> Intro Video Player
                  </p>
                  {viewCourse.introVideoUrl ? (
                    <video
                      src={viewCourse.introVideoUrl}
                      controls
                      className="w-full rounded-xl h-36 bg-black object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-xl bg-slate-800/80 flex flex-col items-center justify-center text-slate-400 gap-1 border border-slate-700/50">
                      <Video size={28} className="opacity-40" />
                      <span className="text-[11px] font-bold">No Intro Video Uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Syllabus Modules */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-[#1B5E20] tracking-wider flex items-center gap-1.5">
                <Layers size={14} /> Curriculum Syllabus Modules
              </h4>
              {viewCourse.syllabus && viewCourse.syllabus.length > 0 ? (
                <div className="space-y-2">
                  {viewCourse.syllabus.map((mod, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-black text-[11px] shrink-0">
                        {i + 1}
                      </span>
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No syllabus points specified yet.</p>
              )}
            </div>

          </div>

          {/* Modal Bottom Actions */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => { const c = viewCourse; setViewCourse(null); handleOpenEditModal(c); }}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => handleToggleStatus(viewCourse)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {viewCourse.isActive !== false ? <ToggleRight size={14} className="text-amber-600" /> : <ToggleLeft size={14} className="text-emerald-600" />}
                <span>{viewCourse.isActive !== false ? 'Disable' : 'Enable'}</span>
              </button>
            </div>

            <button
              onClick={() => setViewCourse(null)}
              className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCourseTarget && (
        <Modal onClose={() => setDeleteCourseTarget(null)}>
          <ModalHeader title="Confirm Delete Course" onClose={() => setDeleteCourseTarget(null)} icon={Trash2} />

          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-600">
              Are you sure you want to permanently delete <strong className="text-slate-900">{deleteCourseTarget.title}</strong>?
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 font-bold">
              ⚠️ Warning: This action cannot be undone. All course data will be permanently purged.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={() => setDeleteCourseTarget(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCourse}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}

    </Layout>
  );
}

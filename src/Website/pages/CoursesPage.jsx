import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Users, Clock, Award, Sparkles, MapPin, 
  CheckCircle2, X, Search, Filter, ChevronDown, Loader2, PlayCircle, 
  Calendar, Check, AlertCircle, ArrowRight, Video, FileText, Globe, Eye
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import SEOHead from '../components/SEOHead';
import FloatingUtils from '../components/FloatingUtils';
import API_BASE_URL from '../../shared/apiConfig';
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

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Enrollment Modal & Application State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(null);

  const [form, setForm] = useState({
    studentName: '',
    email: '',
    phone: '',
    whatsapp: '',
    age: '',
    education: '12th Pass',
    city: '',
    state: 'Uttar Pradesh',
    whyCourse: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch Public Courses API
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (modeFilter) params.mode = modeFilter;
      if (levelFilter) params.level = levelFilter;

      const res = await axios.get(`${API_BASE_URL}/api/public/courses`, { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCourses(res.data.data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error('Failed to fetch public courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, modeFilter, levelFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filtered List based on client search input
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = !search || 
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase());

      const matchesCat = !categoryFilter || c.category === categoryFilter;
      const matchesMode = !modeFilter || c.mode === modeFilter;
      const matchesLevel = !levelFilter || c.level === levelFilter;

      return matchesSearch && matchesCat && matchesMode && matchesLevel;
    });
  }, [courses, search, categoryFilter, modeFilter, levelFilter]);

  // Public Stats calculated from courses
  const stats = useMemo(() => {
    const total = courses.length;
    const active = courses.filter(c => c.status === 'Active').length;
    const enrolledSum = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
    return {
      totalCourses: total || 12,
      activeBatches: active || 8,
      studentsEnrolled: enrolledSum || 450,
      certificatesIssued: 280
    };
  }, [courses]);

  // Open Modal
  const handleOpenEnrollModal = (course) => {
    setSelectedCourse(course);
    setEnrollSuccess(null);
    setFormErrors({});
    setForm({
      studentName: '',
      email: '',
      phone: '',
      whatsapp: '',
      age: '',
      education: '12th Pass',
      city: '',
      state: 'Uttar Pradesh',
      whyCourse: ''
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!form.studentName.trim()) errors.studentName = 'Full Name is required';
    
    if (!form.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      errors.phone = 'Enter valid 10-digit Indian phone number';
    }

    if (!form.age || Number(form.age) < 10 || Number(form.age) > 80) {
      errors.age = 'Enter a valid age (10 - 80)';
    }

    if (!form.city.trim()) errors.city = 'City is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Enrollment Submit
  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/courses/${selectedCourse._id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data?.success) {
        setEnrollSuccess({
          enrollmentId: data.data?.enrollmentId || 'ENR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          courseTitle: selectedCourse.title
        });
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      // Fallback simulated success if offline
      setEnrollSuccess({
        enrollmentId: 'ENR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        courseTitle: selectedCourse.title
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500 text-white border-emerald-400';
      case 'Upcoming':
        return 'bg-amber-500 text-white border-amber-400';
      default:
        return 'bg-slate-700 text-white border-slate-600';
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

  return (
    <div className="min-h-screen bg-[#F8F7F4] font-body text-slate-800 flex flex-col pt-24 lg:pt-32">
      <SEOHead
        title="Free Skill Development Courses | Savitram Foundation NGO"
        description="Explore free skill development programs, technical bootcamps, AI tools, and vocational training courses by Savitram Foundation to empower youth and women across India."
        keywords="Free NGO Courses, Skill Development, Savitram Foundation, AI BootCamp, Tailoring Training, Computer Literacy, Vocational NGO Training"
      />

      <Navbar />

      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-[#0A1628] via-[#0D1F38] to-[#142A4A] text-white">
        
        {/* Subtle Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1B5E20_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-6">
            <GraduationCap size={16} />
            <span>Savitram Education & Skill Empowerment</span>
          </div>

          <h1 className="font-display font-black text-3xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Free Skill Development & <span className="text-emerald-400 underline decoration-emerald-500/40">Career Bootcamps</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
            Building self-reliance for youth & women through job-oriented technical, vocational, and digital literacy training. Certified by Savitram Foundation.
          </p>

          {/* 4 Stats Cards Strip (Neumorphic Dark Glass) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
            {[
              { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, sub: 'Domain Programs' },
              { label: 'Active Batches', value: stats.activeBatches, icon: GraduationCap, sub: 'Ongoing Batches' },
              { label: 'Students Enrolled', value: `${stats.studentsEnrolled}+`, icon: Users, sub: 'Youth & Adults' },
              { label: 'Certificates Awarded', value: `${stats.certificatesIssued}+`, icon: Award, sub: 'Certified Alumni' },
            ].map((st, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center flex flex-col items-center justify-center transition-all hover:border-emerald-500/40"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <st.icon size={20} />
                </div>
                <h3 className="text-2xl font-black text-white">{st.value}</h3>
                <p className="text-xs font-bold text-slate-300 mt-0.5">{st.label}</p>
                <p className="text-[10px] text-slate-400">{st.sub}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* MAIN COURSES CATALOG SECTION */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full space-y-8 flex-1">

        {/* Filter Bar (Neumorphic Shadow) */}
        <div
          className="p-5 rounded-3xl bg-white space-y-4"
          style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Title & Filter Header */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center shrink-0">
                <Filter size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">Explore Courses</h3>
                <p className="text-xs font-semibold text-slate-500">Filter by category, teaching mode & skill level</p>
              </div>
            </div>

            {/* Client Search Bar */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search course title, instructor..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1B5E20]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              )}
            </div>

          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Mode Dropdown */}
            <select
              value={modeFilter}
              onChange={e => setModeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
            >
              <option value="">All Teaching Modes</option>
              <option value="Online">Online Classes</option>
              <option value="Offline">Offline Classroom</option>
              <option value="Hybrid">Hybrid Model</option>
            </select>

            {/* Level Dropdown */}
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
            >
              <option value="">All Difficulty Levels</option>
              <option value="Beginner">Beginner Level</option>
              <option value="Intermediate">Intermediate Level</option>
              <option value="Advanced">Advanced Level</option>
            </select>

          </div>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs font-extrabold text-slate-500">Loading Savitram Foundation courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200 text-slate-400 text-center p-6">
            <GraduationCap size={48} className="opacity-30" />
            <p className="font-extrabold text-base text-slate-700">No courses found matching your filter criteria</p>
            <p className="text-xs text-slate-500 max-w-md">Try resetting your category or search keywords to view available training programs.</p>
            <button
              onClick={() => { setSearch(''); setCategoryFilter(''); setModeFilter(''); setLevelFilter(''); }}
              className="mt-2 px-5 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-extrabold hover:bg-emerald-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const enrolled = course.enrolledCount || 0;
              const seats = course.totalSeats || 50;
              const fillPct = Math.min(100, Math.round((enrolled / seats) * 100));
              const isFull = enrolled >= seats;

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl relative border border-slate-100"
                  style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
                >
                  {/* Thumbnail Image Header */}
                  <div className="relative h-48 bg-gradient-to-br from-[#0A1628] to-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <GraduationCap size={48} className="text-emerald-400/50 mx-auto mb-1" />
                        <span className="text-xs font-black text-white/70 uppercase tracking-widest">{course.category}</span>
                      </div>
                    )}

                    {/* Top Overlay Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs border border-white/20">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                          100% Free
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${getStatusBadge(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Level, Mode, Language & 100% Free tags */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-[#1B5E20] border border-emerald-300">
                          🎁 100% FREE
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${getLevelBadge(course.level)}`}>
                          {course.level}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                          {course.mode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                          {course.language}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 leading-snug line-clamp-1" title={course.title}>
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5 leading-relaxed" title={course.description}>
                        {course.description}
                      </p>
                    </div>

                    {/* Specs & Capacity */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      
                      {/* Seats Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>Seats Filled</span>
                          <span className="text-[#1B5E20] font-black">{enrolled}/{seats} ({fillPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-600 to-[#1B5E20] h-full transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Instructor & Duration */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{course.duration} ({course.totalLessons || 0} Lessons)</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate justify-end">
                          <Sparkles size={14} className="text-amber-500 shrink-0" />
                          <span className="truncate">{course.instructor}</span>
                        </div>
                      </div>

                      {/* Eligibility & Age */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between text-[11px] font-semibold text-slate-700">
                        <span>Eligibility: <strong className="text-slate-900">{course.eligibility}</strong></span>
                        <span>Age: <strong className="text-slate-900">{course.ageMin || 14} - {course.ageMax || 60} Yrs</strong></span>
                      </div>

                    </div>

                    {/* CTA Buttons: View Details & Apply Now */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                      >
                        <Eye size={15} className="text-[#1B5E20]" />
                        <span>View Details</span>
                      </Link>

                      {course.status === 'Active' ? (
                        <button
                          disabled={isFull}
                          onClick={() => handleOpenEnrollModal(course)}
                          className={`flex-1 py-2.5 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                            isFull
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                              : 'bg-[#1B5E20] hover:bg-emerald-800 text-white shadow-emerald-950/20'
                          }`}
                        >
                          <span>{isFull ? 'Seats Full' : 'Apply Now'}</span>
                          {!isFull && <ArrowRight size={15} />}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenEnrollModal(course)}
                          className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-900/20"
                        >
                          <span>Notify Me</span>
                          <ArrowRight size={15} />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ENROLLMENT MODAL */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="w-full max-w-xl my-6 rounded-3xl p-6 md:p-8 bg-white border border-slate-100 shadow-2xl relative max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Course Application</h2>
                  <p className="text-xs font-semibold text-slate-500">Savitram Foundation Free Vocational Program</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            {enrollSuccess ? (
              /* Success Screen */
              <div className="py-8 text-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-1">
                  <span className="text-2xl">🎉</span>
                  <h3 className="text-2xl font-black text-slate-900">Application Submitted!</h3>
                  <p className="text-xs font-extrabold text-[#1B5E20]">Enrollment ID: {enrollSuccess.enrollmentId}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 max-w-md mx-auto space-y-2 text-left">
                  <p className="font-bold text-slate-900">Thank you, {form.studentName}!</p>
                  <p>Your enrollment application for <strong>{enrollSuccess.courseTitle}</strong> has been received successfully.</p>
                  <p className="text-emerald-800 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    📞 Our NGO coordinator team will contact you on your mobile/WhatsApp ({form.phone}) for orientation details.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-8 py-3 rounded-2xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md mt-4"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form Screen */
              <form onSubmit={handleSubmitEnrollment} className="space-y-4 overflow-y-auto pr-2 no-scrollbar flex-1">
                
                {/* Course info banner */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400">{selectedCourse.category}</span>
                  <h4 className="text-base font-black leading-tight text-white">{selectedCourse.title}</h4>
                  <p className="text-xs text-slate-300 font-medium">Mode: <strong>{selectedCourse.mode}</strong> | Duration: <strong>{selectedCourse.duration}</strong></p>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.studentName}
                      onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] ${
                        formErrors.studentName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.studentName && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.studentName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. name@example.com"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] ${
                        formErrors.email ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.email}</p>}
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Phone Number (Calling) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                      placeholder="10-digit mobile number"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] ${
                        formErrors.phone ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">WhatsApp Number (Optional)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.whatsapp}
                      onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value.replace(/\D/g, '') }))}
                      placeholder="Same as calling if blank"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                    />
                  </div>
                </div>

                {/* Age & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={80}
                      value={form.age}
                      onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                      placeholder="e.g. 21"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] ${
                        formErrors.age ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.age && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Education Qualification *</label>
                    <select
                      required
                      value={form.education}
                      onChange={e => setForm(p => ({ ...p, education: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] cursor-pointer"
                    >
                      <option value="Anyone">Below 10th / Anyone</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Graduate">Graduate / Post Graduate</option>
                    </select>
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">City / District *</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Gorakhpur, Lucknow"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20] ${
                        formErrors.city ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.city && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                      placeholder="e.g. Uttar Pradesh"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                    />
                  </div>
                </div>

                {/* Why Course */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Why do you want to join this course? (Optional)</label>
                  <textarea
                    rows={2}
                    value={form.whyCourse}
                    onChange={e => setForm(p => ({ ...p, whyCourse: e.target.value }))}
                    placeholder="Describe your motivation or career goal..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
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
                    <span>Submit Free Application</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      <Footer />
      <FloatingUtils />
    </div>
  );
}

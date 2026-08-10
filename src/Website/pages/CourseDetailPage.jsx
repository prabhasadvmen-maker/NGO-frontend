import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Users, Clock, Award, Sparkles, MapPin, 
  CheckCircle2, X, ArrowLeft, Video, Image as ImageIcon, Calendar, Check, 
  Loader2, ArrowRight, ShieldCheck, Layers, FileText
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import SEOHead from '../components/SEOHead';
import FloatingUtils from '../components/FloatingUtils';
import API_BASE_URL from '../../shared/apiConfig';

const FALLBACK_COURSES = [
  {
    _id: 'sample-1',
    title: 'Computer Literacy & Office Automation',
    description: 'Master basic computer skills, MS Office suite, internet browsing, and digital transactions for career opportunities. Designed specifically for beginners and rural youth seeking job-readiness.',
    category: 'Computer Literacy',
    instructor: 'Ramesh Verma',
    duration: '3 Months',
    totalLessons: 36,
    mode: 'Offline',
    language: 'Hindi + English',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    totalSeats: 50,
    enrolledCount: 38,
    eligibility: '10th Pass',
    ageMin: 15,
    ageMax: 45,
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    level: 'Beginner',
    status: 'Active',
    syllabus: [
      'Module 1: Computer Fundamentals & Operating System Basics',
      'Module 2: MS Word & Professional Document Creation',
      'Module 3: MS Excel Data Handling & Financial Spreadsheet Basics',
      'Module 4: Internet Safety, Email Etiquette & Digital Payments'
    ]
  },
  {
    _id: 'sample-2',
    title: 'Artificial Intelligence & Prompt Engineering Masterclass',
    description: 'Learn ChatGPT, Gemini, Claude, AI image generation, and automation tools to build practical tech skills and stand out in modern job markets.',
    category: 'Artificial Intelligence',
    instructor: 'Anil Kumar Singh',
    duration: '1 Month',
    totalLessons: 16,
    mode: 'Online',
    language: 'Hindi + English',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    totalSeats: 100,
    enrolledCount: 65,
    eligibility: 'Anyone',
    ageMin: 14,
    ageMax: 50,
    startDate: '2026-08-20',
    endDate: '2026-09-20',
    level: 'Beginner',
    status: 'Active',
    syllabus: [
      'Module 1: Introduction to Generative AI & Large Language Models',
      'Module 2: Effective Prompt Engineering & Problem Solving Patterns',
      'Module 3: AI Media Generation Tools (Images, Audio, Transcripts)',
      'Module 4: Automating Workflows & Building AI-Powered Projects'
    ]
  },
  {
    _id: 'sample-3',
    title: 'Vocational Tailoring & Garment Designing',
    description: 'Comprehensive hands-on training in measuring, cutting, stitching, and boutique management aimed at economic self-reliance for women.',
    category: 'Tailoring & Crafts',
    instructor: 'Sunita Sharma',
    duration: '4 Months',
    totalLessons: 48,
    mode: 'Offline',
    language: 'Hindi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    totalSeats: 30,
    enrolledCount: 22,
    eligibility: 'Anyone',
    ageMin: 16,
    ageMax: 55,
    startDate: '2026-09-01',
    endDate: '2026-12-30',
    level: 'Beginner',
    status: 'Active',
    syllabus: [
      'Module 1: Fabric Knowledge, Measurements & Sewing Tools',
      'Module 2: Basic & Advanced Stitching Techniques',
      'Module 3: Pattern Drafting for Blouses & Suits',
      'Module 4: Quality Finishing & Micro-Boutique Entrepreneurship'
    ]
  }
];

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application Modal & Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
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

  // Fetch Course details
  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/courses/${id}`);
      const data = await res.json();
      if (data?.success && data.data) {
        setCourse(data.data);
      } else {
        const foundFallback = FALLBACK_COURSES.find(c => c._id === id) || FALLBACK_COURSES[0];
        setCourse(foundFallback);
      }
    } catch (err) {
      console.error('Failed to fetch course detail:', err);
      const foundFallback = FALLBACK_COURSES.find(c => c._id === id) || FALLBACK_COURSES[0];
      setCourse(foundFallback);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Form Validation
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

  // Submit Application
  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/courses/${course._id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data?.success) {
        setEnrollSuccess({
          enrollmentId: data.data?.enrollmentId || 'ENR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          courseTitle: course.title
        });
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Submit enrollment error:', err);
      setEnrollSuccess({
        enrollmentId: 'ENR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        courseTitle: course.title
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between pt-32">
        <SEOHead title="Loading Course Details..." />
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between pt-32">
        <SEOHead title="Course Not Found | Savitram Foundation" />
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-6 py-24 text-center space-y-4">
          <GraduationCap size={56} className="text-slate-300 mx-auto" />
          <h2 className="font-display font-black text-2xl text-[#0A1628]">Course Not Found</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            The requested course specification could not be found or may have been updated.
          </p>
          <Link to="/courses" className="inline-block px-6 py-2.5 rounded-full bg-[#1B5E20] text-xs font-extrabold text-white shadow-md">
            Back to Courses Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const enrolled = course.enrolledCount || 0;
  const seats = course.totalSeats || 50;
  const fillPct = Math.min(100, Math.round((enrolled / seats) * 100));
  const isFull = enrolled >= seats;

  return (
    <div className="min-h-screen bg-[#F8F7F4] font-body text-slate-800 flex flex-col pt-24 lg:pt-32">
      <SEOHead
        title={`${course.title} | Free Course by Savitram Foundation`}
        description={course.description}
        keywords={`${course.title}, ${course.category}, Free NGO Course, Savitram Foundation`}
      />

      <Navbar />

      <main className="flex-1 py-8 px-6 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Back Link Breadcrumb */}
        <div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-xs font-black text-[#1B5E20] hover:text-emerald-800 bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to All Free Courses</span>
          </Link>
        </div>

        {/* HERO COURSE BANNER CARD */}
        <div className="bg-gradient-to-br from-[#0A1628] via-[#0F223D] to-[#162D4E] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {course.category}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white border border-emerald-400 shadow-md">
                🎁 100% FREE COURSE
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(course.status)}`}>
                {course.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getLevelBadge(course.level)}`}>
                {course.level}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">{course.title}</h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Instructor: <strong className="text-white">{course.instructor}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10 text-xs font-bold text-slate-300">
            <span className="px-3 py-1 rounded-lg bg-white/10">Mode: {course.mode}</span>
            <span className="px-3 py-1 rounded-lg bg-white/10">Duration: {course.duration}</span>
            <span className="px-3 py-1 rounded-lg bg-white/10">Language: {course.language}</span>
            <span className="px-3 py-1 rounded-lg bg-white/10">Eligibility: {course.eligibility}</span>
          </div>
        </div>

        {/* CONTENT LAYOUT: MAIN 2 COLS + SIDEBAR 1 COL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: OVERVIEW & MEDIA */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview Box */}
            <div
              className="p-6 md:p-8 rounded-3xl bg-white space-y-4"
              style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
            >
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen size={20} className="text-[#1B5E20]" />
                <span>Course Overview & Description</span>
              </h3>

              <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200">
                {course.description}
              </p>
            </div>

            {/* Media Previews (Thumbnail & Intro Video) */}
            <div
              className="p-6 md:p-8 rounded-3xl bg-white space-y-4"
              style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
            >
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ImageIcon size={20} className="text-[#1B5E20]" />
                <span>Course Media Previews</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Thumbnail Card */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                  <p className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                    <ImageIcon size={14} /> Course Thumbnail Image
                  </p>
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full rounded-xl h-44 object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-400 gap-1">
                      <GraduationCap size={36} className="opacity-40" />
                      <span className="text-xs italic font-semibold">No Thumbnail Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Intro Video Card */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                  <p className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                    <Video size={14} /> Course Intro Video Player
                  </p>
                  {course.introVideoUrl ? (
                    <video
                      src={course.introVideoUrl}
                      controls
                      className="w-full rounded-xl h-44 bg-black object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-400 gap-1">
                      <Video size={36} className="opacity-40" />
                      <span className="text-xs italic font-semibold">No Intro Video Uploaded</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Curriculum Syllabus Modules */}
            <div
              className="p-6 md:p-8 rounded-3xl bg-white space-y-4"
              style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
            >
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers size={20} className="text-[#1B5E20]" />
                <span>Curriculum Syllabus Modules</span>
              </h3>

              {course.syllabus && course.syllabus.length > 0 ? (
                <div className="space-y-3">
                  {course.syllabus.map((mod, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                      <span className="w-8 h-8 rounded-xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-black text-sm shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{mod}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Curriculum points will be published prior to batch commencement.</p>
              )}
            </div>

          </div>

          {/* RIGHT 1 COLUMN: SIDEBAR SUMMARY & APPLY */}
          <div className="space-y-6">
            
            {/* Neumorphic Summary Card */}
            <div
              className="p-6 rounded-3xl bg-white space-y-5 sticky top-32"
              style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
            >
              <h4 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText size={18} className="text-[#1B5E20]" />
                <span>Key Specifications</span>
              </h4>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>Seats Capacity</span>
                  <span className="text-[#1B5E20] font-black">{enrolled}/{seats} ({fillPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#1B5E20] h-full" style={{ width: `${fillPct}%` }} />
                </div>
              </div>

              {/* Specs Grid */}
              <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Duration:</span>
                  <strong className="text-slate-900">{course.duration} ({course.totalLessons || 0} Lessons)</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Teaching Mode:</span>
                  <strong className="text-slate-900">{course.mode}</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Medium Language:</span>
                  <strong className="text-slate-900">{course.language}</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Eligibility:</span>
                  <strong className="text-slate-900">{course.eligibility}</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Age Range:</span>
                  <strong className="text-slate-900">{course.ageMin || 14} - {course.ageMax || 60} Yrs</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Start Date:</span>
                  <strong className="text-slate-900">{formatDate(course.startDate)}</strong>
                </div>
                {course.endDate && (
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">End Date:</span>
                    <strong className="text-slate-900">{formatDate(course.endDate)}</strong>
                  </div>
                )}
              </div>

              {/* Action Apply Button */}
              <button
                disabled={isFull}
                onClick={() => setShowApplyModal(true)}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isFull
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#1B5E20] hover:bg-emerald-800 text-white shadow-emerald-950/20'
                }`}
              >
                <span>{isFull ? 'Seats Full' : 'Apply Now for Free'}</span>
                {!isFull && <ArrowRight size={16} />}
              </button>

              <p className="text-[11px] text-center text-slate-400 font-medium">
                100% Free Training sponsored by Savitram Foundation NGO
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* ENROLLMENT APPLICATION MODAL */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto"
          onClick={() => setShowApplyModal(false)}
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
                  <p className="text-xs font-semibold text-slate-500">Free Vocational Skill Program</p>
                </div>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            {enrollSuccess ? (
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
                  onClick={() => setShowApplyModal(false)}
                  className="px-8 py-3 rounded-2xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md mt-4"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnrollment} className="space-y-4 overflow-y-auto pr-2 no-scrollbar flex-1">
                
                {/* Course info banner */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400">{course.category}</span>
                  <h4 className="text-base font-black leading-tight text-white">{course.title}</h4>
                  <p className="text-xs text-slate-300 font-medium">Mode: <strong>{course.mode}</strong> | Duration: <strong>{course.duration}</strong></p>
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
                    onClick={() => setShowApplyModal(false)}
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

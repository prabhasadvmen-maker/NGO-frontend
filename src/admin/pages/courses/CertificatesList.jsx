import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Award, Search, RefreshCw, Loader2, CheckCircle, AlertTriangle, Eye, X,
  ShieldCheck, ShieldAlert, Download, ExternalLink, Calendar, User, BookOpen, Settings
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import axios from 'axios';

const Modal = ({ onClose, children, maxWidth = 'max-w-3xl' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto">
    <div className={`w-full ${maxWidth} my-8 rounded-3xl p-6 md:p-8 bg-white border border-slate-100 shadow-2xl relative`}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose, icon: Icon = Award }) => (
  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
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

const ActionMenu = ({ cert, onPreview, onRevoke }) => {
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
            onClick={() => { setIsOpen(false); onPreview(cert); }}
            className="w-full px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Eye size={15} className="text-blue-600" />
            <span>Preview Certificate</span>
          </button>

          {cert.status === 'Verified' && (
            <button
              onClick={() => { setIsOpen(false); onRevoke(cert); }}
              className="w-full px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <ShieldAlert size={15} className="text-red-500" />
              <span>Revoke Certificate</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function CertificatesList() {
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

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    validCount: 0,
    revokedCount: 0,
    issuedThisMonth: 0,
  });

  // Search filter
  const [search, setSearch] = useState('');

  // Modals
  const [previewCert, setPreviewCert] = useState(null);
  const [revokeCertTarget, setRevokeCertTarget] = useState(null);
  const [revokedReason, setRevokedReason] = useState('');
  const [submittingRevoke, setSubmittingRevoke] = useState(false);

  // Fetch Certificates Data
  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/courses/certificates`, getHeaders());
      if (res.data?.success) {
        setCertificates(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error loading certificates:', err);
      toast.error('Failed to load certificates list');
    } finally {
      setLoading(false);
    }
  }, [getHeaders, toast]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Filtered Certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      if (!search) return true;
      const query = search.toLowerCase();
      return (
        cert.certificateId?.toLowerCase().includes(query) ||
        cert.studentName?.toLowerCase().includes(query) ||
        cert.courseName?.toLowerCase().includes(query) ||
        cert.category?.toLowerCase().includes(query)
      );
    });
  }, [certificates, search]);

  // Revoke submit
  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeCertTarget) return;
    setSubmittingRevoke(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/admin/courses/certificates/${revokeCertTarget._id}/revoke`,
        { revokedReason },
        getHeaders()
      );
      if (res.data?.success) {
        toast.success(`Certificate ${revokeCertTarget.certificateId} has been revoked.`);
        setRevokeCertTarget(null);
        setRevokedReason('');
        fetchCertificates();
      }
    } catch (err) {
      console.error('Revoke certificate error:', err);
      toast.error('Failed to revoke certificate');
    } finally {
      setSubmittingRevoke(false);
    }
  };

  const handleDownloadCertificate = () => {
    toast.info('Downloading high-resolution certificate PDF...');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'A':
        return 'bg-[#1B5E20]/10 text-[#1B5E20] border-[#1B5E20]/30';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* Top Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
              <Award className="text-[#1B5E20]" size={32} />
              Course Certificates Issued
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Verify credentials, inspect digital completion certificates, and handle revocations
            </p>
          </div>

          <button
            onClick={fetchCertificates}
            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer self-start md:self-auto"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Certificates Issued', value: stats.totalCertificates || certificates.length, color: '#1B5E20', icon: Award, sub: 'Cumulative achievements' },
            { label: 'Valid & Verified', value: stats.validCount || certificates.filter(c => c.status === 'Verified').length, color: '#059669', icon: ShieldCheck, sub: 'Authentic credentials' },
            { label: 'Revoked', value: stats.revokedCount || certificates.filter(c => c.status === 'Revoked').length, color: '#DC2626', icon: ShieldAlert, sub: 'Invalidated records' },
            { label: 'Issued This Month', value: stats.issuedThisMonth || 0, color: '#2563EB', icon: Calendar, sub: 'Recent completions' },
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

        {/* Search Bar */}
        <div
          className="rounded-3xl p-5 bg-white"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Certificate ID, Student Name, Course Name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1B5E20]"
            />
          </div>
        </div>

        {/* Certificates Table */}
        <div
          className="rounded-3xl bg-white relative"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
              <p className="text-xs font-extrabold text-slate-500">Loading certificate records...</p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Award size={48} className="opacity-30" />
              <p className="font-extrabold text-sm text-slate-600">No certificates match your query</p>
              <p className="text-xs text-slate-400">Search for another Certificate ID or candidate name.</p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar min-h-[260px] pb-24">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-3.5 text-center">S.No.</th>
                    <th className="py-3 px-3.5">Certificate ID</th>
                    <th className="py-3 px-3.5">Student Name</th>
                    <th className="py-3 px-3.5">Course Name & Category</th>
                    <th className="py-3 px-3.5">Completion Date</th>
                    <th className="py-3 px-3.5">Grade</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {filteredCertificates.map((cert, idx) => (
                    <tr key={cert._id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* S.No. */}
                      <td className="py-3 px-3.5 text-center font-black text-[#1B5E20] text-xs">
                        {idx + 1}
                      </td>

                      {/* Certificate ID */}
                      <td className="py-3 px-3.5 font-mono font-black text-[#1B5E20] whitespace-nowrap text-xs">
                        {cert.certificateId}
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-3.5 font-black text-slate-900 text-xs">
                        {cert.studentName}
                      </td>

                      {/* Course & Category */}
                      <td className="py-3 px-3.5 max-w-[170px]">
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1 text-xs">{cert.courseName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{cert.category || 'Vocational Skills'}</p>
                        </div>
                      </td>

                      {/* Completion Date */}
                      <td className="py-3 px-3.5 text-slate-600 font-semibold whitespace-nowrap text-xs">
                        {formatDate(cert.completionDate || cert.createdAt)}
                      </td>

                      {/* Grade Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getGradeBadge(cert.grade)}`}>
                          Grade {cert.grade || 'A+'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          cert.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {cert.status}
                        </span>
                      </td>

                      {/* Actions Settings Dropdown */}
                      <td className="py-3 px-3.5 text-center shrink-0">
                        <ActionMenu
                          cert={cert}
                          onPreview={setPreviewCert}
                          onRevoke={(c) => { setRevokeCertTarget(c); setRevokedReason(''); }}
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

      {/* REAL CERTIFICATE PREVIEW MODAL */}
      {previewCert && (
        <Modal onClose={() => setPreviewCert(null)} maxWidth="max-w-2xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Award className="text-[#1B5E20]" size={20} />
              Certificate Verification Preview
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCertificate}
                className="px-3.5 py-1.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={() => setPreviewCert(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Real Certificate Scroll Container */}
          <div className="max-h-[55vh] md:max-h-[60vh] overflow-y-auto pr-1">
            <div className="bg-[#FAF9F5] p-5 md:p-6 rounded-2xl relative overflow-hidden text-center text-slate-900 select-none border-4 border-double border-[#1B5E20]">
              
              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <img src="/NGO logo.jpeg" alt="" className="w-80 h-80 object-contain" />
              </div>

              {/* Header branding */}
              <div className="space-y-0.5 mb-4 relative z-10">
                <img src="/NGO logo.jpeg" alt="Logo" className="w-12 h-12 rounded-full mx-auto mb-1.5 border-2 border-[#1B5E20] object-cover" />
                <h1 className="text-xl md:text-2xl font-black text-[#1B5E20] tracking-widest uppercase font-serif">
                  SAVITRAM FOUNDATION
                </h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Regd. Social Action Organization • Govt. Recognized Non-Profit
                </p>
              </div>

              {/* Subheading */}
              <div className="my-4 relative z-10">
                <h2 className="text-lg md:text-xl font-serif font-black text-amber-900 italic tracking-wider">
                  Certificate of Completion
                </h2>
                <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-widest">This certifies that</p>
              </div>

              {/* Student Name */}
              <div className="my-4 relative z-10">
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#1B5E20] font-serif underline decoration-[#1B5E20]/40 underline-offset-6">
                  {previewCert.studentName}
                </h3>
              </div>

              {/* Body completion statement */}
              <div className="my-4 max-w-lg mx-auto space-y-1 relative z-10 text-xs font-medium text-slate-700 leading-relaxed">
                <p>has successfully completed the vocational skill development program in</p>
                <p className="text-sm md:text-base font-black text-slate-900 font-serif">
                  "{previewCert.courseName}"
                </p>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Duration: <strong>{previewCert.duration || '45 days'}</strong> • Category: <strong>{previewCert.category || 'Skill Development'}</strong>
                </p>
              </div>

              {/* Grade Badge */}
              <div className="my-3 relative z-10">
                <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-[#1B5E20]/10 text-[#1B5E20] border border-[#1B5E20]/30">
                  Overall Assessment: Grade {previewCert.grade || 'A+'}
                </span>
              </div>

              {/* Signatures & Issue Date */}
              <div className="mt-6 pt-4 border-t border-slate-300/80 grid grid-cols-2 gap-4 text-xs relative z-10">
                <div className="text-left">
                  <p className="font-extrabold text-slate-900 font-serif text-xs">{previewCert.instructorName || 'Anil singh'}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">COURSE INSTRUCTOR / DIRECTOR</p>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-[#1B5E20] font-mono text-xs">{formatDate(previewCert.completionDate || previewCert.createdAt)}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">DATE OF ISSUE</p>
                </div>
              </div>

              {/* Footer Verification URL & ID */}
              <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-[10px] font-mono font-bold text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-1 relative z-10">
                <span className="text-[#1B5E20]">CERT ID: {previewCert.certificateId}</span>
                <span className="text-slate-400">
                  Verify Online: savitramfoundation.org/verify/{previewCert.certificateId}
                </span>
              </div>

            </div>
          </div>
        </Modal>
      )}

      {/* REVOKE CERTIFICATE MODAL */}
      {revokeCertTarget && (
        <Modal onClose={() => setRevokeCertTarget(null)}>
          <ModalHeader title="Revoke Issued Certificate" onClose={() => setRevokeCertTarget(null)} icon={AlertTriangle} />

          <form onSubmit={handleRevokeSubmit} className="space-y-4">
            <p className="text-xs font-semibold text-slate-700">
              Are you sure you want to revoke Certificate <strong className="text-[#1B5E20]">{revokeCertTarget.certificateId}</strong> issued to <strong className="text-slate-900">{revokeCertTarget.studentName}</strong>?
            </p>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Revocation Reason *</label>
              <textarea
                required
                rows={3}
                value={revokedReason}
                onChange={e => setRevokedReason(e.target.value)}
                placeholder="Reason for revoking this certificate..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRevokeCertTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRevoke}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {submittingRevoke && <Loader2 size={14} className="animate-spin" />}
                <span>Confirm Revoke</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </Layout>
  );
}

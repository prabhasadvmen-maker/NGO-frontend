import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Search, Plus, Eye, Loader2, Printer, X, Settings, Trash2, Pencil } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/certificates`;

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div className="w-full max-w-2xl my-8 rounded-3xl p-6 md:p-8 bg-white border border-gray-100 shadow-2xl relative">
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-extrabold text-gray-800">{title}</h2>
    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
      <X size={18} className="text-gray-500" />
    </button>
  </div>
);

const ActionMenu = ({ cert, onView, onEdit, onPrint, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button 
        onClick={() => setOpen(p => !p)} 
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent" 
        title="Actions"
      >
        <Settings size={16} className="text-gray-505" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden text-left">
          <button 
            onClick={() => { onView(cert); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left border-0 bg-transparent"
          >
            <Eye size={14} className="text-blue-500" /> View Preview
          </button>
          <button 
            onClick={() => { onEdit(cert); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left border-0 bg-transparent"
          >
            <Pencil size={14} className="text-green-600" /> Edit Template
          </button>
          <button 
            onClick={() => { onPrint(cert); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left border-0 bg-transparent"
          >
            <Printer size={14} className="text-green-700" /> Print Copy
          </button>
          <div className="border-t border-gray-100" />
          <button 
            onClick={() => { onDelete(cert); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left border-0 bg-transparent"
          >
            <Trash2 size={14} /> Delete Log
          </button>
        </div>
      )}
    </div>
  );
};

const CertificateList = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    membershipCount: 0,
    volunteeringCount: 0,
    donationCount: 0,
    appreciationCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [myIssuedOnly, setMyIssuedOnly] = useState('true');

  const [activeCertificate, setActiveCertificate] = useState(null);
  const [editCertificate, setEditCertificate] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const printRef = useRef(null);

  // Generate Certificate Form State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recipientSource, setRecipientSource] = useState('Manual'); // 'Manual', 'Member', 'Volunteer'
  const [membersList, setMembersList] = useState([]);
  const [volunteersList, setVolunteersList] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    role: 'Member',
    type: 'Appreciation',
    title: 'Certificate of Appreciation',
    description: 'For outstanding commitment and dedicated support to Advmen NGO projects.',
    signatoryName: 'Branch Executive Committee',
    signatoryTitle: 'Authorized Representative'
  });

  const [editFormData, setEditFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    role: 'Member',
    type: 'Appreciation',
    title: '',
    description: '',
    signatoryName: '',
    signatoryTitle: ''
  });

  const fetchCertificates = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const typeParam = filterType ? `&type=${filterType}` : '';
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${typeParam}&myIssuedOnly=${myIssuedOnly}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCertificates(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch certificates log');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterType, myIssuedOnly, toast]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // Load directories
  const fetchDirectory = useCallback(async (source) => {
    if (!token || source === 'Manual') return;
    setLoadingDirectory(true);
    try {
      let url = '';
      if (source === 'Member') url = `${API_BASE_URL}/api/superadmin/members`;
      else if (source === 'Volunteer') url = `${API_BASE_URL}/api/superadmin/volunteers`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (source === 'Member') setMembersList(data.data);
        else setVolunteersList(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load directory details');
    } finally {
      setLoadingDirectory(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchCertificates();
    fetchStats();
  }, [fetchCertificates, fetchStats]);

  useEffect(() => {
    fetchDirectory(recipientSource);
  }, [recipientSource, fetchDirectory]);

  const handleSourceSelect = (e) => {
    const source = e.target.value;
    setRecipientSource(source);
    if (source === 'Member') {
      setFormData(prev => ({ ...prev, role: 'Member', recipientName: '', recipientEmail: '' }));
    } else if (source === 'Volunteer') {
      setFormData(prev => ({ ...prev, role: 'Volunteer', recipientName: '', recipientEmail: '' }));
    } else {
      setFormData(prev => ({ ...prev, role: 'Other', recipientName: '', recipientEmail: '' }));
    }
  };

  const handleEntitySelect = (e) => {
    const list = recipientSource === 'Member' ? membersList : volunteersList;
    const found = list.find(x => x._id === e.target.value);
    if (found) {
      setFormData(prev => ({
        ...prev,
        recipientName: found.name,
        recipientEmail: found.email
      }));
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Certificate generated successfully!');
        setShowGenerateModal(false);
        setFormData({
          recipientName: '',
          recipientEmail: '',
          role: 'Member',
          type: 'Appreciation',
          title: 'Certificate of Appreciation',
          description: 'For outstanding commitment and dedicated support to Advmen NGO projects.',
          signatoryName: 'Branch Executive Committee',
          signatoryTitle: 'Authorized Representative'
        });
        setRecipientSource('Manual');
        fetchCertificates();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to issue certificate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error creating certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (cert) => {
    setEditCertificate(cert);
    setEditFormData({
      recipientName: cert.recipientName || '',
      recipientEmail: cert.recipientEmail || '',
      role: cert.role || 'Member',
      type: cert.type || 'Appreciation',
      title: cert.title || '',
      description: cert.description || '',
      signatoryName: cert.signatoryName || '',
      signatoryTitle: cert.signatoryTitle || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/${editCertificate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Certificate details updated successfully!');
        setEditCertificate(null);
        fetchCertificates();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update certificate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error updating certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (cert) => {
    if (!window.confirm(`Are you sure you want to delete the certificate log for ${cert.recipientName}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/${cert._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Certificate record deleted successfully');
        fetchCertificates();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete certificate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting certificate record');
    }
  };

  const handleDirectPrint = (cert) => {
    const windowName = 'Print' + cert._id;
    const printWindow = window.open('', windowName, 'width=900,height=650');
    const verifyUrl = `${window.location.origin}/admin/certificates/verify?id=${cert.certificateId || ''}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            body { margin: 0; padding: 0; font-family: 'Times New Roman', serif; background-color: #fff; }
            .cert-container { 
              padding: 40px; 
              border: 15px double #1B5E20; 
              margin: 20px; 
              text-align: center;
              position: relative;
              background-color: #FAF9F6;
            }
            .cert-logo { font-size: 28px; font-weight: bold; color: #1B5E20; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 2px; }
            .cert-heading { font-size: 42px; font-weight: normal; color: #1B5E20; font-family: Georgia, serif; margin-bottom: 10px; }
            .cert-presented { font-style: italic; font-size: 20px; margin-bottom: 15px; }
            .cert-name { font-size: 36px; font-weight: bold; color: #1B5E20; text-decoration: underline; margin-bottom: 20px; }
            .cert-desc { font-size: 16px; line-height: 1.6; max-width: 650px; margin: 0 auto 40px auto; color: #333; }
            .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; max-width: 700px; margin-left: auto; margin-right: auto; }
            .cert-sig { border-top: 2px solid #ccc; width: 200px; padding-top: 5px; font-size: 14px; font-weight: bold; }
            .cert-qr { width: 100px; height: 100px; }
            @media print {
              body { background: none; }
              .cert-container { margin: 0; height: 90vh; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="cert-container">
            <div class="cert-logo">ADVMEN NGO</div>
            <h2 class="cert-heading">${cert.title}</h2>
            <p class="cert-presented">This is proudly presented to</p>
            <div class="cert-name">${cert.recipientName}</div>
            <p class="cert-desc">${cert.description}</p>
            <div class="cert-footer">
              <div>
                <p class="cert-sig">${cert.signatoryName}</p>
                <p style="font-size: 10px; color: #666; margin: 2px 0 0 0;">${cert.signatoryTitle}</p>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(verifyUrl)}"
                  alt="QR"
                  class="cert-qr"
                />
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Layout>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="space-y-6 pb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Award className="text-[#1B5E20]" size={28} />
              Certificates Issued
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage and print QR-validated credentials issued under your branch jurisdiction</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0 bg-green-700"
          >
            <Plus size={18} />
            Issue Certificate
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'My Issued Certificates', value: stats.totalCount, color: COLORS.primary },
            { label: 'Memberships', value: stats.membershipCount, color: '#2196F3' },
            { label: 'Volunteering', value: stats.volunteeringCount, color: '#9C27B0' },
            { label: 'Appreciation', value: stats.appreciationCount, color: '#FF9800' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 bg-white flex items-center gap-4 transition-all"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div>
                <p className="text-2xl font-black text-gray-800 leading-tight">{card.value}</p>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div 
          className="rounded-2xl p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipient..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650"
            >
              <option value="">All Types</option>
              <option value="Membership">Membership</option>
              <option value="Volunteering">Volunteering</option>
              <option value="Donation">Donation</option>
              <option value="Appreciation">Appreciation</option>
              <option value="Custom">Custom</option>
            </select>

            <select
              value={myIssuedOnly}
              onChange={(e) => { setMyIssuedOnly(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650"
            >
              <option value="true">Issued by Me Only</option>
              <option value="false">All Branch Certificates</option>
            </select>
          </div>
        </div>

        {/* Certificates Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white text-center" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No issued certificates found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Certificate ID', 'Recipient', 'Role/Type', 'Issued Date', 'Issued By', 'Actions'].map((h, idx) => (
                      <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 ${idx === 6 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert, idx) => (
                    <tr key={cert._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors text-left" style={{ borderColor: '#F0F0F0' }}>
                      <td className="px-4 py-4 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-4 py-4 font-bold text-gray-800">{cert.certificateId}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-gray-800">{cert.recipientName}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{cert.recipientEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">{cert.type}</span>
                          <p className="text-[10px] text-gray-400 mt-1 font-bold">Role: {cert.role}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-gray-650">
                        {new Date(cert.issueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                        {cert.createdBy?.name || 'Central Head'}
                      </td>
                      <td className="px-4 py-4 text-center relative overflow-visible pr-6">
                        <div className="flex justify-center">
                          <ActionMenu 
                            cert={cert}
                            onView={setActiveCertificate}
                            onEdit={openEditModal}
                            onPrint={handleDirectPrint}
                            onDelete={handleDeleteCertificate}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-white">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-500 font-bold">
                    Page {page} of {totalPages}
                  </span>
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
          )}
        </div>
      </div>

      {/* VIEW CERTIFICATE DETAILS PREVIEW MODAL */}
      {activeCertificate && (
        <Modal onClose={() => setActiveCertificate(null)}>
          <ModalHeader title="Certificate Verification Preview" onClose={() => setActiveCertificate(null)} />
          <div className="space-y-6 text-sm">
            
            <div className="border border-gray-200 bg-gray-55 rounded-2xl p-4 max-h-[50vh] overflow-y-auto flex items-start justify-center">
              <div 
                ref={printRef}
                className="w-full max-w-[700px] border-[10px] border-double border-green-800 bg-[#FAF9F6] p-8 text-center relative shadow-sm"
              >
                <div className="absolute top-2 left-2 text-green-800 font-extrabold text-xs font-serif">*</div>
                <div className="absolute top-2 right-2 text-green-800 font-extrabold text-xs font-serif">*</div>
                <div className="absolute bottom-2 left-2 text-green-800 font-extrabold text-xs font-serif">*</div>
                <div className="absolute bottom-2 right-2 text-green-800 font-extrabold text-xs font-serif">*</div>

                <div className="text-sm font-bold text-green-850 uppercase tracking-widest font-serif mb-4">ADVMEN NGO</div>
                <h2 className="text-2xl font-normal text-green-850 font-serif leading-tight mb-2">{activeCertificate.title}</h2>
                
                <p className="italic text-gray-500 text-xs font-serif mb-3">This is proudly presented to</p>
                <div className="text-xl font-bold text-green-850 underline font-serif mb-4">{activeCertificate.recipientName}</div>
                
                <p className="text-xs text-gray-600 leading-relaxed font-serif max-w-md mx-auto mb-6">
                  {activeCertificate.description}
                </p>

                <div className="flex justify-between items-end mt-8 max-w-md mx-auto">
                  <div className="text-left font-serif">
                    <p className="border-t border-gray-300 pt-1 text-xs font-bold text-gray-700">{activeCertificate.signatoryName}</p>
                    <p className="text-[10px] text-gray-400 leading-none">{activeCertificate.signatoryTitle}</p>
                  </div>
                  <div>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                        `${window.location.origin}/admin/certificates/verify?id=${activeCertificate.certificateId || ''}`
                      )}`} 
                      alt="Verify QR" 
                      className="w-16 h-16" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t">
              <button 
                onClick={() => handleDirectPrint(activeCertificate)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-700 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Printer size={15} /> Print Certificate
              </button>
              <button 
                onClick={() => setActiveCertificate(null)} 
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-655 bg-gray-100 hover:bg-gray-150 transition-all"
              >
                Dismiss Preview
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* EDIT CERTIFICATE MODAL */}
      {editCertificate && (
        <Modal onClose={() => setEditCertificate(null)}>
          <ModalHeader title="Edit Certificate Details" onClose={() => setEditCertificate(null)} />
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.recipientName}
                  onChange={(e) => setEditFormData(p => ({ ...p, recipientName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Email *</label>
                <input
                  type="email"
                  required
                  value={editFormData.recipientEmail}
                  onChange={(e) => setEditFormData(p => ({ ...p, recipientEmail: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Role *</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-bold text-gray-650"
                >
                  <option value="Member">Member</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Donor">Donor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Certificate Type *</label>
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-bold text-gray-650"
                >
                  <option value="Appreciation">Appreciation</option>
                  <option value="Membership">Membership</option>
                  <option value="Volunteering">Volunteering</option>
                  <option value="Donation">Donation</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Certificate Title *</label>
              <input
                type="text"
                required
                value={editFormData.title}
                onChange={(e) => setEditFormData(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Certificate Body Text *</label>
              <textarea
                required
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 resize-none font-semibold text-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Signatory Name</label>
                <input
                  type="text"
                  value={editFormData.signatoryName}
                  onChange={(e) => setEditFormData(p => ({ ...p, signatoryName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Signatory Title</label>
                <input
                  type="text"
                  value={editFormData.signatoryTitle}
                  onChange={(e) => setEditFormData(p => ({ ...p, signatoryTitle: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditCertificate(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-650 bg-gray-100 hover:bg-gray-150 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* ISSUE NEW CERTIFICATE FORM MODAL */}
      {showGenerateModal && (
        <Modal onClose={() => setShowGenerateModal(false)}>
          <ModalHeader title="Issue Verified Certificate" onClose={() => setShowGenerateModal(false)} />
          <form onSubmit={handleGenerateSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Source</label>
                <select
                  value={recipientSource}
                  onChange={handleSourceSelect}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-bold text-gray-650"
                >
                  <option value="Manual">Manual Entry (Custom Recipient)</option>
                  <option value="Member">From Active Members Directory</option>
                  <option value="Volunteer">From Active Volunteers Directory</option>
                </select>
              </div>

              {recipientSource !== 'Manual' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Select {recipientSource} Target
                  </label>
                  {loadingDirectory ? (
                    <div className="flex items-center py-3 text-xs text-gray-400 gap-2">
                      <Loader2 className="animate-spin text-green-700" size={14} /> Loading list...
                    </div>
                  ) : (
                    <select
                      onChange={handleEntitySelect}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-bold text-gray-650"
                    >
                      <option value="">-- Choose Recipient --</option>
                      {(recipientSource === 'Member' ? membersList : volunteersList).map(x => (
                        <option key={x._id} value={x._id}>{x.name} ({x.email})</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.recipientName}
                  onChange={(e) => setFormData(p => ({ ...p, recipientName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData(p => ({ ...p, recipientEmail: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-bold text-gray-650"
                >
                  <option value="Member">Member</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Donor">Donor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Certificate Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-bold text-gray-650"
                >
                  <option value="Appreciation">Appreciation</option>
                  <option value="Membership">Membership</option>
                  <option value="Volunteering">Volunteering</option>
                  <option value="Donation">Donation</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Certificate Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Certificate of Achievement"
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Certificate Body Text *</label>
              <textarea
                required
                rows={3}
                placeholder="For incredible contributions towards..."
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 resize-none font-semibold text-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Signatory Name</label>
                <input
                  type="text"
                  value={formData.signatoryName}
                  onChange={(e) => setFormData(p => ({ ...p, signatoryName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Signatory Title</label>
                <input
                  type="text"
                  value={formData.signatoryTitle}
                  onChange={(e) => setFormData(p => ({ ...p, signatoryTitle: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold text-gray-700"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowGenerateModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-650 bg-gray-100 hover:bg-gray-150 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Issuing...
                  </span>
                ) : 'Publish Certificate'}
              </button>
            </div>

          </form>
        </Modal>
      )}

    </Layout>
  );
};

export default CertificateList;

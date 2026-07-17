import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Award, Plus, Trash2, Search, Eye, Loader2, Calendar, FileText, CheckCircle2, ShieldCheck, Printer, X, Settings } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/superadmin/certificates`;

const Certificates = () => {
  const { token } = useAuth();
  const { toast } = useToast();

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
  const [filterRole, setFilterRole] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    role: 'Member',
    type: 'Appreciation',
    title: 'Certificate of Appreciation',
    description: 'For outstanding commitment and dedicated support to SAVITRAM FOUNDATION projects.',
    signatoryName: 'Savitram Foundation Board',
    signatoryTitle: 'Authorized Signatory'
  });

  const printRef = useRef(null);

  const fetchCertificates = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const typeParam = filterType ? `&type=${filterType}` : '';
      const roleParam = filterRole ? `&role=${filterRole}` : '';
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${typeParam}${roleParam}`;
      
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
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterType, filterRole, toast]);

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

  useEffect(() => {
    fetchCertificates();
    fetchStats();
  }, [fetchCertificates, fetchStats]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDropdownToggle = (e, certId) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === certId ? null : certId));
  };

  const handleCreateSubmit = async (e) => {
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
        toast.success('Certificate generated successfully');
        setIsCreateOpen(false);
        setFormData({
          recipientName: '',
          recipientEmail: '',
          role: 'Member',
          type: 'Appreciation',
          title: 'Certificate of Appreciation',
          description: 'For outstanding commitment and dedicated support to SAVITRAM FOUNDATION projects.',
          signatoryName: 'Savitram Foundation Board',
          signatoryTitle: 'Authorized Signatory'
        });
        fetchCertificates();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to issue certificate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error issuing certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this certificate record?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Certificate deleted successfully');
        fetchCertificates();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete certificate');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const windowUrl = window.location.href;
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open('', windowName, 'width=900,height=650');
    
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
              box-shadow: inset 0 0 40px rgba(27,94,32,0.1);
            }
            .cert-logo { font-size: 28px; font-weight: bold; color: #1B5E20; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 2px; }
            .cert-heading { font-size: 42px; font-weight: normal; color: #1B5E20; font-family: Georgia, serif; margin-bottom: 10px; }
            .cert-subheading { font-size: 16px; font-weight: bold; letter-spacing: 3px; color: #666; margin-bottom: 30px; text-transform: uppercase; }
            .cert-presented { font-style: italic; font-size: 20px; margin-bottom: 15px; color: #444; }
            .cert-name { font-size: 36px; font-weight: bold; color: #1B5E20; text-decoration: underline; margin-bottom: 20px; font-family: Georgia, serif; }
            .cert-desc { font-size: 16px; line-height: 1.6; max-width: 650px; margin: 0 auto 40px auto; color: #333; }
            .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; max-width: 700px; margin-left: auto; margin-right: auto; }
            .cert-sig { border-top: 2px solid #ccc; width: 200px; padding-top: 5px; font-size: 14px; font-weight: bold; color: #333; }
            .cert-qr { width: 100px; height: 100px; }
            .cert-meta { font-size: 11px; color: #888; text-align: left; position: absolute; bottom: 15px; left: 20px; font-family: monospace; }
            @media print {
              body { background: none; }
              .cert-container { margin: 0; height: 90vh; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
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
              box-shadow: inset 0 0 40px rgba(27,94,32,0.1);
            }
            .cert-logo { font-size: 28px; font-weight: bold; color: #1B5E20; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 2px; }
            .cert-heading { font-size: 42px; font-weight: normal; color: #1B5E20; font-family: Georgia, serif; margin-bottom: 10px; }
            .cert-subheading { font-size: 16px; font-weight: bold; letter-spacing: 3px; color: #666; margin-bottom: 30px; text-transform: uppercase; }
            .cert-presented { font-style: italic; font-size: 20px; margin-bottom: 15px; color: #444; }
            .cert-name { font-size: 36px; font-weight: bold; color: #1B5E20; text-decoration: underline; margin-bottom: 20px; font-family: Georgia, serif; }
            .cert-desc { font-size: 16px; line-height: 1.6; max-width: 650px; margin: 0 auto 40px auto; color: #333; }
            .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; max-width: 700px; margin-left: auto; margin-right: auto; }
            .cert-sig { border-top: 2px solid #ccc; width: 200px; padding-top: 5px; font-size: 14px; font-weight: bold; color: #333; }
            .cert-qr { width: 100px; height: 100px; }
            .cert-meta { font-size: 11px; color: #888; text-align: left; position: absolute; bottom: 15px; left: 20px; font-family: monospace; }
            @media print {
              body { background: none; }
              .cert-container { margin: 0; height: 90vh; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="cert-container">
            <div class="absolute top-2 left-2 text-green-800 font-extrabold text-xs font-serif">*</div>
            <div class="absolute top-2 right-2 text-green-800 font-extrabold text-xs font-serif">*</div>
            <div class="absolute bottom-2 left-2 text-green-800 font-extrabold text-xs font-serif">*</div>
            <div class="absolute bottom-2 right-2 text-green-800 font-extrabold text-xs font-serif">*</div>

            <div class="cert-logo">SAVITRAM FOUNDATION</div>
            <h2 class="cert-heading">${cert.title}</h2>
            <div class="cert-subheading">CERTIFICATE OF RECOGNITION</div>

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
                <div style="text-align: left;">
                  <p style="font-size: 9px; color: #666; margin: 0; font-weight: bold; text-transform: uppercase;">Scan to Verify</p>
                  <p style="font-size: 10px; font-weight: bold; color: #1B5E20; margin: 2px 0 0 0;">Secure Document</p>
                  <p style="font-size: 8px; color: #888; font-family: monospace; margin: 2px 0 0 0;">${cert.certificateId}</p>
                </div>
              </div>
            </div>

            <div class="cert-meta">SHA256: ${cert.hash}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getVerifyUrl = (cert) => {
    // Generate validation link on client frontend
    const domain = window.location.origin;
    return `${domain}/admin/certificates/verify?id=${cert?.certificateId || ''}`;
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
              Certificates Manager
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Issue and audit digital credentials, appreciation, and membership certifications</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0 bg-green-700"
          >
            <Plus size={18} />
            Issue Certificate
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Issued', value: stats.totalCount, color: COLORS.primary },
            { label: 'Memberships', value: stats.membershipCount, color: '#2196F3' },
            { label: 'Volunteering', value: stats.volunteeringCount, color: '#9C27B0' },
            { label: 'Donations', value: stats.donationCount, color: COLORS.success },
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
                placeholder="Search recipient name, email or cert ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="Membership">Membership</option>
              <option value="Volunteering">Volunteering</option>
              <option value="Donation">Donation</option>
              <option value="Appreciation">Appreciation</option>
              <option value="Custom">Custom</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="Member">Member</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Donor">Donor</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Certificates Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white" 
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
                    {['#', 'Certificate ID', 'Recipient', 'Role/Type', 'Issued Date', 'Issued By', 'Actions'].map((h) => (
                      <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 \${h === 'Actions' ? 'text-right pr-6' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert, idx) => (
                    <tr key={cert._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
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
                      <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                        {new Date(cert.issueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                        {cert.createdBy?.name || 'Central Board'}
                      </td>
                      <td className="px-4 py-4 text-right relative overflow-visible pr-6">
                        <div className="inline-block text-left">
                          <button
                            onClick={(e) => handleDropdownToggle(e, cert._id)}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-gray-700 hover:text-green-700"
                            title="Actions"
                          >
                            <Settings size={18} className={activeDropdownId === cert._id ? 'animate-spin text-green-700' : ''} />
                          </button>

                          {activeDropdownId === cert._id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left"
                              style={{
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                              }}
                            >
                              {/* View */}
                              <button
                                onClick={() => {
                                  setActiveCertificate(cert);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                              >
                                <Eye size={14} className="text-gray-400" /> View Preview
                              </button>

                              <div className="border-t border-gray-100 my-1"></div>

                              {/* Print */}
                              <button
                                onClick={() => {
                                  handleDirectPrint(cert);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                              >
                                <Printer size={14} className="text-gray-400" /> Print Direct
                              </button>

                              <div className="border-t border-gray-100 my-1"></div>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  handleDelete(cert._id);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                              >
                                <Trash2 size={14} className="text-red-400" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
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
            </div>
          )}
        </div>
      </div>

      {/* Issue Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Issue Official Certificate</h3>
                <p className="text-xs text-gray-400 mt-0.5">Fill in recipient credentials to generate verification hashes</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.recipientName}
                    onChange={(e) => setFormData(p => ({ ...p, recipientName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData(p => ({ ...p, recipientEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Recipient Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
                  >
                    <option value="Member">Member</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Donor">Donor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Certificate Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
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
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Certificate Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certificate of Appreciation"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Certificate body text *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Body statement acknowledging their hard work, commitment, etc..."
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signatory Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Savitram Foundation Board"
                    value={formData.signatoryName}
                    onChange={(e) => setFormData(p => ({ ...p, signatoryName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signatory Title / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Authorized Representative"
                    value={formData.signatoryTitle}
                    onChange={(e) => setFormData(p => ({ ...p, signatoryTitle: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-green-700 hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Generate Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Print Modal */}
      {activeCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-3xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Preview & Print Certificate</h3>
                <p className="text-xs text-gray-400 mt-0.5">Verification QR code generated dynamically</p>
              </div>
              <button onClick={() => setActiveCertificate(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Certificate Template Container */}
            <div className="border border-gray-200 bg-gray-50 rounded-2xl p-4 max-h-[55vh] overflow-y-auto flex items-start justify-center">
              <div 
                ref={printRef}
                className="w-full max-w-[700px] border-[10px] border-double border-green-800 bg-[#FAF9F6] p-8 md:p-12 text-center relative shadow-sm"
              >
                {/* Vintage Border Corner Elements */}
                <div className="absolute top-2 left-2 text-green-800 font-extrabold text-xs font-serif">*</div>
                <div className="absolute top-2 right-2 text-green-800 font-extrabold text-xs font-serif">*</div>
                <div className="absolute bottom-2 left-2 text-green-800 font-extrabold text-xs font-serif">*</div>
                <div className="absolute bottom-2 right-2 text-green-800 font-extrabold text-xs font-serif">*</div>

                <div className="text-green-800 font-serif text-lg tracking-[4px] font-black uppercase mb-4">SAVITRAM FOUNDATION</div>
                
                <h2 className="text-3xl md:text-4xl font-serif text-green-800 font-normal mb-1">{activeCertificate.title}</h2>
                <div className="text-[10px] tracking-[3px] text-gray-500 font-bold uppercase mb-6">CERTIFICATE OF RECOGNITION</div>

                <p className="italic text-gray-600 text-sm mb-2">This is proudly presented to</p>
                <div className="text-2xl font-serif font-bold text-green-900 border-b border-green-800/30 inline-block px-8 py-1 mb-4">
                  {activeCertificate.recipientName}
                </div>

                <p className="text-gray-700 text-xs md:text-sm max-w-[550px] mx-auto leading-relaxed mb-6 font-serif">
                  {activeCertificate.description}
                </p>

                {/* Footer Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-[650px] mx-auto mt-8 border-t border-gray-200/50 pt-6">
                  {/* Signatures */}
                  <div className="text-center sm:text-left">
                    <p className="font-serif font-bold text-gray-800 text-xs mt-4 border-t border-gray-300 pt-1 px-4 inline-block">
                      {activeCertificate.signatoryName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold">{activeCertificate.signatoryTitle}</p>
                  </div>

                  {/* Dynamic QR Verification Seal */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(getVerifyUrl(activeCertificate))}`}
                      alt="Verification QR Code"
                      className="w-16 h-16 bg-white border p-0.5 rounded shadow-sm flex-shrink-0"
                    />
                    <div className="text-left">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Scan to Verify</p>
                      <p className="text-[10px] font-black text-green-800">Secure Document</p>
                      <p className="text-[8px] text-gray-400 font-mono mt-0.5">{activeCertificate.certificateId}</p>
                    </div>
                  </div>
                </div>

                {/* Cryptographic hash seal at base */}
                <div className="text-[8px] font-mono text-gray-400 text-center mt-6 uppercase select-all">
                  SHA256: {activeCertificate.hash}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-100 justify-end">
              <button
                onClick={() => setActiveCertificate(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
              >
                Close Preview
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-green-700 hover:opacity-90 flex items-center gap-2"
              >
                <Printer size={16} /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Certificates;

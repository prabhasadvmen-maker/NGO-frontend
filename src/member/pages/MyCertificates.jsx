import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Award, Search, Loader2, Calendar, Printer, X, ShieldCheck, Mail
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/member/activities`;

const MyCertificates = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  const certPrintRef = useRef(null);

  const fetchCertificates = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setCertificates(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch certificates');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handlePrint = () => {
    const printContent = certPrintRef.current?.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Certificate - ${selectedCert?.certificateId}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 0; background: #fff; }
              @page { size: landscape; margin: 1cm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();" class="bg-white">
          <div class="p-8 max-w-4xl mx-auto border-8 border-double border-yellow-600 rounded-3xl bg-amber-50/20 text-center relative overflow-hidden" style="min-height: 550px;">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const filteredCerts = certificates.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Award className="text-[#1B5E20]" size={28} />
              My Certificates
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              View and print your official NGO appreciation and membership certificates
            </p>
          </div>
        </div>

        {/* Certificates Grid Container */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
          }}
        >
          {/* Filtering Header */}
          <div className="mb-6 border-b border-gray-200 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                ISSUED DOCUMENTS ({filteredCerts.length})
              </h3>
              <div className="relative flex items-center w-full sm:w-64">
                <Search className="absolute left-3.5 text-gray-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search certificate or id..."
                  className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading certificates...</p>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Award size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Certificates Found</p>
                <p className="text-xs text-gray-400 mt-1">Certificates appear here when issued by the NGO administration</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCerts.map(cert => (
                <div
                  key={cert._id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between shadow-sm relative group overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-[#1B5E20]/10 text-[#1B5E20] rounded-xl">
                        <Award size={20} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase font-black bg-gray-50 px-2 py-1 rounded-md">
                        {cert.certificateId}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-gray-800 text-sm truncate">{cert.title}</h4>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Issued on {new Date(cert.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-250">
                        {cert.type} Document
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="w-full py-2.5 rounded-xl border border-yellow-600 bg-transparent text-yellow-750 hover:bg-yellow-600 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Award size={14} /> View Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VIEW CERTIFICATE MODAL FRAME */}
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
            <div
              className="w-full max-w-4xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[95vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-25"
              >
                <X size={20} />
              </button>

              <div
                className="border-8 border-double border-yellow-600 rounded-2xl bg-amber-50/15 p-8 md:p-12 space-y-6 shadow-sm text-center relative overflow-hidden"
                ref={certPrintRef}
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(217, 119, 6, 0.02) 0%, transparent 80%)'
                }}
              >
                {/* Certificate Background watermark seal */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <Award size={280} className="text-yellow-600" />
                </div>

                {/* Header */}
                <div className="space-y-2 relative z-10">
                  <h2 className="text-2xl md:text-3xl font-black text-yellow-700 uppercase tracking-widest font-serif">
                    Certificate of {selectedCert.type}
                  </h2>
                  <p className="text-xs uppercase font-extrabold tracking-wider text-gray-400">
                    Savitram Foundation Board
                  </p>
                  <div className="w-24 h-0.5 bg-yellow-600 mx-auto mt-4"></div>
                </div>

                {/* Presentation Subtext */}
                <div className="space-y-4 pt-4 relative z-10">
                  <p className="text-xs text-gray-400 italic font-semibold">This is proudly presented to</p>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight capitalize font-serif my-2">
                    {selectedCert.recipientName}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
                    {selectedCert.description}
                  </p>
                </div>

                {/* Validation Stamp and Hash */}
                <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-10 text-left">
                  <div className="space-y-1">
                    <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest">Document ID</span>
                    <span className="font-mono text-xs font-bold text-gray-700">{selectedCert.certificateId}</span>
                    <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest pt-2">Security Verification Hash</span>
                    <span className="font-mono text-[9px] text-gray-400 block select-all break-all">{selectedCert.hash}</span>
                  </div>

                  <div className="flex justify-center py-2 md:py-0">
                    <div className="w-20 h-20 rounded-full border-4 border-double border-yellow-600 flex items-center justify-center bg-white shadow-inner transform rotate-12">
                      <div className="text-center font-bold text-[8px] text-yellow-700 tracking-tighter">
                        <Award size={18} className="mx-auto mb-0.5 text-yellow-600" />
                        OFFICIAL<br />SEAL
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest">Date of Issuance</span>
                    <span className="text-xs font-bold text-gray-700">
                      {new Date(selectedCert.issueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                    <div className="w-32 h-0.5 bg-gray-300 ml-auto pt-2"></div>
                    <span className="block text-[8px] font-bold text-gray-450 uppercase tracking-widest pt-1">
                      {selectedCert.signatoryTitle || 'Authorized Signer'}
                    </span>
                    <span className="text-[10px] font-extrabold text-gray-800 block">{selectedCert.signatoryName || 'NGO Board Director'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer border-0 hover:bg-gray-300 transition-all text-center"
                >
                  Close Preview
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-yellow-650 text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Printer size={14} /> Print Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyCertificates;

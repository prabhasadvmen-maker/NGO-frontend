import React, { useState } from 'react';
import { ShieldCheck, Search, Award, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import API_BASE_URL from '../../shared/apiConfig';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const VerifyPage = () => {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/public/verify-certificate/${certId.trim()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Verification failed. Document not found.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to verification server.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Document Verification" description="Verify certificates, awards, and credentials issued by SAVITRAM FOUNDATION. Check authentic blockchain hash matching." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        {/* Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 text-left border-b border-gray-200/50 mb-16">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Trust & Transparency
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Verify Certificate
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Enter a document ID or SHA-256 hash to confirm authenticity.</p>
        </div>

        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          {/* Search bar card */}
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-lg text-left"
            style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}>
            <form onSubmit={handleVerify} className="space-y-4">
              <label htmlFor="cert-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Certificate ID or Document Hash</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span>
                  <input 
                    type="text" 
                    id="cert-input"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    placeholder="e.g. SAV-12345-ABCD or 64-character hash..."
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-250 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-[#1B5E20] text-xs font-extrabold text-white hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader className="animate-spin" size={14} /> : <span>Verify Document</span>}
                </button>
              </div>
            </form>
          </div>

          {/* Verification Results Panel */}
          {error && (
            <div className="flex gap-4 items-start p-6 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-left">
              <AlertCircle className="flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Verification Failed</h4>
                <p className="text-xs font-semibold leading-relaxed">{error}</p>
                <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-wider pt-2">Warning: Untrusted document claim. Check input for spelling errors.</p>
              </div>
            </div>
          )}

          {data && (
            <div className="flex gap-6 items-start p-8 rounded-3xl bg-emerald-50/50 text-[#0A1628] border-2 border-emerald-500/20 text-left shadow-lg">
              <div className="p-4 bg-[#1B5E20] text-white rounded-2xl flex-shrink-0 shadow-md">
                <Award size={36} />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2 text-[#1B5E20] font-black text-xs uppercase tracking-widest">
                  <CheckCircle2 size={16} />
                  <span>Verified Authentic Credentials</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-black text-2xl text-[#0A1628] leading-tight">{data.recipientName}</h3>
                  <p className="text-xs text-gray-400 font-semibold">{data.recipientEmail}</p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-emerald-500/10 text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase leading-none">Accreditation</span>
                    <span className="font-bold text-[#0A1628] mt-1 block">{data.title || data.role}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase leading-none">Issue Date</span>
                    <span className="font-bold text-[#0A1628] mt-1 block">{formatDate(data.issueDate)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase leading-none">Signatory Desk</span>
                    <span className="font-bold text-[#0A1628] mt-1 block">{data.signatoryName} ({data.signatoryTitle})</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase leading-none">Origin Branch</span>
                    <span className="font-bold text-[#0A1628] mt-1 block">{data.issuedBy}</span>
                  </div>
                </div>

                {/* Hash signature */}
                {data.hash && (
                  <div className="pt-3 border-t border-emerald-500/10 text-[9px] text-gray-400 font-bold break-all">
                    CRYPTOGRAPHIC HASH: <span className="text-[#0A1628] select-all">{data.hash}</span>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default VerifyPage;

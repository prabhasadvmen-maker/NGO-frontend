import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Search, Loader2, ArrowLeft, Award, CheckCircle, Calendar, User, FileText } from 'lucide-react';
import Layout from '../../components/Layout';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/public/verify-certificate`;

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const certIdFromParam = searchParams.get('id');
  const navigate = useNavigate();

  const [certId, setCertId] = useState(certIdFromParam || '');
  const [verifying, setVerifying] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  const triggerVerification = useCallback(async (id = certId) => {
    if (!id.trim()) return;
    setVerifying(true);
    setCertificateData(null);
    setVerificationError('');
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (data.success) {
        setCertificateData(data.data);
      } else {
        setVerificationError(data.message || 'Verification failed. Document is not authentic.');
      }
    } catch (err) {
      console.error(err);
      setVerificationError('Network error connecting to verification system');
    } finally {
      setVerifying(false);
    }
  }, [certId]);

  useEffect(() => {
    if (certIdFromParam) {
      triggerVerification(certIdFromParam);
    }
  }, [certIdFromParam, triggerVerification]);

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerVerification();
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl pb-10">
        <button
          onClick={() => navigate('/admin/certificates')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Log
        </button>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <ShieldCheck size={26} className="text-green-700" />
            Verification Portal
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Input a Certificate ID or cryptographic hash to verify authenticity</p>
        </div>

        {/* Input box */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-3xl p-5 flex items-center gap-4"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="e.g. CERT-2026-00001 or SHA256 hash"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 font-bold"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={verifying}
            className="px-6 py-3 border-0 rounded-xl text-sm font-bold text-white bg-green-700 hover:opacity-90 disabled:opacity-40 flex items-center gap-2 cursor-pointer"
          >
            {verifying && <Loader2 size={16} className="animate-spin" />}
            Verify
          </button>
        </form>

        {/* Result details */}
        {verifying && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="animate-spin text-green-700" size={32} />
            <p className="text-xs text-gray-400 font-bold">Querying ledger records...</p>
          </div>
        )}

        {verificationError && (
          <div 
            className="rounded-3xl p-6 bg-white border border-red-200 text-center space-y-4 flex flex-col items-center"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3 className="text-md font-extrabold text-red-600">Verification Failure</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">{verificationError}</p>
            </div>
          </div>
        )}

        {certificateData && (
          <div 
            className="rounded-3xl p-6 bg-white border border-green-200 space-y-5"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-green-700 uppercase tracking-wide">Verified Authentic</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Checked secure signature registry</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">{certificateData.type}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Certificate ID</span>
                <p className="text-sm font-black text-gray-800 mt-0.5">{certificateData.certificateId}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Date of Issue</span>
                <p className="text-sm font-black text-gray-800 mt-0.5">
                  {new Date(certificateData.issueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Recipient Details</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{certificateData.recipientName}</p>
                  <p className="text-xs text-gray-400 font-semibold">{certificateData.recipientEmail} ({certificateData.role})</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Title & Details</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{certificateData.title}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{certificateData.description}</p>
                </div>
              </div>
            </div>

            <div className="p-3 border border-dashed border-green-200 bg-green-50/50 rounded-xl text-center">
              <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider block">Security Ledger Hash (SHA256)</span>
              <span className="text-[9px] font-mono text-gray-500 mt-1 block select-all break-all">{certificateData.hash}</span>
            </div>

            <div className="text-center text-[10px] text-gray-400 font-semibold">
              Issued by {certificateData.issuedBy}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifyCertificate;

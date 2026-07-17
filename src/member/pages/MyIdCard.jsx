import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CreditCard, Loader2, Printer, ShieldCheck, Mail, Phone, MapPin, Award
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/member/membership`;

const MyIdCard = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);

  const printRef = useRef(null);

  const fetchMemberInfo = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setMemberData(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch membership details');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ID card details');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchMemberInfo();
  }, [fetchMemberInfo]);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Member ID Card - ${memberData?.memberId}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 0; background: #fff; }
              .no-print { display: none; }
            }
            .id-card-print {
              width: 3.375in;
              height: 2.125in;
              box-sizing: border-box;
              border: 1px solid #e2e8f0;
              border-radius: 0.5rem;
              overflow: hidden;
              margin: 10px;
              display: inline-block;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();" class="bg-white p-4">
          <div class="flex flex-wrap justify-center">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const split = name.trim().split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return split[0][0].toUpperCase();
  };

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <CreditCard className="text-[#1B5E20]" size={28} />
              My ID Card
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Access, print or download your verified digital membership card
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
            <p className="text-sm font-semibold text-gray-500">Generating digital ID card...</p>
          </div>
        ) : !memberData ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <CreditCard size={32} />
            </div>
            <div>
              <p className="text-base font-extrabold text-gray-800">No Registry Record</p>
              <p className="text-xs text-gray-400 mt-1">Make sure your membership registration is approved</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Visual Preview Container */}
            <div
              className="rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center bg-[#F5F5F5]"
              style={{
                boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
              }}
            >
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#1B5E20]" /> Verified Digital Membership Card
              </h3>

              {/* ID Card Wrapper for PDF/Printing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full" ref={printRef}>
                {/* FRONT SIDE */}
                <div
                  className="id-card-print bg-gradient-to-br from-green-800 to-green-950 text-white rounded-2xl shadow-lg relative p-4 flex flex-col justify-between overflow-hidden border border-green-750"
                  style={{ width: '3.375in', height: '2.125in', minWidth: '3.375in', minHeight: '2.125in' }}
                >
                  {/* Decorative background circle */}
                  <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mb-10 pointer-events-none"></div>

                  <div className="flex justify-between items-start border-b border-white/10 pb-1.5">
                    <div>
                      <h4 className="text-[10px] font-black tracking-widest text-green-300">SAVITRAM FOUNDATION</h4>
                      <p className="text-[6px] tracking-wide text-gray-300">Certified NGO Member Card</p>
                    </div>
                    <span className="text-[8px] font-mono font-black bg-white/10 px-2 py-0.5 rounded">
                      {memberData.memberId}
                    </span>
                  </div>

                  <div className="flex gap-3 py-1.5 items-center flex-1">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 flex-shrink-0 text-sm font-bold text-green-200">
                      {memberData.photoUrl ? (
                        <img src={memberData.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(memberData.fullName)
                      )}
                    </div>
                    <div className="space-y-0.5 text-left">
                      <h5 className="text-[11px] font-black tracking-tight text-white uppercase truncate max-w-[130px]">{memberData.fullName}</h5>
                      <span className="inline-block text-[7px] font-black uppercase text-green-300 px-1 bg-green-900/50 rounded">
                        {memberData.currentMembership?.type} Member
                      </span>
                      <p className="text-[6px] text-gray-300 font-semibold pt-0.5">
                        Joined: {memberData.joiningDate ? new Date(memberData.joiningDate).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                  </div>

                  {/* ID Barcode design */}
                  <div className="flex justify-between items-end border-t border-white/10 pt-1.5">
                    <div className="space-y-0.5 text-left">
                      <p className="text-[5px] text-gray-400 font-bold uppercase tracking-wider">Expiry Date</p>
                      <p className="text-[7px] font-bold text-red-300">
                        {memberData.expiryDate ? new Date(memberData.expiryDate).toLocaleDateString('en-IN') : 'Lifetime'}
                      </p>
                    </div>
                    
                    {/* CSS Barcode Mockup */}
                    <div className="flex items-center gap-[1px] bg-white p-1 rounded-sm h-5 pr-2">
                      <div className="w-[1px] bg-black h-full"></div>
                      <div className="w-[2px] bg-black h-full"></div>
                      <div className="w-[1px] bg-black h-full"></div>
                      <div className="w-[3px] bg-black h-full"></div>
                      <div className="w-[1px] bg-black h-full"></div>
                      <div className="w-[2px] bg-black h-full"></div>
                      <div className="w-[1px] bg-black h-full"></div>
                      <div className="w-[1px] bg-black h-full"></div>
                      <div className="w-[2px] bg-black h-full"></div>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div
                  className="id-card-print bg-white text-gray-800 rounded-2xl shadow-lg relative p-4 flex flex-col justify-between overflow-hidden border border-gray-200"
                  style={{ width: '3.375in', height: '2.125in', minWidth: '3.375in', minHeight: '2.125in' }}
                >
                  <div className="text-left space-y-1">
                    <h4 className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Instructions</h4>
                    <ul className="list-decimal list-inside text-[5.5px] text-gray-500 font-bold space-y-0.5">
                      <li>This card remains the property of the SAVITRAM FOUNDATION.</li>
                      <li>Please carry it for all NGO events and verification.</li>
                      <li>Loss must be reported to NGO board office instantly.</li>
                    </ul>
                  </div>

                  <div className="text-left border-t border-gray-100 pt-1.5 my-1 text-[5.5px] text-gray-400 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Mail size={6} className="text-[#1B5E20]" /> support@savitram.org
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={6} className="text-[#1B5E20]" /> +91 98765 43210
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={6} className="text-[#1B5E20]" /> NGO Central Office Block, New Delhi, India
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-100 pt-1.5">
                    <div className="text-left">
                      <span className="block text-[4.5px] font-bold text-gray-400 uppercase">Verification Seal</span>
                      <span className="text-[6px] text-green-700 font-black flex items-center gap-0.5">
                        <Award size={8} /> SECURE MEMBER
                      </span>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="w-16 h-[0.5px] bg-gray-300 ml-auto"></div>
                      <span className="block text-[4.5px] font-bold text-gray-400 uppercase">Authorised Signatory</span>
                      <span className="text-[5.5px] font-bold text-gray-600 block">Savitram Foundation Director</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 max-w-md w-full pt-8">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl text-xs font-bold cursor-pointer border-0 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={14} /> Print ID Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyIdCard;

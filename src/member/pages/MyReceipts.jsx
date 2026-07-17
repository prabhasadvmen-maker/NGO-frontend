import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText, Search, Loader2, IndianRupee, Printer, X, Download,
  Mail, Calendar, ShieldCheck, CreditCard
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/member/activities`;

const MyReceipts = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  const printRef = useRef(null);

  const fetchReceipts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        // filter completed status only for receipts
        const completed = resData.data.filter(d => d.paymentStatus === 'completed');
        setReceipts(completed);
      } else {
        toast.error(resData.message || 'Failed to fetch receipts');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Create iframe or write directly to new window to prevent replacing React layout
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Receipt - ${selectedReceipt?.receiptNumber}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 2cm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="p-8 max-w-3xl mx-auto border-4 border-double border-gray-400 rounded-xl bg-white">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
    return str;
  };

  const filteredReceipts = receipts.filter(r => 
    r.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.purpose?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <FileText className="text-[#1B5E20]" size={28} />
              My Receipts
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Download and print tax exemption receipts for your donations
            </p>
          </div>
        </div>

        {/* List of Receipts Container */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
          }}
        >
          {/* Header & Search */}
          <div className="mb-6 border-b border-gray-200 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                EXEMPTION RECEIPTS ({filteredReceipts.length})
              </h3>
              <div className="relative flex items-center w-full sm:w-64">
                <Search className="absolute left-3.5 text-gray-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search receipt no or purpose..."
                  className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading receipts...</p>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <FileText size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Receipts Available</p>
                <p className="text-xs text-gray-400 mt-1">Receipts are generated instantly upon successful donations</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReceipts.map(receipt => (
                <div
                  key={receipt._id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between shadow-sm relative group overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-[#1B5E20]/10 text-[#1B5E20] rounded-xl">
                        <FileText size={20} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase font-black bg-gray-50 px-2 py-1 rounded-md">
                        {receipt.receiptNumber}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-gray-800 text-sm truncate">{receipt.purpose}</h4>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Donated on {new Date(receipt.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-2xl font-black text-gray-800">₹{receipt.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{receipt.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6">
                    <button
                      onClick={() => setSelectedReceipt(receipt)}
                      className="w-full py-2.5 rounded-xl border border-[#1B5E20]/20 hover:border-[#1B5E20] bg-transparent text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={14} /> Print Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRINT RECEIPT MODAL FRAME */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
            <div
              className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
              >
                <X size={20} />
              </button>

              <div className="border border-gray-200 rounded-2xl bg-white p-6 md:p-8 space-y-6 shadow-sm" ref={printRef}>
                {/* NGO Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">SAVITRAM FOUNDATION BOARD</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Empowering communities through support</p>
                    <p className="text-[9px] font-semibold text-gray-500 mt-1">Section 80G Exemption Registration ID: 80G/EXEMPT/2026-09</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[10px] font-black font-mono bg-gray-100 px-3 py-1 rounded text-gray-700">
                      RECEIPT: {selectedReceipt.receiptNumber}
                    </span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">
                      DATE: {new Date(selectedReceipt.donationDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>

                {/* Receipt Details Body */}
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <p>
                    Received with thanks from <strong className="text-gray-800 font-extrabold uppercase">{selectedReceipt.donorName || 'Member'}</strong>
                    {selectedReceipt.donorEmail && <span> (Email: <code>{selectedReceipt.donorEmail}</code>)</span>} the sum of:
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Amount In Words</span>
                      <span className="font-extrabold text-gray-800 italic capitalize">{numberToWords(selectedReceipt.amount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Amount (INR)</span>
                      <span className="text-xl font-black text-[#1B5E20]">₹{selectedReceipt.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Purpose / Contribution</span>
                      <span className="font-extrabold text-gray-800">{selectedReceipt.purpose || 'General Contribution'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Mode & Ref (UTR)</span>
                      <span className="font-extrabold text-gray-800">
                        {selectedReceipt.paymentMethod?.toUpperCase()} (UTR: {selectedReceipt.transactionId || 'N/A'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footnote & Signature */}
                <div className="flex justify-between items-end pt-8 border-t border-dashed border-gray-200 mt-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    <ShieldCheck size={14} /> Tax Exemption Exempted under Section 80G of I.T. Act
                  </div>
                  <div className="text-right space-y-1">
                    <div className="w-32 h-0.5 bg-gray-300 mx-auto"></div>
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider pt-1">Authorized Signatory</span>
                    <span className="text-[10px] font-extrabold text-gray-700 block">Savitram Foundation Finance Board</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer border-0 hover:bg-gray-300 transition-all text-center"
                >
                  Close Preview
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-[#1B5E20] text-white rounded-xl text-xs font-bold cursor-pointer border-0 hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Printer size={14} /> Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyReceipts;

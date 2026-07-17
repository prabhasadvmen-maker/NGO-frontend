import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Loader2, ArrowLeft, Printer, Eye, X, FileText } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/admin/donations`;

const DonationReceipts = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingDonation, setViewingDonation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchReceipts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?paymentStatus=completed&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load completed donation receipts');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleOpenReceipt = (donation) => {
    setViewingDonation(donation);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Receipt - ${viewingDonation?.receiptNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body onload="window.print();window.close()">
          <div class="max-w-3xl mx-auto border p-8 rounded-lg mt-10 bg-white">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/admin/donations')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-800 transition-colors border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to list
        </button>

        {/* Title */}
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Donation Receipts</h1>
          <p className="text-xs text-gray-400 font-bold mt-1">Generate, print, and download receipt invoices for completed transactions</p>
        </div>

        {/* Receipts Table */}
        <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm text-left">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold text-xs uppercase tracking-wider">No completed donations found to generate receipts.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 border-gray-150">
                    {['Receipt No', 'Donor Name', 'Amount', 'Date', 'Purpose', 'Payment Method', 'Action'].map((h, i) => (
                      <th key={i} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-450">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-655">
                  {donations.map(donation => (
                    <tr key={donation._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-green-850">{donation.receiptNumber}</td>
                      <td className="px-5 py-4 font-bold text-gray-800">{donation.donorName}</td>
                      <td className="px-5 py-4 font-black text-gray-850">₹{donation.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-gray-600 font-semibold">
                        {new Date(donation.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-600">{donation.purpose}</td>
                      <td className="px-5 py-4 capitalize font-semibold text-gray-600">{donation.paymentMethod.replace('_', ' ')}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleOpenReceipt(donation)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs cursor-pointer border-0 hover:bg-gray-200 transition-colors font-semibold"
                        >
                          <Eye size={12} />
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {isViewModalOpen && viewingDonation && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-green-700" />
                Donation Receipt
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-0 bg-green-800 text-white font-bold text-xs cursor-pointer hover:bg-green-700 transition-colors"
                >
                  <Printer size={14} />
                  Print
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Scrollable Wrapper */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div id="receipt-print-area" className="p-6 bg-white border border-gray-200 rounded-xl space-y-8 text-left font-sans">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src="/NGO logo.jpeg" alt="NGO Logo" className="h-12 w-12 rounded-full object-cover border" />
                    <div>
                      <h2 className="text-sm font-extrabold text-green-950 tracking-wide uppercase">SAVITRAM FOUNDATION</h2>
                      <p className="text-[9px] text-gray-400 font-semibold tracking-wider">Regd No. ADV/2024/99124</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded bg-green-50 text-green-800 text-[10px] font-black uppercase tracking-wider border border-green-100">
                      TAX EXEMPTED
                    </span>
                    <p className="text-[10px] text-gray-450 mt-2 font-mono font-bold">Receipt: {viewingDonation.receiptNumber}</p>
                    <p className="text-[10px] text-gray-450 font-mono font-bold">
                      Date: {new Date(viewingDonation.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-4 text-xs font-semibold text-gray-700">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Received from (Donor)</span>
                    <span className="font-extrabold text-gray-800 block text-sm">{viewingDonation.donorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Donation Amount</span>
                    <span className="font-black text-green-800 text-base block">₹{viewingDonation.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment Mode</span>
                    <span className="font-semibold text-gray-700 capitalize block">{viewingDonation.paymentMethod}</span>
                  </div>
                  {viewingDonation.transactionId && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Transaction Reference ID</span>
                      <span className="font-mono text-gray-600 block text-[11px]">{viewingDonation.transactionId}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Assigned Branch</span>
                    <span className="font-bold text-gray-800 block">
                      {viewingDonation.branch?.name || user?.branch?.name || 'Central Head Office'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-10">
                  <div className="text-[10px] text-gray-400 font-medium">
                    <p>All donations are tax exempted under Section 80G.</p>
                    <p>Thank you for your generous contribution.</p>
                  </div>
                  <div className="text-center w-40 flex flex-col items-center">
                    <div className="h-10 w-24 flex items-center justify-center opacity-70 border-b border-gray-300 border-dashed text-[10px] text-gray-400 font-mono">
                      Signed Electronically
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 mt-2 block uppercase tracking-wider">Authorized Officer</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
};

export default DonationReceipts;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap, IndianRupee, Loader2, Search, X, Eye, FileText, Printer, Phone, Mail
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/admin/donations/online`;

const OnlineDonationsList = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    totalAmount: 0
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDonation, setViewingDonation] = useState(null);

  const fetchDonations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&paymentStatus=${filterStatus}` : '';
      const purposeParam = filterPurpose ? `&purpose=${encodeURIComponent(filterPurpose)}` : '';
      const startParam = startDate ? `&startDate=${startDate}` : '';
      const endParam = endDate ? `&endDate=${endDate}` : '';
      
      const url = `${API_BASE}/all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${purposeParam}${startParam}${endParam}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch online donations');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, filterPurpose, startDate, endDate, toast]);

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
    fetchDonations();
    fetchStats();
  }, [fetchDonations, fetchStats]);

  const handleOpenViewModal = (donation) => {
    setViewingDonation(donation);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    const numberToWords = (num) => {
      const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
      const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
      const inWords = (n) => {
          if ((n = n.toString()).length > 9) return 'overflow';
          let m = ('000000000' + n).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
          if (!m) return;
          let str = '';
          str += (m[1] != 0) ? (a[Number(m[1])] || b[m[1][0]] + ' ' + a[m[1][1]]) + 'Crore ' : '';
          str += (m[2] != 0) ? (a[Number(m[2])] || b[m[2][0]] + ' ' + a[m[2][1]]) + 'Lakh ' : '';
          str += (m[3] != 0) ? (a[Number(m[3])] || b[m[3][0]] + ' ' + a[m[3][1]]) + 'Thousand ' : '';
          str += (m[4] != 0) ? (a[Number(m[4])] || b[m[4][0]] + ' ' + a[m[4][1]]) + 'Hundred ' : '';
          str += (m[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(m[5])] || b[m[5][0]] + ' ' + a[m[5][1]]) : '';
          return str.trim();
      };
      return inWords(num);
    };

    const dateStr = new Date(viewingDonation.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const amountStr = viewingDonation.amount.toLocaleString('en-IN');
    const amountWords = numberToWords(viewingDonation.amount) + ' Only';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Receipt - ${viewingDonation?.receiptNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #333; }
            .receipt-wrapper { max-width: 800px; margin: 20px auto; padding: 40px; border: 2px solid #1e3a8a; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .receipt-wrapper { margin: 0; padding: 20px; border: 2px solid #1e3a8a; box-shadow: none; max-width: 100%; }
            }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-section { display: flex; align-items: center; gap: 20px; }
            .logo-section img { width: 100px; height: 100px; object-fit: contain; border-radius: 50%; border: 1px solid #ccc; }
            .trust-info h1 { margin: 0 0 5px 0; color: #1e3a8a; font-size: 28px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
            .trust-info p { margin: 2px 0; font-size: 13px; color: #555; }
            .receipt-meta { text-align: right; }
            .receipt-meta .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 16px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; }
            .receipt-meta p { margin: 4px 0; font-size: 14px; font-weight: bold; font-family: monospace; color: #444; }
            
            .content { margin-bottom: 40px; }
            .info-row { display: flex; margin-bottom: 20px; font-size: 15px; line-height: 1.6; }
            .info-label { width: 220px; font-weight: 600; color: #555; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; }
            .info-value { flex: 1; font-weight: 700; color: #111; border-bottom: 1px dashed #ccc; padding-bottom: 2px; }
            
            .amount-box { margin-top: 30px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; }
            .amount-box .main-amount { font-size: 24px; font-weight: 900; color: #1e3a8a; margin-bottom: 5px; }
            .amount-box .words-amount { font-size: 14px; color: #475569; font-weight: 600; font-style: italic; }
            
            .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; }
            .notes { font-size: 12px; color: #64748b; line-height: 1.5; max-width: 60%; }
            .notes p { margin: 3px 0; }
            .signature { text-align: center; width: 200px; }
            .sig-line { border-bottom: 1px dashed #94a3b8; height: 40px; margin-bottom: 10px; }
            .sig-text { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 300)">
          <div class="receipt-wrapper">
            <div class="header">
              <div class="logo-section">
                <img src="${window.location.origin}/NGO%20logo.jpeg" alt="Logo" onerror="this.style.display='none'" />
                <div class="trust-info">
                  <h1>Savitram Foundation</h1>
                  <p><strong>Regd No.</strong> ADV/2024/99124</p>
                  <p>A non-profit organization dedicated to social welfare.</p>
                </div>
              </div>
              <div class="receipt-meta">
                <div class="badge">DONATION RECEIPT</div>
                <p>Receipt No: ${viewingDonation?.receiptNumber}</p>
                <p>Date: ${dateStr}</p>
              </div>
            </div>
            
            <div class="content">
              <div class="info-row">
                <div class="info-label">Received with thanks from</div>
                <div class="info-value">${viewingDonation?.donorName}</div>
              </div>
              ${viewingDonation?.donorPhone ? `
              <div class="info-row">
                <div class="info-label">Contact Number</div>
                <div class="info-value">${viewingDonation.donorPhone}</div>
              </div>` : ''}
              ${viewingDonation?.donorEmail ? `
              <div class="info-row">
                <div class="info-label">Email Address</div>
                <div class="info-value">${viewingDonation.donorEmail}</div>
              </div>` : ''}
              <div class="info-row">
                <div class="info-label">Donation Purpose</div>
                <div class="info-value">${viewingDonation?.purpose}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Payment Mode</div>
                <div class="info-value" style="text-transform: capitalize;">${viewingDonation?.paymentMethod ? viewingDonation.paymentMethod.replace('_', ' ') : 'Online Payment'}</div>
              </div>
              ${viewingDonation?.transactionId ? `
              <div class="info-row">
                <div class="info-label">Transaction Reference</div>
                <div class="info-value" style="font-family: monospace;">${viewingDonation.transactionId}</div>
              </div>` : ''}
              
              <div class="amount-box">
                <div class="main-amount">₹${amountStr}</div>
                <div class="words-amount">Rupees ${amountWords}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="notes">
                <p style="font-weight: bold; color: #334155; margin-bottom: 5px;">Important Notes:</p>
                <p>1. All donations are tax exempted under Section 80G of Income Tax Act.</p>
                <p>2. This is a computer generated receipt and requires no physical signature.</p>
                <p>3. Thank you for your generous contribution towards our cause.</p>
              </div>
              <div class="signature">
                <div class="sig-line"></div>
                <div class="sig-text">Authorized Signatory</div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Savitram Foundation</div>
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
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Zap className="text-blue-600" size={28} />
            Online Donations (Razorpay)
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1">All website donations received through Razorpay payment gateway</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            { label: 'Total Collected', value: `₹${stats.totalAmount.toLocaleString('en-IN')}`, color: '#2196F3', sub: 'From online payments' },
            { label: 'Total Transactions', value: stats.totalCount, color: '#FF9800', sub: 'All online donations' },
            { label: 'Completed', value: stats.completedCount, color: '#4CAF50', sub: 'Verified payments' },
            { label: 'Pending', value: stats.pendingCount, color: '#F44336', sub: 'Awaiting verification' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-3xl p-5 bg-white flex items-center gap-4 transition-all duration-300 hover:scale-[1.01] border border-gray-100 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}10` }}>
                <IndianRupee size={20} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-xl font-black text-gray-800 leading-tight">{card.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{card.label}</p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-3xl p-5 bg-white border border-gray-100 shadow-sm space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-1 md:col-span-2 lg:col-span-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Search</label>
              <input
                type="text"
                placeholder="Donor name, email, receipt..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-blue-500 transition-colors bg-gray-50/50 font-semibold text-gray-700"
              />
            </div>

            <div className="space-y-1 md:col-span-1 lg:col-span-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-blue-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer font-semibold text-gray-600"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-1 lg:col-span-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Purpose</label>
              <select
                value={filterPurpose}
                onChange={(e) => { setFilterPurpose(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-blue-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer font-semibold text-gray-600"
              >
                <option value="">All Purposes</option>
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Medical">Medical Aid</option>
                <option value="Disaster Relief">Disaster Relief</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2 lg:col-span-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="flex-1 px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-blue-500 transition-colors bg-gray-50/50 font-semibold"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="flex-1 px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-blue-500 transition-colors bg-gray-50/50 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm text-left">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold text-xs uppercase tracking-wider">No online donations yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 border-gray-150">
                    {['#', 'Receipt No', 'Donor', 'Contact', 'Purpose', 'Amount', 'Status', 'Date', 'Action'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-600">
                  {donations.map((donation, idx) => (
                    <tr key={donation._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-4 text-gray-400 font-bold">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-5 py-4 font-bold text-gray-800">{donation.receiptNumber}</td>
                      <td className="px-5 py-4">
                        <p className="font-extrabold text-gray-800">{donation.donorName}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {donation.donorPhone ? (
                            <p className="text-gray-700 font-bold text-xs flex items-center gap-1">
                              <Phone size={11} className="text-gray-400" /> {donation.donorPhone}
                            </p>
                          ) : null}
                          {donation.donorEmail ? (
                            <p className="text-gray-400 text-[10px] flex items-center gap-1 max-w-[150px] truncate" title={donation.donorEmail}>
                              <Mail size={11} className="text-gray-300" /> {donation.donorEmail}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-blue-50 text-blue-700 border border-blue-150">
                          {donation.purpose}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-gray-800 text-sm">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          donation.paymentStatus === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {donation.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-[10px]">
                        {new Date(donation.donationDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleOpenViewModal(donation)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-0 bg-transparent"
                          title="View Receipt"
                        >
                          <Eye size={16} className="text-blue-500" />
                        </button>
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
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-xl cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-gray-500">Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-xl cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Receipt Modal */}
      {isViewModalOpen && viewingDonation && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Donation Receipt
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-0 bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Printer size={14} />
                  Print
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div id="receipt-print-area" className="p-6 bg-white border border-gray-200 rounded-xl space-y-8 text-left">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src="/NGO logo.jpeg" alt="NGO Logo" className="h-12 w-12 rounded-full object-cover border" />
                    <div>
                      <h2 className="text-sm font-extrabold text-blue-950 tracking-wide uppercase">SAVITRAM FOUNDATION</h2>
                      <p className="text-[9px] text-gray-400 font-semibold tracking-wider">Regd No. ADV/2024/99124</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded bg-blue-50 text-blue-800 text-[10px] font-black uppercase tracking-wider border border-blue-100">
                      ONLINE PAYMENT
                    </span>
                    <p className="text-[10px] text-gray-500 mt-2 font-mono font-bold">Receipt: {viewingDonation.receiptNumber}</p>
                    <p className="text-[10px] text-gray-500 font-mono font-bold">
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
                    <span className="font-black text-blue-800 text-base block">₹{viewingDonation.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment Mode</span>
                    <span className="font-semibold text-gray-700 capitalize block">Razorpay Online Payment</span>
                  </div>
                  {viewingDonation.transactionId && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Transaction ID</span>
                      <span className="font-mono text-gray-600 block text-[11px]">{viewingDonation.transactionId}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Purpose</span>
                    <span className="font-bold text-gray-800 block">{viewingDonation.purpose}</span>
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

export default OnlineDonationsList;

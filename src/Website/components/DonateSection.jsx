import React, { useState, useEffect } from 'react';
import { Heart, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Wallet, User, Mail, Phone, IndianRupee, Globe2, Download, X } from 'lucide-react';
import API_BASE_URL from '../../shared/apiConfig';
import axios from 'axios';

export const DonateSection = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  const [donationType, setDonationType] = useState('Monthly');
  const [selectedAmount, setSelectedAmount] = useState('800');
  const [customAmount, setCustomAmount] = useState('');

  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    paymentMethod: 'online',
    purpose: 'General',
    notes: ''
  });

  const getImpactMessage = () => {
    const amountVal = selectedAmount === 'other' ? Number(customAmount) : Number(selectedAmount);
    if (!amountVal) return 'Provide critical resources to children in need';
    if (amountVal <= 800) return 'Help improve newborn survival and safe deliveries';
    if (amountVal <= 1200) return 'Provide life-saving nutrition and healthcare services';
    if (amountVal <= 2000) return 'Support rural girl education and learning materials';
    return 'Finance multiple village audits, clean water wells, and healthcare programs';
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const generateReceiptPDF = (data) => {
    const { donorName, amount, receiptNumber, transactionId, donationDate } = data;
    const formattedDate = new Date(donationDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Donation Receipt - ${receiptNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .receipt { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #1B5E20; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #1B5E20; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0 0 0; }
    .section { margin: 20px 0; }
    .section-title { font-weight: bold; color: #1B5E20; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .row:last-child { border-bottom: none; }
    .label { color: #666; font-weight: 500; }
    .value { color: #1B5E20; font-weight: bold; }
    .amount-section { background: #1B5E20; color: white; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0; }
    .amount-label { font-size: 14px; opacity: 0.9; }
    .amount-value { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
    .footer p { margin: 5px 0; }
    @media print { body { background: white; } .receipt { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>SAVITRAM FOUNDATION</h1>
      <p>Donation Receipt</p>
    </div>

    <div class="section">
      <div class="section-title">Donor Information</div>
      <div class="row">
        <span class="label">Name:</span>
        <span class="value">${donorName}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Receipt Details</div>
      <div class="row">
        <span class="label">Receipt Number:</span>
        <span class="value">${receiptNumber}</span>
      </div>
      <div class="row">
        <span class="label">Transaction ID:</span>
        <span class="value">${transactionId}</span>
      </div>
      <div class="row">
        <span class="label">Date:</span>
        <span class="value">${formattedDate}</span>
      </div>
    </div>

    <div class="amount-section">
      <div class="amount-label">Donation Amount</div>
      <div class="amount-value">₹${amount.toLocaleString('en-IN')}</div>
    </div>

    <div class="section">
      <p style="text-align: center; color: #1B5E20; font-weight: bold; margin: 20px 0;">
        Thank you for your generous contribution!
      </p>
      <p style="text-align: center; color: #666; font-size: 13px;">
        Your donation will help us continue our mission of healthcare, education, and community development.
      </p>
    </div>

    <div class="footer">
      <p>SAVITRAM FOUNDATION</p>
      <p>A-13, GRAPHIX 2 SECTOR 62, Noida, Uttar Pradesh - 201301</p>
      <p>Email: Support.savitramfoundation@gmail.com | Phone: 8860036008</p>
      <p style="margin-top: 20px;">This receipt has been generated digitally and is valid without signature.</p>
    </div>
  </div>

  <script>
    window.print();
  </script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Donation-Receipt-${receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setErrorMessage('');

    const finalAmount = selectedAmount === 'other' ? Number(customAmount) : Number(selectedAmount);

    if (!formData.donorName) {
      setStatus('error');
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!finalAmount || finalAmount <= 0) {
      setStatus('error');
      setErrorMessage('Please select or specify a valid donation amount.');
      return;
    }

    setLoading(true);

    try {
      const orderRes = await axios.post(`${API_BASE_URL}/api/payments/create-order`, {
        amount: finalAmount,
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        purpose: formData.purpose,
      });

      if (!orderRes.data.success) {
        throw new Error('Failed to create payment order');
      }

      const { orderId, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: finalAmount * 100,
        currency: 'INR',
        name: 'SAVITRAM FOUNDATION',
        description: `${donationType} Donation - ${formData.purpose}`,
        order_id: orderId,
        prefill: {
          name: formData.donorName,
          email: formData.donorEmail,
          contact: formData.donorPhone,
        },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${API_BASE_URL}/api/payments/verify-payment`, {
              razorpay_order_id: orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donorName: formData.donorName,
              donorEmail: formData.donorEmail,
              donorPhone: formData.donorPhone,
              amount: finalAmount,
              purpose: formData.purpose,
            });

            if (verifyRes.data.success) {
              setStatus('success');
              setSuccessData({
                donorName: verifyRes.data.donorName,
                amount: verifyRes.data.amount,
                receiptNumber: verifyRes.data.receiptNumber,
                transactionId: verifyRes.data.transactionId,
                donationDate: verifyRes.data.donationDate,
              });
              
              setFormData({
                donorName: '',
                donorEmail: '',
                donorPhone: '',
                paymentMethod: 'online',
                purpose: 'General',
                notes: ''
              });
              setCustomAmount('');
              setSelectedAmount('800');
            } else {
              setStatus('error');
              setErrorMessage('Payment verification failed. Please contact support.');
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setStatus('error');
            setErrorMessage('Payment verification error. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatus('error');
            setErrorMessage('Payment cancelled. Please try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Donation error:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setStatus(null);
    setSuccessData(null);
  };

  if (status === 'success' && successData) {
    return (
      <section className="py-20 text-left bg-transparent fixed inset-0 flex items-center justify-center z-50 bg-black/50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-[#1B5E20]">🎉 Donation Successful!</h2>
            <button onClick={closeSuccessModal} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="text-sm text-gray-700">
                Thank you, <span className="font-bold text-[#1B5E20]">{successData.donorName}</span>!
              </p>
              <p className="text-2xl font-black text-[#1B5E20] mt-2">
                ₹{successData.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Your donation has been received and a receipt has been sent to your email.
              </p>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Receipt Number:</span>
                <span className="font-bold text-[#1B5E20] select-all">{successData.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-bold text-[#1B5E20] select-all text-xs">{successData.transactionId}</span>
              </div>
            </div>

            <button
              onClick={() => generateReceiptPDF(successData)}
              className="w-full py-3 rounded-xl bg-[#1B5E20] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0d3d15] transition-all"
            >
              <Download size={18} />
              Download Receipt
            </button>

            <button
              onClick={closeSuccessModal}
              className="w-full py-3 rounded-xl bg-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-300 transition-all"
            >
              Close
            </button>

            <p className="text-xs text-center text-gray-600">
              A detailed receipt has been sent to your email. You can download it anytime from your email.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 text-left bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl"
            style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.06)' }}>
            
            <div className="space-y-4 mb-6">
              <div className="inline-block relative">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
                  Secure Checkout
                </span>
                <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0A1628]">
                Make a Lifesaving Impact
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed">
                Choose your level of commitment. Every single contribution contributes to auditing resources, rural development, and children's welfare.
              </p>
            </div>

            {status === 'error' && (
              <div className="mb-6 p-4 rounded-2xl bg-orange-50 border border-orange-100 text-orange-800 flex items-start gap-2.5">
                <AlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <span className="font-bold text-xs block">Form Error</span>
                  <p className="text-xs leading-normal font-semibold mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleDonateSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Donation Frequency</label>
                <div className="grid grid-cols-2 gap-3 bg-[#F8F7F4] p-1.5 rounded-2xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setDonationType('Monthly')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                      donationType === 'Monthly' 
                        ? 'bg-[#1B5E20] text-white shadow-md' 
                        : 'bg-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Monthly Support
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationType('One-time')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                      donationType === 'One-time' 
                        ? 'bg-[#1B5E20] text-white shadow-md' 
                        : 'bg-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    One-time Donation
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Select Amount (INR)</label>
                <div className="grid grid-cols-4 gap-3">
                  {['800', '1000', '1500'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`py-4 rounded-xl border-2 text-sm font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedAmount === amt 
                          ? 'bg-[#0A1628] text-white border-[#0A1628] scale-[1.02]' 
                          : 'bg-white text-gray-700 border-gray-250 hover:bg-[#F8F7F4]'
                      }`}
                    >
                      <span className="flex items-center text-xs">₹{amt}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedAmount('other')}
                    className={`py-4 rounded-xl border-2 text-sm font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      selectedAmount === 'other' 
                        ? 'bg-[#0A1628] text-white border-[#0A1628] scale-[1.02]' 
                        : 'bg-white text-gray-700 border-gray-250 hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <span className="text-xs">Other</span>
                  </button>
                </div>
              </div>

              {selectedAmount === 'other' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Custom Amount</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount in INR"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-[#1B5E20] outline-none text-sm font-semibold"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Full Name *</label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleFieldChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-[#1B5E20] outline-none text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    name="donorEmail"
                    value={formData.donorEmail}
                    onChange={handleFieldChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-[#1B5E20] outline-none text-sm font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number</label>
                  <input
                    type="tel"
                    name="donorPhone"
                    value={formData.donorPhone}
                    onChange={handleFieldChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-[#1B5E20] outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Donation Purpose</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-[#1B5E20] outline-none text-sm font-semibold bg-white cursor-pointer"
                >
                  <option value="General">General Fund</option>
                  <option value="Education">Education</option>
                  <option value="Medical">Medical Aid</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#1B5E20] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0d3d15] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart size={18} />
                    Donate Now
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-[#1B5E20] to-[#0d3d15] rounded-3xl p-8 text-white">
              <h3 className="text-xl font-black mb-4">Your Impact</h3>
              <p className="text-sm leading-relaxed opacity-90">{getImpactMessage()}</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: 'Secure Payment', desc: 'Powered by Razorpay' },
                { icon: CheckCircle2, title: 'Instant Receipt', desc: 'Digital receipt via email' },
                { icon: Globe2, title: 'Tax Exempted', desc: 'Section 80G compliant' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                  <item.icon className="text-[#1B5E20] flex-shrink-0" size={24} />
                  <div>
                    <p className="font-bold text-sm text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonateSection;

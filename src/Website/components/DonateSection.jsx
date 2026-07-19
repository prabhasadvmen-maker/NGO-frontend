import React, { useState } from 'react';
import { Heart, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Wallet, User, Mail, Phone, IndianRupee, Globe2 } from 'lucide-react';
import API_BASE_URL from '../../shared/apiConfig';

export const DonateSection = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  // Donation Selection State
  const [donationType, setDonationType] = useState('Monthly'); // 'Monthly' or 'One-time'
  const [selectedAmount, setSelectedAmount] = useState('800'); // '800', '1000', '1500', 'other'
  const [customAmount, setCustomAmount] = useState('');

  // Form Fields State
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

    const submissionData = {
      donorName: formData.donorName,
      donorEmail: formData.donorEmail || undefined,
      donorPhone: formData.donorPhone || undefined,
      amount: finalAmount,
      paymentMethod: formData.paymentMethod,
      purpose: formData.purpose,
      notes: formData.notes || `${donationType} Donation`,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/public/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus('success');
        setSuccessData(data.data);
        // Reset form
        setFormData({
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          paymentMethod: 'online',
          purpose: 'General',
          notes: ''
        });
        setCustomAmount('');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Failed to record donation. Please try again.');
      }
    } catch (err) {
      console.error('Donation submit error:', err);
      setStatus('error');
      setErrorMessage('Network or server connectivity issue. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 text-left bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Donation Form & Options */}
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

            {/* Status Banner */}
            {status === 'success' && successData && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
                  <span className="font-bold text-sm">Donation Received Successfully!</span>
                </div>
                <p className="text-xs leading-relaxed font-semibold">
                  Thank you, <span className="font-extrabold">{successData.donorName}</span>! Your payment of <span className="font-extrabold">₹{successData.amount.toLocaleString()}</span> has been recorded.
                </p>
                <div className="pt-2 border-t border-emerald-250/20 text-[10px] font-semibold text-emerald-600 space-y-1">
                  <p>Receipt Number: <span className="font-bold select-all">{successData.receiptNumber}</span></p>
                  <p>Transaction ID: <span className="font-bold select-all">{successData.transactionId}</span></p>
                </div>
              </div>
            )}

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
              
              {/* 1. Toggle Donation Type */}
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

              {/* 2. Amount Selection Cards */}
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
                    <span className="text-xs">OTHER</span>
                  </button>
                </div>

                {/* Custom Amount Input Field */}
                {selectedAmount === 'other' && (
                  <div className="relative pt-1 animate-fadeIn">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-gray-500 font-bold">
                      <IndianRupee size={16} />
                    </div>
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] outline-none text-sm bg-gray-50/50 font-bold"
                    />
                  </div>
                )}

                {/* Dynamic Impact Statement */}
                <div className="p-4 rounded-2xl bg-[#1B5E20]/5 border border-[#1B5E20]/10 text-xs font-semibold text-[#1B5E20] flex items-center gap-2">
                  <Heart size={14} className="text-[#1B5E20] fill-[#1B5E20]/20" />
                  <span>Impact: {getImpactMessage()}</span>
                </div>
              </div>

              {/* 3. Donor Personal Information */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">Donor Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="donorName"
                        placeholder="E.g., Rajesh Kumar"
                        value={formData.donorName}
                        onChange={handleFieldChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] outline-none text-sm bg-gray-50/50"
                      />
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="donorEmail"
                        placeholder="rajesh@example.com"
                        value={formData.donorEmail}
                        onChange={handleFieldChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] outline-none text-sm bg-gray-50/50"
                      />
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="donorPhone"
                        placeholder="9876543210"
                        value={formData.donorPhone}
                        onChange={handleFieldChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] outline-none text-sm bg-gray-50/50"
                      />
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Donation Purpose</label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] outline-none text-sm bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="General">General Fund</option>
                      <option value="Education">Education & Literacy</option>
                      <option value="Medical">Medical Aid & Health</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] outline-none text-sm bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="online">Online Secure Checkout (UPI, Card, NetBanking)</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                      <option value="cash">Cash / Cheque Pick up</option>
                    </select>
                  </div>

                  {/* Custom Notes */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      rows="2"
                      placeholder="Write a message or notes about your donation..."
                      value={formData.notes}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] outline-none text-sm bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-sm font-extrabold text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg flex items-center justify-center gap-2 border-0"
                style={{ backgroundColor: '#F97316' }} // Custom Orange Accent
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <span>PROCEED & DONATE NOW</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Secure Checkout details */}
              <div className="flex items-center justify-center gap-2 text-gray-400 font-bold text-[10px] uppercase">
                <ShieldCheck size={14} className="text-[#1B5E20]" />
                <span>Secure 256-bit SSL encrypted connection</span>
              </div>
            </form>
          </div>

          {/* Right: UNICEF Styled Story Card */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-36">
            
            {/* Media Story Card */}
            <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-xl relative"
              style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.06)' }}>
              <div className="h-96 w-full relative">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop"
                  alt="Child in rural village"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/95 via-[#0A1628]/40 to-transparent" />
                
                {/* Floating promise quote inside cover */}
                <div className="absolute bottom-6 left-6 right-6 text-white text-left space-y-2">
                  <span className="text-[10px] text-orange-400 font-black uppercase tracking-wider block">UNICEF Styled Outreach</span>
                  <h2 className="font-display font-black text-2xl leading-tight">
                    Your PROMISE can change a child's story.
                  </h2>
                  <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                    "Access to clean health checkups and basic education represents the absolute baseline of a dignified childhood."
                  </p>
                </div>
              </div>
            </div>

            {/* Impact Stats Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4"
              style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}>
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <Globe2 className="text-[#1B5E20]" size={18} />
                <h3 className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">Our Cumulative Impact</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-xl font-black text-[#1B5E20] block">12,500+</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 block leading-none">Lives Impacted</span>
                </div>
                <div>
                  <span className="text-xl font-black text-[#1B5E20] block">35+</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 block leading-none">Audited Projects</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Why Monthly Support Matters */}
        <div className="mt-20 border-t border-gray-200/50 pt-16 space-y-12">
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0A1628]">
              Why does monthly support matter?
            </h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              By donating monthly, you enable the SAVITRAM FOUNDATION to allocate funds systematically, ensure consistent logistics, and plan large-scale audits and healthcare setups beforehand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: 'Long-term Planning',
                desc: 'Sustainable development campaigns like setting up schools, hiring local doctors, and installing water filtration devices take months. Monthly support keeps these campaigns running continuously.',
                icon: <Wallet className="text-[#1B5E20]" size={20} />
              },
              {
                title: 'Direct Allocation',
                desc: 'Directing your donations directly to local branches allows local departments to quickly resolve urgent requirements, such as purchasing medicines or educational stationary.',
                icon: <User className="text-[#1B5E20]" size={20} />
              },
              {
                title: 'Transparency Audits',
                desc: 'We are committed to absolute financial clarity. Every single rupee received is accounted for, and our financial balance sheets and audit metrics are fully public and visible.',
                icon: <ShieldCheck className="text-[#1B5E20]" size={20} />
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-50 p-6 rounded-2xl shadow-sm space-y-3"
                style={{ boxShadow: '6px 6px 12px #EFEFEF, -6px -6px 12px #FFFFFF' }}>
                <div className="w-10 h-10 rounded-xl bg-[#1B5E20]/5 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-display font-extrabold text-base text-[#0A1628]">{item.title}</h3>
                <p className="text-xs text-gray-550 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default DonateSection;

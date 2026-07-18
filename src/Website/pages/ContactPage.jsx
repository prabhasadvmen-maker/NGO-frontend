import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import API_BASE_URL from '../../shared/apiConfig';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const ContactPage = () => {
  const { data: ngoProfile } = usePublicAPI('/api/ngo-profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [focused, setFocused] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleFocus = (field) => setFocused(prev => ({ ...prev, [field]: true }));
  const handleBlur = (field) => {
    if (!formData[field]) {
      setFocused(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/cms/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setFocused({});
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Failed to send enquiry.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCleanMapUrl = (address) => {
    if (!address) return '';
    const clean = address.replace(/[()]/g, '').trim();
    return `https://maps.google.com/maps?q=${encodeURIComponent(clean)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  const defaultAddress = ngoProfile?.address || 'ADVMEN Technologies Pvt. Ltd., Jharsa Village, Sector 38, Gurugram (Gurgaon), Haryana, India';
  const defaultPhone = ngoProfile?.phone || '+91 83750 08009';
  const defaultEmail = ngoProfile?.email || 'hello@advmen.com';

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Get In Touch" description="Get in touch with SAVITRAM FOUNDATION. Access branch addresses, helpline numbers, and direct support email desks." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        {/* Page Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200/50 mb-16">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Savitram Offices
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Get In Touch
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Reach out to our offices or submit a query.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-16">
          
          {/* Left Column: Enquiry Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-[#F8F7F4] border-0 shadow-[8px_8px_20px_#e5e4e1,-8px_-8px_20px_#ffffff]">
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="pb-2 border-b border-gray-50">
                <h3 className="font-display font-black text-xl text-[#0A1628]">Quick Enquiry Desk</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Send a direct message to our local program directors.</p>
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 className="flex-shrink-0" />
                  <span className="text-xs font-bold">Thank you! Your inquiry has been sent successfully.</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <AlertCircle className="flex-shrink-0" />
                  <span className="text-xs font-bold">{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <input 
                    type="text" 
                    name="name"
                    id="name"
                    value={formData.name}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
                  />
                  <label 
                    htmlFor="name"
                    className={`absolute left-4 top-3 text-xs font-bold tracking-wide transition-all duration-300 pointer-events-none ${
                      focused.name || formData.name 
                        ? 'transform -translate-y-6 text-[10px] text-[#1B5E20] bg-white px-1' 
                        : 'text-gray-400'
                    }`}
                  >
                    Your Name *
                  </label>
                </div>

                <div className="relative">
                  <input 
                    type="email" 
                    name="email"
                    id="email"
                    value={formData.email}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
                  />
                  <label 
                    htmlFor="email"
                    className={`absolute left-4 top-3 text-xs font-bold tracking-wide transition-all duration-300 pointer-events-none ${
                      focused.email || formData.email 
                        ? 'transform -translate-y-6 text-[10px] text-[#1B5E20] bg-white px-1' 
                        : 'text-gray-400'
                    }`}
                  >
                    Your Email *
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <input 
                    type="tel" 
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onFocus={() => handleFocus('phone')}
                    onBlur={() => handleBlur('phone')}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
                  />
                  <label 
                    htmlFor="phone"
                    className={`absolute left-4 top-3 text-xs font-bold tracking-wide transition-all duration-300 pointer-events-none ${
                      focused.phone || formData.phone 
                        ? 'transform -translate-y-6 text-[10px] text-[#1B5E20] bg-white px-1' 
                        : 'text-gray-400'
                    }`}
                  >
                    Phone Number
                  </label>
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onFocus={() => handleFocus('subject')}
                    onBlur={() => handleBlur('subject')}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
                  />
                  <label 
                    htmlFor="subject"
                    className={`absolute left-4 top-3 text-xs font-bold tracking-wide transition-all duration-300 pointer-events-none ${
                      focused.subject || formData.subject 
                        ? 'transform -translate-y-6 text-[10px] text-[#1B5E20] bg-white px-1' 
                        : 'text-gray-400'
                    }`}
                  >
                    Enquiry Subject
                  </label>
                </div>
              </div>

              <div className="relative">
                <textarea 
                  name="message"
                  id="message"
                  value={formData.message}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold font-sans"
                />
                <label 
                  htmlFor="message"
                  className={`absolute left-4 top-3 text-xs font-bold tracking-wide transition-all duration-300 pointer-events-none ${
                    focused.message || formData.message 
                      ? 'transform -translate-y-6 text-[10px] text-[#1B5E20] bg-white px-1' 
                      : 'text-gray-400'
                  }`}
                >
                  Your Message *
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#1B5E20] text-xs font-extrabold text-white flex items-center justify-center gap-2 hover:scale-[1.01] hover:brightness-110 shadow-none border-0 cursor-pointer disabled:opacity-50 transition-all"
              >
                <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Right Column: Contact details */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Info Card Container */}
            <div className="p-8 rounded-3xl bg-[#F8F7F4] border-0 shadow-[8px_8px_20px_#e5e4e1,-8px_-8px_20px_#ffffff] text-left space-y-6">
              <h2 className="font-display font-black text-2xl text-[#0A1628]">Contact Information</h2>
              
              <div className="space-y-4">
                {/* Helpline Card */}
                <div className="flex gap-4 items-center p-4 rounded-2xl bg-[#F8F7F4] border-0 shadow-[4px_4px_10px_#e5e4e1,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#e1e0dd,-6px_-6px_14px_#ffffff] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="p-3 bg-[#1B5E20]/10 text-[#1B5E20] rounded-xl flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Call Branch Helpline</p>
                    <p className="text-xs font-bold text-[#0A1628] mt-0.5">{defaultPhone}</p>
                  </div>
                </div>

                {/* Email Card */}
                <div className="flex gap-4 items-center p-4 rounded-2xl bg-[#F8F7F4] border-0 shadow-[4px_4px_10px_#e5e4e1,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#e1e0dd,-6px_-6px_14px_#ffffff] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="p-3 bg-[#2196F3]/10 text-[#2196F3] rounded-xl flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Official Email Desk</p>
                    <p className="text-xs font-bold text-[#0A1628] mt-0.5">{defaultEmail}</p>
                  </div>
                </div>

                {/* Address Card */}
                <div className="flex gap-4 items-center p-4 rounded-2xl bg-[#F8F7F4] border-0 shadow-[4px_4px_10px_#e5e4e1,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#e1e0dd,-6px_-6px_14px_#ffffff] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="p-3 bg-[#9C27B0]/10 text-[#9C27B0] rounded-xl flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Headquarters Office</p>
                    <p className="text-xs font-bold text-[#0A1628] mt-0.5 leading-relaxed">{defaultAddress}</p>
                  </div>
                </div>

                {/* Timings Card */}
                <div className="flex gap-4 items-center p-4 rounded-2xl bg-[#F8F7F4] border-0 shadow-[4px_4px_10px_#e5e4e1,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#e1e0dd,-6px_-6px_14px_#ffffff] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="p-3 bg-[#F97316]/10 text-[#F97316] rounded-xl flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Office Timings</p>
                    <p className="text-xs font-bold text-[#0A1628] mt-0.5">Mon-Sat, 9AM - 6PM IST</p>
                  </div>
                </div>
              </div>
            </div>



          </div>

          {/* Bottom Full-Width Column: Map (lg:col-span-12) */}
        </div>

        {/* Bottom Full-Width Column: Map (Outside grid to eliminate layout gaps) */}
        <div className="max-w-7xl mx-auto px-6 mt-12 text-left mb-16">
          <div className="p-8 rounded-3xl bg-[#F8F7F4] border-0 shadow-[8px_8px_20px_#e5e4e1,-8px_-8px_20px_#ffffff] space-y-4">
            <div>
              <h4 className="text-[10px] font-bold text-[#1B5E20] uppercase tracking-widest text-left">Our Location Map</h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Find us on Google Maps</p>
            </div>
            <div className="p-2 bg-[#F8F7F4] rounded-3xl shadow-[inset_3px_3px_8px_#e5e4e1,inset_-3px_-3px_8px_#ffffff] h-[360px] md:h-[450px] relative">
              <div className="w-full h-full rounded-2xl overflow-hidden relative bg-gray-100">
                <iframe 
                  src={getCleanMapUrl(defaultAddress)}
                  width="100%" 
                  height="100%" 
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="HQ Map Location"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default ContactPage;

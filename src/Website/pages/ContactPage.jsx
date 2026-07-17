import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
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
          
          {/* Left Column: Contact details & Integrated Map */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0A1628]">Contact Information</h2>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Have questions about our programs, audit reports, or want to partner with us? Leave a message, and our local branch team will respond shortly.
              </p>

              <div className="space-y-4">
                {/* Helpline Card */}
                <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
                  <div className="p-3 bg-[#1B5E20]/10 text-[#1B5E20] rounded-xl flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Call Branch Helpline</p>
                    <p className="text-xs font-bold text-[#0A1628] mt-0.5">{defaultPhone}</p>
                  </div>
                </div>

                {/* Email Card */}
                <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
                  <div className="p-3 bg-[#2196F3]/10 text-[#2196F3] rounded-xl flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Official Email Desk</p>
                    <p className="text-xs font-bold text-[#0A1628] mt-0.5">{defaultEmail}</p>
                  </div>
                </div>

                {/* Address Card */}
                <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
                  <div className="p-3 bg-[#9C27B0]/10 text-[#9C27B0] rounded-xl flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Headquarters Office</p>
                    <p className="text-xs font-bold text-[#0A1628] mt-0.5 leading-relaxed">{defaultAddress}</p>
                  </div>
                </div>

                {/* Timings Card */}
                <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
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

            {/* Integrated Industrial Map */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Our Location Map</h4>
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-md h-[280px] relative bg-gray-100">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3508.835438883204!2d77.0396825!3d28.4393668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d18721c56f2a3%3A0xe1043329f622eb1f!2sADVMEN%20Technologies%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
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

            {/* Social Links */}
            <div className="space-y-3 pt-6 border-t border-gray-200/50">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Connect with Socials</h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: Facebook, href: 'https://facebook.com' },
                  { icon: Twitter, href: 'https://twitter.com' },
                  { icon: Instagram, href: 'https://instagram.com' },
                  { icon: Linkedin, href: 'https://linkedin.com' }
                ].map((soc, i) => {
                  const Icon = soc.icon;
                  return (
                    <a
                      key={i}
                      href={soc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#1B5E20] hover:text-white hover:border-[#1B5E20] transition-all"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white border border-gray-100 flex flex-col justify-between shadow-lg">
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

        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default ContactPage;

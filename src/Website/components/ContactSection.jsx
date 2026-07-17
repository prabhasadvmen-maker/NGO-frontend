import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import API_BASE_URL from '../../shared/apiConfig';
import useScrollAnimation from '../hooks/useScrollAnimation';

export const ContactSection = () => {
  const { ref, isVisible } = useScrollAnimation();
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
      if (data.success) {
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

  return (
    <section 
      ref={ref}
      className={`relative py-32 bg-[#F8F7F4] reveal ${isVisible ? 'visible' : ''}`}
      id="contact-section"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Contact details & map placeholder */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="inline-block relative">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
              Get in Touch
            </span>
            <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#0A1628] leading-tight">
            We'd Love to <br />
            <span className="text-[#1B5E20]">Hear From You.</span>
          </h2>

          <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
            Have questions about our programs, audit reports, or want to partner with us? Leave a message, and our local branch team will respond shortly.
          </p>

          {/* Info cards (Neomorphic soft shapes) */}
          <div className="space-y-4 pt-4">
            <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-gray-50 shadow-sm">
              <div className="p-3 bg-[#1B5E20]/10 text-[#1B5E20] rounded-xl flex-shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Call Branch Helpline</p>
                <p className="text-xs font-bold text-[#0A1628] mt-0.5">+91 99999 88888</p>
              </div>
            </div>

            <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-gray-50 shadow-sm">
              <div className="p-3 bg-[#2196F3]/10 text-[#2196F3] rounded-xl flex-shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Official Email Desk</p>
                <p className="text-xs font-bold text-[#0A1628] mt-0.5">contact@savitram.org</p>
              </div>
            </div>

            <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-gray-50 shadow-sm">
              <div className="p-3 bg-[#9C27B0]/10 text-[#9C27B0] rounded-xl flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Headquarters Office</p>
                <p className="text-xs font-bold text-[#0A1628] mt-0.5">Savitram Foundation Tower, Gomti Nagar, Lucknow, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Form (Liquid Glass + Soft borders) */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-white border border-gray-100 flex flex-col justify-between"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          
          <div className="pb-4 border-b border-gray-100 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0A1628]">Quick Inquiry Form</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Send an direct message to our directors</p>
            </div>
            <Clock size={16} className="text-gray-400 animate-spin-slow" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Status alerts */}
            {status === 'success' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="flex-shrink-0" />
                <span className="text-xs font-bold">Thank you! Your inquiry was submitted successfully. Our branch coordinators will reach out.</span>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200">
                <AlertCircle className="flex-shrink-0" />
                <span className="text-xs font-bold">{errorMessage}</span>
              </div>
            )}

            {/* Inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-250 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
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

              {/* Email */}
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-250 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
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
              {/* Phone */}
              <div className="relative">
                <input 
                  type="tel" 
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onFocus={() => handleFocus('phone')}
                  onBlur={() => handleBlur('phone')}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-250 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
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

              {/* Subject */}
              <div className="relative">
                <input 
                  type="text" 
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onFocus={() => handleFocus('subject')}
                  onBlur={() => handleBlur('subject')}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-250 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
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

            {/* Message */}
            <div className="relative">
              <textarea 
                name="message"
                id="message"
                value={formData.message}
                onFocus={() => handleFocus('message')}
                onBlur={() => handleBlur('message')}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-250 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-semibold"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#1B5E20] text-xs font-extrabold text-white flex items-center justify-center gap-2 hover:scale-[1.01] hover:brightness-110 shadow-md shadow-emerald-800/10 cursor-pointer disabled:opacity-50 transition-all"
            >
              <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
              <Send size={14} />
            </button>
          </form>

        </div>

      </div>
    </section>
  );
};

export default ContactSection;

import React, { useState } from 'react';
import { Award, Users, BookOpen, Clock, Heart, CheckCircle2, AlertCircle, MapPin, Check } from 'lucide-react';
import API_BASE_URL from '../../shared/apiConfig';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const VolunteerPage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    skills: '',
    availability: 'Weekends'
  });

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.city || !formData.skills) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setStatus(null);

    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: 'Volunteer Application',
      message: `City: ${formData.city}\nSkills: ${formData.skills}\nAvailability: ${formData.availability}`
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/public/cms/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', city: '', skills: '', availability: 'Weekends' });
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Failed to submit application.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Volunteer With Us" description="Apply to join SAVITRAM FOUNDATION as a volunteer. Support rural classrooms, medical camps, and community outreach campaigns." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        {/* Page Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200/50 mb-16">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Outreach Desk
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Volunteer With Us
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Join thousands of youths making a real change in India.</p>
        </div>

        {/* Why Volunteer (3 reason cards) */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Heart, title: 'Make Real Impact', desc: 'Interact directly with local families, witness outcomes, and guide on-ground programs.' },
            { icon: Award, title: 'Build Skills & Experience', desc: 'Gain leadership, project management, and community skilling experience.' },
            { icon: Users, title: 'Join a Community', desc: 'Connect with a passionate group of audit-focused volunteers across branches.' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-white border border-gray-100/50 shadow-md flex flex-col justify-between"
                style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-sm text-[#0A1628]">{item.title}</h3>
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed pt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Stats Strip */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="bg-[#0A1628] rounded-[20px] p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-white text-center shadow-lg border border-white/5">
            <div className="space-y-1">
              <span className="text-3xl font-black block">450+</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Active Volunteers</span>
            </div>
            <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-white/10 py-4 sm:py-0">
              <span className="text-3xl font-black block">35+</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Projects Supported</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-black block">12+</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Districts Covered</span>
            </div>
          </div>
        </section>

        {/* Form and requirements grid */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-20">
          {/* Requirements (Left) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h2 className="font-display font-black text-2xl text-[#0A1628]">Service Benchmarks</h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              We audit volunteer hours to ensure complete operational integrity. Before applying, review our core requirements:
            </p>

            <div className="space-y-3.5 text-xs text-gray-700 font-semibold">
              {[
                'Must be at least 18 years of age.',
                'Minimum service commitment of 4 hours per week.',
                'Willingness to join local branch induction modules.',
                'Adapt to any skill area (we provide training modules).'
              ].map((req, idx) => (
                <div key={idx} className="flex gap-2.5 items-center">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#1B5E20] border border-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form (Right) */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-white border border-gray-100 shadow-lg"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            
            <h3 className="font-display font-extrabold text-xl text-[#0A1628] mb-6">Volunteer Application</h3>

            {status === 'success' ? (
              <div className="py-8 space-y-4 text-center">
                <CheckCircle2 size={42} className="text-green-500 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#0A1628]">Application Submitted!</p>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    Thank you. Your volunteer application request has been received. Our branch secretary coordinators will contact you via email soon.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-5">
                {status === 'error' && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 text-red-600 border border-red-150 text-xs font-bold leading-normal">
                    <AlertCircle className="flex-shrink-0" size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">City *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.city}
                      onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Preferred Service Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData(p => ({ ...p, availability: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                  >
                    <option value="Weekends">Weekends Only</option>
                    <option value="Weekdays">Weekdays Only</option>
                    <option value="Flexible">Flexible / On-call</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Describe Your Skills & Interests *</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.skills}
                    onChange={(e) => setFormData(p => ({ ...p, skills: e.target.value }))}
                    placeholder="E.g. teaching experience, healthcare coordination, social media expertise..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1B5E20] rounded-xl text-xs font-extrabold text-white hover:brightness-110 shadow-md transition-all hover:scale-[1.01] cursor-pointer mt-2 disabled:opacity-55"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* CTA section bottom */}
        <section className="max-w-7xl mx-auto px-6 text-center">
          <div className="rounded-3xl p-12 bg-gradient-to-r from-[#0A1628] to-[#1B5E20] text-white flex flex-col items-center justify-center space-y-4">
            <h2 className="font-display font-black text-3xl sm:text-4xl">Ready to Make a Difference?</h2>
            <p className="text-xs text-white/70 max-w-xl font-semibold leading-relaxed">
              If you have any questions before applying, feel free to visit our Noida Sector 62 main HQ center or leave a line at our contact helpline desk.
            </p>
          </div>
        </section>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default VolunteerPage;

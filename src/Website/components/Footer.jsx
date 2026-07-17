import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import API_BASE_URL from '../../shared/apiConfig';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/cms/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter Subscriber',
          email,
          subject: 'Newsletter Subscription',
          message: 'User signed up for newsletter subscription via footer.'
        })
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
        setError('');
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        setError('Subscription failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0A1628] text-white pt-20 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Column 1: Logo and Mission */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/NGO logo.jpeg"
              alt="Savitram Foundation Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-lg"
            />
            <div className="flex flex-col">
              <span className="font-display font-extrabold tracking-tight text-lg text-white">
                SAVITRAM
              </span>
              <span className="text-[9px] font-bold text-[#1B5E20] uppercase tracking-widest -mt-1">
                Foundation
              </span>
            </div>
          </Link>
          <p className="text-xs text-white/60 font-medium leading-relaxed">
            SAVITRAM FOUNDATION is a non-governmental organization committed to restoring dignity, providing quality education, healthcare, and sustainable development to underprivileged communities across India.
          </p>
          {/* Social Icons */}
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
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-300 hover:bg-[#1B5E20] hover:text-white hover:border-[#1B5E20]"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
          <form onSubmit={handleSubscribe} className="space-y-2 pt-2 text-left">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Newsletter
            </p>
            {error && <p className="text-[9px] text-red-400 font-semibold">{error}</p>}
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={subscribed ? "Subscribed!" : "your@email.com"}
                disabled={subscribed || submitting}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#1B5E20] font-semibold disabled:opacity-75"
              />
              <button 
                type="submit"
                disabled={submitting || subscribed}
                className="px-3 py-2 rounded-lg bg-[#1B5E20] text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer border-0 disabled:opacity-55"
              >
                {subscribed ? 'Joined' : submitting ? '...' : 'Join'}
              </button>
            </div>
          </form>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] mb-6">Quick Links</h4>
          <ul className="space-y-3.5 text-xs text-white/60 font-semibold text-left">
            {[
              { label: 'Home', path: '/' },
              { label: 'About Us', path: '/about' },
              { label: 'Featured Projects', path: '/projects' },
              { label: 'Events Calendar', path: '/events' },
              { label: 'News & Media', path: '/news' },
              { label: 'Contact Us', path: '/contact' }
            ].map((l, idx) => (
              <li key={idx}>
                <Link to={l.path} className="hover:text-white transition-colors duration-200">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Get Involved */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] mb-6">Get Involved</h4>
          <ul className="space-y-3.5 text-xs text-white/60 font-semibold text-left">
            {[
              { label: 'Donate Directly', path: '/crowdfunding' },
              { label: 'NGO Membership', path: '/membership' },
              { label: 'Volunteer Application', path: '/volunteer' },
              { label: 'Internships', path: '/volunteer' }
            ].map((l, idx) => (
              <li key={idx}>
                <Link to={l.path} className="hover:text-white transition-colors duration-200">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Trust & Legal */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] mb-6">Trust & Legal</h4>
          <ul className="space-y-3.5 text-xs text-white/60 font-semibold text-left">
            {[
              { label: 'Verify Document', path: '/verify' },
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Terms & Conditions', path: '/terms' },
              { label: 'Refund Policy', path: '/refund' }
            ].map((l, idx) => (
              <li key={idx}>
                <Link to={l.path} className="hover:text-white transition-colors duration-200">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/45">
        <span>
          © {currentYear} Savitram Foundation. All rights reserved. Registered NGO in India.
        </span>
        <span className="flex items-center gap-1">
          Together, we can build a better tomorrow <Heart size={12} className="text-red-500 fill-current" />
        </span>
      </div>
    </footer>
  );
};

export default Footer;

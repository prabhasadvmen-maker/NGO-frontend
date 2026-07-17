import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import { COLORS } from '../../shared/colors';
import { useAuth } from '../../shared/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Our Work', path: '/our-work' },
    { label: 'Projects', path: '/projects' },
    { label: 'Events', path: '/events' },
    { label: 'Crowdfunding', path: '/crowdfunding' },
    { label: 'News', path: '/news' },
    { label: 'Contact', path: '/contact' },
  ];

  const isHome = location.pathname === '/';

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-white/95 backdrop-blur-md shadow-md py-4 border-b border-gray-100' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/NGO logo.jpeg"
              alt="Savitram Foundation Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-display font-extrabold tracking-tight text-lg text-[#0A1628]">
                SAVITRAM
              </span>
              <span className="text-[9px] font-bold text-[#1B5E20] uppercase tracking-widest -mt-1">
                Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    active 
                      ? 'text-[#1B5E20]' 
                      : 'text-[#64748B] hover:text-[#0A1628]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-[-6px] left-0 w-full h-0.5 bg-[#1B5E20] rounded-full animate-slide" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA & Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <Link
                to={user.role === 'super_admin' ? '/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#0A1628] text-xs font-bold text-[#0A1628] transition-all hover:bg-[#0A1628]/5"
              >
                <User size={14} />
                <span>My Portal</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#0A1628] text-xs font-bold text-[#0A1628] transition-all hover:bg-[#0A1628]/5"
              >
                <User size={14} />
                <span>Login</span>
              </Link>
            )}
            <Link
              to="/crowdfunding"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F97316] text-xs font-extrabold text-white transition-all hover:scale-105 hover:brightness-110 shadow-md shadow-orange-500/20"
            >
              <span>Donate Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Hamburguer Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-[#0A1628] hover:bg-gray-100 transition-colors border-0 bg-transparent"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay Menu */}
      <div className={`fixed inset-0 z-30 bg-[#0A1628] flex flex-col justify-center px-8 transition-transform duration-500 ease-out lg:hidden ${
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col gap-6 text-left">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-2xl font-display font-bold transition-all duration-300 ${
                  active ? 'text-[#1B5E20] translate-x-2' : 'text-white/60 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="h-px bg-white/10 my-6" />

          {/* Mobile CTAs */}
          <div className="flex flex-col gap-4">
            {user ? (
              <Link
                to={user.role === 'super_admin' ? '/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-white text-sm font-bold text-white transition-all hover:bg-white/5"
              >
                <User size={16} />
                <span>My Portal</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-white text-sm font-bold text-white transition-all hover:bg-white/5"
              >
                <User size={16} />
                <span>Login</span>
              </Link>
            )}
            <Link
              to="/crowdfunding"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#F97316] text-sm font-extrabold text-white transition-all shadow-lg"
            >
              <span>Donate Now</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

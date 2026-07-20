import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight, 
  User, 
  Phone, 
  Mail, 
  Heart, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollWidth(progress);
      } else {
        setScrollWidth(0);
      }
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
    { label: 'About Us', path: '/about' },
    { label: 'Our Work', path: '/our-work' },
    { label: 'Projects', path: '/projects' },
    { label: 'Events', path: '/events' },
    { label: 'News', path: '/news' },
    { label: 'Donate', path: '/donate' },
    { label: 'Crowdfunding', path: '/crowdfunding' },
  ];

  const isHome = location.pathname === '/';
  const isJoinActive = location.pathname === '/membership' || location.pathname === '/volunteer';

  return (
    <>
      <div className="scroll-progress-bar" style={{ width: `${scrollWidth}%` }} />
      <header className={`fixed top-0 left-0 w-full z-40 transition-transform duration-300 ${
        scrolled ? 'lg:-translate-y-8 shadow-md' : 'translate-y-0'
      }`}>
        {/* Top Info Bar (Navy Blue) */}
        <div className="bg-[#0A1628] text-white text-[11px] font-bold py-2 px-6 hidden lg:block border-b border-white/5 h-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Contact info */}
            <div className="flex items-center gap-6">
              <a href="tel:+918860036008" className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                <Phone size={11} className="text-white" />
                <span>+91 88600 36008</span>
              </a>
              <a href="mailto:Support.savitramfoundation@gmail.com" className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                <Mail size={11} className="text-white" />
                <span>Support.savitramfoundation@gmail.com</span>
              </a>
            </div>

            {/* Center: Heart icon + Message */}
            <div className="flex items-center gap-1.5">
              <Heart size={11} className="text-green-500 fill-green-500" />
              <span>Working for a Better Tomorrow</span>
            </div>

            {/* Right: Social Media links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-medium">Follow Us :</span>
              <div className="flex items-center gap-3">
                <a href="#" className="hover:text-green-400 transition-colors"><Facebook size={11} /></a>
                <a href="#" className="hover:text-green-400 transition-colors"><Instagram size={11} /></a>
                <a href="#" className="hover:text-green-400 transition-colors"><Twitter size={11} /></a>
                <a href="#" className="hover:text-green-400 transition-colors"><Youtube size={11} /></a>
                <a href="#" className="hover:text-green-400 transition-colors"><Linkedin size={11} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Bar (White) */}
        <nav className={`bg-white transition-all duration-300 border-b border-gray-100 ${
          scrolled ? 'py-2' : 'py-3'
        }`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            {/* Logo Brand */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/NGO logo.jpeg"
                alt="Savitram Foundation Logo"
                className="w-10 h-10 xl:w-12 xl:h-12 rounded-full object-cover border border-gray-155 transition-transform duration-300 group-hover:scale-105"
                decoding="async"
                width="48"
                height="48"
              />
              <div className="flex flex-col text-left">
                <span className="font-display font-extrabold tracking-tight text-lg xl:text-xl text-[#0A1628] leading-none">
                  SAVITRAM
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="h-[1.5px] w-2 bg-[#F97316]" />
                  <span className="text-[8px] xl:text-[9px] font-bold text-[#1B5E20] tracking-[0.15em] xl:tracking-[0.18em] uppercase leading-none">
                    FOUNDATION
                  </span>
                  <span className="h-[1.5px] w-2 bg-[#F97316]" />
                </div>
                <span className="hidden xl:block text-[8px] font-semibold text-gray-500 uppercase tracking-widest leading-none mt-1">
                  Together We Can
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-5.5 flex-shrink-0">
              {/* Home */}
              <Link
                to="/"
                className={`relative text-[10px] xl:text-xs font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${
                  location.pathname === '/' ? 'text-[#1B5E20]' : 'text-[#334155] hover:text-[#0A1628]'
                }`}
              >
                Home
                {location.pathname === '/' && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-0.5 bg-[#1B5E20] rounded-full" />
                )}
              </Link>

              {/* About Us */}
              <Link
                to="/about"
                className={`relative text-[10px] xl:text-xs font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${
                  location.pathname === '/about' ? 'text-[#1B5E20]' : 'text-[#334155] hover:text-[#0A1628]'
                }`}
              >
                About Us
                {location.pathname === '/about' && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-0.5 bg-[#1B5E20] rounded-full" />
                )}
              </Link>

              {/* Our Impact Hover Dropdown */}
              <div className="relative group/dropdown py-2">
                <button 
                  className={`flex items-center gap-0.5 text-[10px] xl:text-xs font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer transition-colors duration-300 whitespace-nowrap ${
                    location.pathname === '/our-work' || location.pathname === '/projects' || location.pathname === '/events' || location.pathname === '/news'
                      ? 'text-[#1B5E20]' 
                      : 'text-[#334155] hover:text-[#0A1628]'
                  }`}
                >
                  <span>Our Impact</span>
                  <ChevronDown size={11} />
                </button>
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-50">
                  <Link
                    to="/our-work"
                    className="block px-4 py-2.5 text-xs font-bold text-[#334155] hover:text-[#1B5E20] hover:bg-green-50/50 transition-colors"
                  >
                    Our Work
                  </Link>
                  <Link
                    to="/projects"
                    className="block px-4 py-2.5 text-xs font-bold text-[#334155] hover:text-[#1B5E20] hover:bg-green-50/50 transition-colors"
                  >
                    Projects
                  </Link>
                  <Link
                    to="/events"
                    className="block px-4 py-2.5 text-xs font-bold text-[#334155] hover:text-[#1B5E20] hover:bg-green-50/50 transition-colors"
                  >
                    Events
                  </Link>
                  <Link
                    to="/news"
                    className="block px-4 py-2.5 text-xs font-bold text-[#334155] hover:text-[#1B5E20] hover:bg-green-50/50 transition-colors"
                  >
                    News & Media
                  </Link>
                </div>
              </div>

              {/* Donate Dropdown */}
              <div className="relative group/dropdown py-2">
                <button 
                  className={`flex items-center gap-0.5 text-[10px] xl:text-xs font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer transition-colors duration-300 whitespace-nowrap ${
                    location.pathname === '/donate' || location.pathname === '/crowdfunding'
                      ? 'text-[#1B5E20]' 
                      : 'text-[#334155] hover:text-[#0A1628]'
                  }`}
                >
                  <span>Donate</span>
                  <ChevronDown size={11} />
                </button>
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-50">
                  <Link
                    to="/donate"
                    className="block px-4 py-2.5 text-xs font-bold text-[#334155] hover:text-[#1B5E20] hover:bg-green-50/50 transition-colors"
                  >
                    Direct Donation
                  </Link>
                  <Link
                    to="/crowdfunding"
                    className="block px-4 py-2.5 text-xs font-bold text-[#334155] hover:text-[#1B5E20] hover:bg-green-50/50 transition-colors"
                  >
                    Crowdfunding
                  </Link>
                </div>
              </div>

              {/* Join Us Hover Dropdown Menu */}
              <div className="relative group/dropdown py-2">
                <button 
                  className={`flex items-center gap-0.5 text-[10px] xl:text-xs font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer transition-colors duration-300 whitespace-nowrap ${
                    isJoinActive ? 'text-[#1B5E20]' : 'text-[#334155] hover:text-[#0A1628]'
                  }`}
                >
                  <span>Join Us</span>
                  <ChevronDown size={11} />
                </button>
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-50">
                  <Link
                    to="/membership"
                    className="block px-4 py-2.5 text-xs font-bold text-[#334155] hover:text-[#1B5E20] hover:bg-green-50/50 transition-colors"
                  >
                    Become a Member
                  </Link>
                  <Link
                    to="/volunteer"
                    className="block px-4 py-2.5 text-xs font-bold text-[#334155] hover:text-[#1B5E20] hover:bg-green-50/50 transition-colors"
                  >
                    Become a Volunteer
                  </Link>
                </div>
              </div>

              {/* Contact Link */}
              <Link
                to="/contact"
                className={`relative text-[10px] xl:text-xs font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${
                  location.pathname === '/contact' ? 'text-[#1B5E20]' : 'text-[#334155] hover:text-[#0A1628]'
                }`}
              >
                Contact
                {location.pathname === '/contact' && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-0.5 bg-[#1B5E20] rounded-full" />
                )}
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4 flex-shrink-0">
              {user ? (
                <Link
                  to={user.role === 'super_admin' ? '/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 xl:px-4 xl:py-2 rounded-xl border border-[#1B5E20] text-[10px] xl:text-xs font-bold text-[#1B5E20] hover:bg-[#1B5E20]/5 transition-all whitespace-nowrap"
                >
                  <User size={14} />
                  <span>My Portal</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 xl:px-4 xl:py-2 rounded-xl border border-[#1B5E20] text-[10px] xl:text-xs font-bold text-[#1B5E20] hover:bg-[#1B5E20]/5 transition-all whitespace-nowrap"
                >
                  <User size={14} />
                  <span>Login</span>
                </Link>
              )}
              <Link
                to="/crowdfunding"
                className="flex items-center gap-1.5 px-3 py-2 xl:px-5 xl:py-2.5 rounded-xl bg-[#0A1628] text-[10px] xl:text-xs font-extrabold text-white transition-all hover:scale-105 hover:bg-[#091424] shadow-none whitespace-nowrap"
              >
                <Heart size={14} className="text-white fill-white" />
                <span>Donate Now</span>
              </Link>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-[#0A1628] hover:bg-gray-100 transition-colors border-0 bg-transparent"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Nav Overlay Menu - Redesigned to support close icon & custom styles */}
      <div className={`fixed inset-0 z-[999] bg-gradient-to-br from-[#0A1628] via-[#0A1628] to-[#1B5E20]/30 flex flex-col justify-between p-6 transition-transform duration-500 ease-out lg:hidden ${
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile Overlay Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/NGO logo.jpeg"
              alt="Savitram Logo"
              className="w-10 h-10 rounded-full object-cover border border-white/10"
              decoding="async"
              width="40"
              height="40"
            />
            <div className="flex flex-col text-left">
              <span className="font-display font-extrabold tracking-tight text-base text-white leading-none">
                SAVITRAM
              </span>
              <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest mt-0.5 leading-none">
                FOUNDATION
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border-0 cursor-pointer"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Menu Links */}
        <div className="flex-grow py-5 overflow-y-auto flex flex-col gap-3 text-left">
          {navLinks.slice(0, 8).map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base font-extrabold uppercase tracking-wider transition-all duration-300 ${
                  active ? 'text-green-400 translate-x-2' : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="h-[1px] bg-white/5 my-1" />

          {/* Join Us sublinks inside mobile menu drawer */}
          <Link
            to="/membership"
            className={`text-base font-extrabold uppercase tracking-wider transition-all duration-300 ${
              location.pathname === '/membership' ? 'text-green-400 translate-x-2' : 'text-white/70 hover:text-white'
            }`}
          >
            Become a Member
          </Link>
          <Link
            to="/volunteer"
            className={`text-base font-extrabold uppercase tracking-wider transition-all duration-300 ${
              location.pathname === '/volunteer' ? 'text-green-400 translate-x-2' : 'text-white/70 hover:text-white'
            }`}
          >
            Become a Volunteer
          </Link>

          {/* Contact sublink inside mobile menu drawer */}
          <Link
            to="/contact"
            className={`text-base font-extrabold uppercase tracking-wider transition-all duration-300 ${
              location.pathname === '/contact' ? 'text-green-400 translate-x-2' : 'text-white/70 hover:text-white'
            }`}
          >
            Contact
          </Link>
        </div>

        {/* Mobile Menu Footer (CTAs) */}
        <div className="border-t border-white/5 pt-6 flex flex-col gap-3">
          {user ? (
            <Link
              to={user.role === 'super_admin' ? '/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-xs font-bold text-white transition-all hover:bg-white/5 bg-transparent"
            >
              <User size={14} />
              <span>My Portal</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-xs font-bold text-white transition-all hover:bg-white/5 bg-transparent"
            >
              <User size={14} />
              <span>Login / Register</span>
            </Link>
          )}
          <Link
            to="/crowdfunding"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 text-xs font-extrabold text-white transition-all hover:bg-orange-700 shadow-none border-0"
          >
            <Heart size={14} className="text-white fill-white" />
            <span>Donate Now</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;

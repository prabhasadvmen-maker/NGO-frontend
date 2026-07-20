import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Phone, Briefcase } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead 
        title="Page Not Found | 404" 
        description="The page you are looking for does not exist on Savitram Foundation. Navigate back to our home, active projects, or contact portals."
        noindex={true}
      />
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-32 pb-24 text-left">
        <div className="max-w-xl mx-auto px-6 text-center space-y-8">
          
          {/* Neumorphic 404 Illustration Badge */}
          <div className="flex justify-center select-none">
            <div className="w-32 h-32 rounded-full neo-outset flex items-center justify-center text-[#1B5E20] animate-bounce-slow">
              <Compass size={56} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="font-display font-black text-6xl text-[#0A1628]">404</h1>
            <h2 className="font-display font-black text-2xl text-[#0A1628] leading-tight">
              Oops! Page Not Found
            </h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed max-w-md mx-auto">
              We couldn't locate the document or route you requested. It might have been relocated, deleted, or entered incorrectly.
            </p>
          </div>

          {/* Helpful Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link 
              to="/" 
              className="p-4 rounded-2xl bg-[#F8F7F4] shadow-[4px_4px_10px_#e5e4e1,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#e1e0dd,-6px_-6px_14px_#ffffff] hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center text-[#0A1628] hover:text-[#1B5E20] font-bold group"
            >
              <Home size={20} className="text-[#1B5E20]/80 group-hover:scale-105 transition-transform mb-2" />
              <span className="text-[11px] uppercase tracking-wider">Homepage</span>
            </Link>

            <Link 
              to="/projects" 
              className="p-4 rounded-2xl bg-[#F8F7F4] shadow-[4px_4px_10px_#e5e4e1,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#e1e0dd,-6px_-6px_14px_#ffffff] hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center text-[#0A1628] hover:text-[#1B5E20] font-bold group"
            >
              <Briefcase size={20} className="text-[#1B5E20]/80 group-hover:scale-105 transition-transform mb-2" />
              <span className="text-[11px] uppercase tracking-wider">Our Projects</span>
            </Link>

            <Link 
              to="/contact" 
              className="p-4 rounded-2xl bg-[#F8F7F4] shadow-[4px_4px_10px_#e5e4e1,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#e1e0dd,-6px_-6px_14px_#ffffff] hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center text-[#0A1628] hover:text-[#1B5E20] font-bold group"
            >
              <Phone size={20} className="text-[#1B5E20]/80 group-hover:scale-105 transition-transform mb-2" />
              <span className="text-[11px] uppercase tracking-wider">Get In Touch</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;

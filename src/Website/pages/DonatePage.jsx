import React from 'react';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';
import DonateSection from '../components/DonateSection';

export const DonatePage = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Support a Child's Future - Donate Now" description="SAVITRAM FOUNDATION donation page. Your support helps feed, educate and protect children across rural India." />
      <Navbar />

      <main className="flex-grow pt-12 text-left">
        <DonateSection />
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default DonatePage;

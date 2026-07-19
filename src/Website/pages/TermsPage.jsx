import React from 'react';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Terms & Conditions" description="Terms and conditions for using SAVITRAM FOUNDATION NGO websites." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          <div className="border-b border-gray-200/50 pb-6">
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0A1628]">Terms & Conditions</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Effective: July 2026</p>
          </div>

          <div className="text-xs text-[#64748B] font-semibold leading-relaxed space-y-6">
            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">1. Acceptance of Terms</h3>
              <p>
                By accessing this public website or registering on our dashboard portals, you agree to comply with and be bound by these Terms & Conditions. If you disagree, please do not use our services.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">2. Use of Website</h3>
              <p>
                This website is operated to share information, process public donations, and verify training document hashes. Users agree not to introduce malicious scripts, crawl database records, or spam contact query forms.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">3. Donations & Payments</h3>
              <p>
                All donations are processed in Indian Rupees (INR) through encrypted SSL integrations. Donors are responsible for providing valid tax numbers to generate correct Section 80G tax certificates.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">4. Intellectual Property</h3>
              <p>
                All graphic assets, logos, article texts, and code blocks published on this public website are owned by SAVITRAM FOUNDATION. Unauthorized replication is strictly prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">5. Limitation of Liability</h3>
              <p>
                We execute rural campaigns with high diligence, but do not warrant that details are completely free from occasional manual typing errors.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">6. Contact</h3>
              <p>
                For terms inquiries, write to our legal desk at Noida Sector 62 headquarters, Support.savitramfoundation@gmail.com.
              </p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;

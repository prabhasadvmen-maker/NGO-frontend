import React from 'react';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Privacy Policy" description="Privacy policy disclosures for SAVITRAM FOUNDATION NGO." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          <div className="border-b border-gray-200/50 pb-6">
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0A1628]">Privacy Policy</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Last Updated: July 2026</p>
          </div>

          <div className="text-xs text-[#64748B] font-semibold leading-relaxed space-y-6">
            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">1. Information We Collect</h3>
              <p>
                We collect personal information that you voluntarily provide to us when you make donations, apply for volunteering or memberships, sign up for our newsletter, or submit contact queries. This may include your name, email, phone number, physical address, and payment identification numbers.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">2. How We Use Information</h3>
              <p>
                We use the collected information to process donation receipts, manage active member portals, issue volunteering accreditations, send audit/transparency newsletters, and respond to query forms. We do not sell or lease donor databases to third-party marketing services.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">3. Data Security</h3>
              <p>
                All data is encrypted using standard Secure Socket Layer (SSL) channels. Access to volunteer databases and donation ledgers is strictly audited and limited to authorized local branch administrators.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">4. Third Party Services</h3>
              <p>
                We use secure external gateway processors to complete donations. These processors have their own independent privacy agreements for handling card and bank data.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">5. Contact Us</h3>
              <p>
                If you have any questions regarding this Privacy Policy, feel free to write to our Noida Sector 62 headquarters desk at contact@savitram.org.
              </p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;

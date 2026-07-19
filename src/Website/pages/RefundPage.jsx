import React from 'react';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const RefundPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Refund & Cancellation Policy" description="Refund and cancellation policy details for SAVITRAM FOUNDATION." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          <div className="border-b border-gray-200/50 pb-6">
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0A1628]">Refund & Cancellation</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Effective: July 2026</p>
          </div>

          <div className="text-xs text-[#64748B] font-semibold leading-relaxed space-y-6">
            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">1. Donation Refund Policy</h3>
              <p>
                Savitram Foundation maintains high operational audits. Because donations are immediately allocated to rural programs and medical supplies, direct refunds are generally not allowed. However, in cases of verified double transactions or payment gateway technical errors, refund requests can be reviewed.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">2. Membership Cancellation</h3>
              <p>
                Members can request cancellation of their Bronze, Silver, Gold, or Platinum annual cycles by emailing our operations desk. Please note that already processed annual dues are non-refundable.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">3. Event Registration Refund</h3>
              <p>
                If you made a paid reservation for an offline training seminar or event and cannot attend, you can cancel up to 48 hours before launch for a complete refund credit.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">4. How to Request a Refund</h3>
              <p>
                To request checks on transactions, email contact@savitram.org with your Transaction ID, date, donor name, and banking confirmation receipts.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">5. Processing Time</h3>
              <p>
                Approved refund requests will be credited directly to the original bank account or card payment method within 7 to 10 working days.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#0A1628]">6. Contact</h3>
              <p>
                For cancellation operations, reach out to our helpdesk at Noida Sector 62 headquarters, contact@savitram.org.
              </p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPage;

import React, { useState } from 'react';
import { FileText, Mail, Phone, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { COLORS } from '../../shared/colors';

const faqs = [
  { q: 'How do I reset my password?',   a: 'Go to Settings → Security tab and use the Change Password form.' },
  { q: 'How do I add a new admin?',      a: 'Navigate to Users → Admins and click the "Add Admin" button.' },
  { q: 'How do I generate reports?',     a: 'Use the Reports section in the sidebar to generate and export reports.' },
  { q: 'How do I manage NGO branches?',  a: 'Go to Organization → Branches to add, edit or remove branches.' },
  { q: 'How do I track donations?',      a: 'The Donations section shows all incoming donations with filters and export options.' },
];

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const supportCards = [
    { icon: FileText,      label: 'Documentation', desc: 'Browse guides and documentation for the system.',  href: '#',                         color: '#E8F5E9', iconColor: COLORS.primary },
    { icon: Mail,          label: 'Email Support',  desc: 'Reach us at support@advmen.org for any queries.', href: 'mailto:support@advmen.org', color: '#E3F2FD', iconColor: '#2196F3' },
    { icon: MessageCircle, label: 'Live Chat',      desc: 'Chat with our support team in real time.',        href: '#',                         color: '#FFF3E0', iconColor: '#FF9800' },
    { icon: Phone,         label: 'Phone Support',  desc: 'Call us at +91-XXXXX-XXXXX for urgent help.',     href: 'tel:+91XXXXXXXXXX',         color: '#FCE4EC', iconColor: '#E91E63' },
  ];

  return (
    <Layout>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Help & Support</h1>
          <p className="text-sm text-gray-400 mt-0.5">Find answers or get in touch with our support team</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {supportCards.map(({ icon: Icon, label, desc, href, color, iconColor }) => (
            <a key={label} href={href}
              className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:scale-[1.01]"
              style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                <Icon size={20} style={{ color: iconColor }} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </a>
          ))}
        </div>

        <div>
          <h2 className="text-base font-extrabold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.light, boxShadow: '4px 4px 8px #D0D0D0, -4px -4px 8px #FFFFFF' }}>
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="text-sm font-semibold text-gray-700">{faq.q}</span>
                  {openFaq === idx ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;

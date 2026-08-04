import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  HeartHandshake, 
  Truck, 
  Users, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Sparkles,
  Award,
  AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';
import API_BASE_URL from '../../shared/apiConfig';

export default function FoodDonationPage() {
  const [stats, setStats] = useState({
    totalDonations: 480,
    totalPeopleServed: 14500,
    totalFoodSavedKg: 8600,
    activeVolunteers: 45,
  });
  const [trackingIdInput, setTrackingIdInput] = useState('');

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/public/food-donations/stats`)
      .then((res) => {
        if (res.data?.success) {
          setStats((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SEOHead
        title="AnnDan Food Donation | Savitram Foundation"
        description="Donate surplus food from events, hotels, and homes to feed those in need. Join Savitram Foundation's AnnDan initiative today."
      />
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0A1628] via-[#0F223D] to-[#1B5E20] text-white py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles size={14} className="text-emerald-400" />
                <span>Zero Food Waste • No Hungry Lives</span>
              </div>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
                Turn Surplus Food into <span className="text-emerald-400">Nourishment</span> for Others
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                AnnDan connects hotels, restaurants, wedding hosts, and households with a dedicated volunteer network to rescue excess food and deliver fresh meals to underserved communities in real time.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/food-donation/donate"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2"
                >
                  <Utensils size={18} />
                  <span>Donate Excess Food Now</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/food-donation/impact"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
                >
                  <Award size={18} className="text-yellow-400" />
                  <span>View Live Impact</span>
                </Link>
              </div>

              {/* Quick Tracking Bar */}
              <div className="pt-6 border-t border-white/10 max-w-md">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Track Your Food Donation Status
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter Tracking ID (e.g. ANN-2026-001)"
                      value={trackingIdInput}
                      onChange={(e) => setTrackingIdInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                  <Link
                    to={trackingIdInput ? `/food-donation/track/${trackingIdInput.trim()}` : '#'}
                    className={`px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition-all ${
                      !trackingIdInput ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Track
                  </Link>
                </div>
              </div>
            </div>

            {/* Visual Hero Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <HeartHandshake size={24} />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-base">AnnDan Direct Impact</h2>
                      <p className="text-xs text-slate-300">Live Lucknow & NCR Operations</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">Active</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-extrabold text-white">{stats.totalPeopleServed.toLocaleString()}+</p>
                    <p className="text-xs font-medium text-slate-300 mt-0.5">People Served</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-extrabold text-emerald-400">{stats.totalFoodSavedKg.toLocaleString()} kg</p>
                    <p className="text-xs font-medium text-slate-300 mt-0.5">Food Saved</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-extrabold text-white">{stats.totalDonations}+</p>
                    <p className="text-xs font-medium text-slate-300 mt-0.5">Pickups Completed</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-extrabold text-yellow-400">{stats.activeVolunteers}</p>
                    <p className="text-xs font-medium text-slate-300 mt-0.5">Active Fleet</p>
                  </div>
                </div>

                <div className="bg-emerald-950/60 rounded-2xl p-4 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Every pickup is inspected for safety, quality, and hygienic temperature-controlled delivery.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Process Workflow */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Simple & Rapid Workflow</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">How AnnDan Food Donation Works</h3>
            <p className="text-slate-600 text-sm md:text-base">
              Our automated dispatch system handles donation verification, volunteer routing, and proof verification seamlessly within hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Fill Donation Form',
                desc: 'Share details of food type, quantity, pickup address, and time window on our quick form.',
                icon: Utensils,
                color: 'bg-emerald-500',
              },
              {
                step: '02',
                title: 'Admin Verification',
                desc: 'Our team verifies food quality, urgency level, and matches a nearby active volunteer.',
                icon: ShieldCheck,
                color: 'bg-blue-500',
              },
              {
                step: '03',
                title: 'Hygienic Pickup',
                desc: 'Assigned volunteer reaches your location, takes photo proof, and collects the surplus food.',
                icon: Truck,
                color: 'bg-amber-500',
              },
              {
                step: '04',
                title: 'Community Distribution',
                desc: 'Food is distributed to night shelters & slum clusters. Donor receives real-time photo report!',
                icon: Users,
                color: 'bg-purple-500',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-md`}>
                    <item.icon size={22} />
                  </div>
                  <span className="text-3xl font-black text-slate-200 group-hover:text-slate-300 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Food Safety & Acceptable Items */}
        <section className="bg-slate-900 text-white py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <AlertTriangle size={14} />
                <span>Food Safety & Hygiene Guidelines</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Maintaining High Quality & Safety Standards
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                To protect the dignity and health of our beneficiaries, we strictly enforce safety guidelines for accepted food donations.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  'Food must be freshly prepared within 6 hours of pickup time.',
                  'Food must be stored in clean, covered food-grade containers.',
                  'No stale, spoiled, or previously consumed leftover food.',
                  'Individual packaged & raw groceries are welcome with unexpired dates.',
                ].map((text, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200 font-medium">{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to="/food-donation/donate"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
                >
                  <span>Start Donation Request</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Utensils size={20} />
                </div>
                <h3 className="font-bold text-white text-base">Cooked Meals</h3>
                <p className="text-xs text-slate-400">Weddings, banquets, party catering, hotel surplus, and bulk meals.</p>
              </div>
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h3 className="font-bold text-white text-base">Bakery & Sweets</h3>
                <p className="text-xs text-slate-400">Fresh breads, pastries, untouched sweets, packaged dry snacks.</p>
              </div>
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-bold text-white text-base">Raw Ingredients</h3>
                <p className="text-xs text-slate-400">Rice, pulses, flour, oil, and unpeeled fresh vegetables.</p>
              </div>
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <h3 className="font-bold text-white text-base">Packaged Goods</h3>
                <p className="text-xs text-slate-400">Sealed biscuits, juices, milk packets, and dry ration kits.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-10 md:p-14 text-white shadow-xl space-y-6">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Have Excess Food Right Now?</h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto">
              Don’t let nutritious food go to waste. Our volunteer network is ready to assist you immediately.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                to="/food-donation/donate"
                className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg transition-all"
              >
                Submit Food Donation Form
              </Link>
              <Link
                to="/volunteer"
                className="px-8 py-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-all"
              >
                Join as Volunteer
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

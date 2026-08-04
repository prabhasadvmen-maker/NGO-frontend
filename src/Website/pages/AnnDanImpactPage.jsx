import React, { useState, useEffect } from 'react';
import { Heart, Users, Utensils, TrendingUp, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';
import API_BASE_URL from '../../shared/apiConfig';

export default function AnnDanImpactPage() {
  const [stats, setStats] = useState({
    totalDonations: 520,
    completedDonations: 495,
    totalPeopleServed: 16800,
    totalFoodSavedKg: 9400,
    activeVolunteers: 32,
    recentFeed: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/public/food-donations/stats`);
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const completionRate = Math.round((stats.completedDonations / stats.totalDonations) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SEOHead
        title="AnnDan Impact | Savitram Foundation"
        description="See the real-time impact of food donations through AnnDan. Thousands of meals saved and distributed to communities in need."
      />
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#0A1628] via-[#0F223D] to-[#1B5E20] text-white py-16 px-6">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Real-Time Impact of <span className="text-emerald-400">AnnDan</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Every donation counts. See how surplus food is being transformed into nourishment for underserved communities.
            </p>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Total Donations */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-emerald-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Total Donations</h3>
                <Utensils size={20} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.totalDonations}+</p>
              <p className="text-xs text-slate-500 mt-2">Food donation requests</p>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Completed</h3>
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.completedDonations}+</p>
              <p className="text-xs text-slate-500 mt-2">{completionRate}% completion rate</p>
            </div>

            {/* People Served */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-purple-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase">People Served</h3>
                <Users size={20} className="text-purple-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.totalPeopleServed.toLocaleString()}+</p>
              <p className="text-xs text-slate-500 mt-2">Beneficiaries fed</p>
            </div>

            {/* Food Saved */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-amber-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Food Saved</h3>
                <Heart size={20} className="text-amber-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.totalFoodSavedKg.toLocaleString()} kg</p>
              <p className="text-xs text-slate-500 mt-2">From waste to nourishment</p>
            </div>

            {/* Active Volunteers */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-indigo-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Volunteers</h3>
                <Users size={20} className="text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.activeVolunteers}+</p>
              <p className="text-xs text-slate-500 mt-2">Active fleet members</p>
            </div>
          </div>
        </section>

        {/* Impact Breakdown */}
        <section className="py-16 px-6 bg-slate-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">Impact Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Average per Donation */}
              <div className="bg-white rounded-3xl p-8 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <Utensils size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {Math.round(stats.totalFoodSavedKg / stats.totalDonations)} kg
                </h3>
                <p className="text-slate-600 text-sm">Average food per donation</p>
              </div>

              {/* Average People per Donation */}
              <div className="bg-white rounded-3xl p-8 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                  <Users size={32} className="text-purple-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {Math.round(stats.totalPeopleServed / stats.completedDonations)}
                </h3>
                <p className="text-slate-600 text-sm">Average people served per donation</p>
              </div>

              {/* Donations per Volunteer */}
              <div className="bg-white rounded-3xl p-8 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto">
                  <TrendingUp size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {Math.round(stats.completedDonations / stats.activeVolunteers)}
                </h3>
                <p className="text-slate-600 text-sm">Donations per volunteer</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Donations Feed */}
        {stats.recentFeed && stats.recentFeed.length > 0 && (
          <section className="py-16 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Recent Completed Donations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.recentFeed.map((donation, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{donation.donorName}</h3>
                      <p className="text-xs text-slate-500">{donation.organizationType}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      ✓ Completed
                    </span>
                  </div>

                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Utensils size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{donation.foodType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{donation.actualPeopleServed || 0} people served</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{donation.city}</span>
                    <span className="text-slate-400">
                      {new Date(donation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="py-16 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">Be Part of This Impact</h2>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
              Whether you have surplus food to donate or want to volunteer, join thousands making a difference in our communities.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a
                href="/food-donation/donate"
                className="px-8 py-4 rounded-xl bg-white text-emerald-600 font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Utensils size={18} />
                <span>Donate Food Now</span>
              </a>
              <a
                href="/volunteer"
                className="px-8 py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all flex items-center gap-2 border border-white/20"
              >
                <Users size={18} />
                <span>Become a Volunteer</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

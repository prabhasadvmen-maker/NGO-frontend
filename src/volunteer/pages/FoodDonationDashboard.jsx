import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Search, RefreshCw, Filter, AlertCircle, CheckCircle, Loader, LogOut } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../Website/components/Navbar';
import Footer from '../../Website/components/Footer';
import SEOHead from '../../Website/components/SEOHead';
import API_BASE_URL from '../../shared/apiConfig';
import DonationCard from '../components/DonationCard';

const getAuthToken = () => {
  return (
    localStorage.getItem('savitram_volunteer_token') ||
    localStorage.getItem('savitram_admin_token') ||
    localStorage.getItem('savitram_superadmin_token') ||
    localStorage.getItem('savitram_member_token') ||
    localStorage.getItem('token') ||
    ''
  );
};

export default function FoodDonationDashboard() {
  const navigate = useNavigate();
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const [volunteerInfo, setVolunteerInfo] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('savitram_volunteer_user');
    if (userStr) {
      try {
        setVolunteerInfo(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing volunteer info:', e);
      }
    }
  }, []);

  const fetchAvailableDonations = () => {
    setLoading(true);
    setError('');
    const token = getAuthToken();

    axios
      .get(`${API_BASE_URL}/api/volunteer/food-donations/available`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { city: cityFilter, priority: priorityFilter, foodType: foodTypeFilter, search },
      })
      .then((res) => {
        if (res.data?.success) {
          setAvailableDonations(res.data.data || []);
        } else {
          setError(res.data?.message || 'Failed to load available food donations.');
        }
      })
      .catch((err) => {
        console.error('Error fetching available donations:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('savitram_volunteer_token');
          navigate('/volunteer/login');
        }
        setError(err.response?.data?.message || 'Error connecting to backend server.');
      })
      .finally(() => setLoading(false));
  };

  // Initial load and 30-second auto refresh interval
  useEffect(() => {
    fetchAvailableDonations();

    const interval = setInterval(() => {
      fetchAvailableDonations();
    }, 30000);

    return () => clearInterval(interval);
  }, [cityFilter, priorityFilter, foodTypeFilter]);

  const handleAcceptAssignment = async (donationId) => {
    setAcceptingId(donationId);
    setError('');
    const token = getAuthToken();

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/volunteer/food-donations/${donationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        navigate('/volunteer/food-donation/my-assignments');
      } else {
        setError(res.data?.message || 'Failed to accept assignment');
      }
    } catch (err) {
      console.error('Error accepting assignment:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('savitram_volunteer_token');
        navigate('/volunteer/login');
      }
      setError(err.response?.data?.message || 'Server error while accepting assignment.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/volunteer/login';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAvailableDonations();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <SEOHead title="Available Food Rescue Requests | Volunteer Portal" />
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center shadow-xs">
                <Utensils size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Food Rescue Requests</h1>
                <p className="text-xs text-slate-500 font-medium">
                  {volunteerInfo?.name && `Welcome, ${volunteerInfo.name}!`} Accept pending food donations in your city to collect and distribute.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={() => navigate('/volunteer/food-donation/my-assignments')}
              className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>My Assignments</span>
            </button>
            <button
              onClick={fetchAvailableDonations}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh List</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Filters & Search Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by ID, donor, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold focus:outline-none focus:border-[#1B5E20]"
            />
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-[#1B5E20]"
            >
              <option value="">All Cities</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Noida">Noida</option>
              <option value="Delhi">Delhi</option>
              <option value="Kanpur">Kanpur</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-[#1B5E20]"
            >
              <option value="">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-[#1B5E20]"
            >
              <option value="">All Food Types</option>
              <option value="Cooked Food">Cooked Food</option>
              <option value="Packaged Food">Packaged Food</option>
              <option value="Raw Ingredients">Raw Ingredients</option>
              <option value="Bakery">Bakery</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader size={36} className="animate-spin text-[#1B5E20] mx-auto" />
            <p className="text-sm font-black text-slate-600">Loading available food rescue requests...</p>
          </div>
        ) : availableDonations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1B5E20] flex items-center justify-center mx-auto">
              <Utensils size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Available Requests Right Now</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All surplus food requests in your area have been assigned or completed. New donor submissions will appear automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDonations.map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onAccept={handleAcceptAssignment}
                acceptingId={acceptingId}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

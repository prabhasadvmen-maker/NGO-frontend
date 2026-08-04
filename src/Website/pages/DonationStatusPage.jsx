import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, MapPin, Phone, User, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';
import API_BASE_URL from '../../shared/apiConfig';

const statusSteps = [
  { status: 'Pending', label: 'Submitted', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { status: 'Verified', label: 'Verified', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
  { status: 'Assigned', label: 'Volunteer Assigned', icon: User, color: 'bg-purple-100 text-purple-700' },
  { status: 'Collected', label: 'Collected', icon: CheckCircle, color: 'bg-indigo-100 text-indigo-700' },
  { status: 'Completed', label: 'Distributed', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
];

export default function DonationStatusPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const trackingId = id || searchParams.get('id');

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!trackingId) {
      setError('No tracking ID provided');
      setLoading(false);
      return;
    }

    const fetchDonation = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/public/food-donations/${trackingId}`);
        if (res.data?.success) {
          setDonation(res.data.data.donation);
          setHistory(res.data.data.history || []);
        } else {
          setError('Donation not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch donation status');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
    const interval = setInterval(fetchDonation, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [trackingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <SEOHead title="Track Donation | AnnDan" />
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader size={40} className="animate-spin text-emerald-600 mx-auto" />
            <p className="text-slate-600">Loading donation status...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <SEOHead title="Track Donation | AnnDan" />
        <Navbar />
        <main className="flex-grow pt-24 px-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-4 shadow-lg">
            <AlertCircle size={40} className="text-red-600 mx-auto" />
            <h1 className="text-xl font-black text-slate-900">Donation Not Found</h1>
            <p className="text-slate-600 text-sm">{error}</p>
            <a
              href="/food-donation"
              className="inline-block px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
            >
              Back to AnnDan
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(s => s.status === donation.status);
  const isCompleted = donation.status === 'Completed' || donation.status === 'Distributed';

  // Show success message if donation is completed
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50 flex flex-col font-sans">
        <SEOHead title={`Donation Completed | AnnDan`} />
        <Navbar />
        <main className="flex-grow pt-24 pb-12 px-6 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl border-2 border-emerald-200">
              <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle size={56} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900">🎉 Donation Complete!</h1>
              <p className="text-lg text-slate-600 font-semibold">
                Your food donation has been successfully distributed to those in need.
              </p>
              
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200 space-y-4">
                <h2 className="text-2xl font-black text-emerald-700">🌟 Your Impact</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-black tracking-wider">People Fed</p>
                    <p className="text-3xl font-black text-emerald-600 mt-2">{donation.actualPeopleServed || donation.estimatedPeopleServed || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Quantity Saved</p>
                    <p className="text-3xl font-black text-emerald-600 mt-2">{donation.actualQuantityCollected || donation.quantity}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 space-y-3 text-left">
                <h3 className="font-black text-slate-900 text-lg">Donation Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-bold text-slate-700">Tracking ID:</span> <span className="text-emerald-600 font-black">{donation.donationId}</span></p>
                  <p><span className="font-bold text-slate-700">Food Type:</span> {donation.foodType}</p>
                  <p><span className="font-bold text-slate-700">Pickup Location:</span> {donation.pickupAddress}, {donation.city}</p>
                  <p><span className="font-bold text-slate-700">Completed:</span> {new Date(donation.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
                <p className="text-sm text-amber-900 font-semibold">
                  💚 <strong>Thank you for making a difference!</strong> A confirmation email with your impact report has been sent to {donation.donorEmail}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <a
                  href="/food-donation"
                  className="w-full px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg transition-all"
                >
                  Submit Another Donation
                </a>
                <a
                  href="/"
                  className="w-full px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SEOHead title={`Track Donation ${donation.donationId} | AnnDan`} />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Track Your Donation</h1>
            <p className="text-slate-600 text-sm">Tracking ID: <span className="font-bold text-emerald-600">{donation.donationId}</span></p>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm mb-8">
            <div className="space-y-6">
              {statusSteps.map((step, idx) => {
                const isActive = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.status} className="flex gap-4">
                    {/* Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          isActive ? step.color : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <StepIcon size={20} />
                      </div>
                      {idx < statusSteps.length - 1 && (
                        <div
                          className={`w-1 h-12 mt-2 ${isActive ? 'bg-emerald-600' : 'bg-slate-200'}`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <h3 className={`font-bold text-sm ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-xs text-emerald-600 font-semibold mt-1">Current Status</p>
                      )}
                      {isActive && history[idx] && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(history[idx].createdAt).toLocaleDateString()} at{' '}
                          {new Date(history[idx].createdAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Food Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🍽️</span>
                <span>Food Details</span>
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Food Type</p>
                  <p className="text-slate-900 font-semibold">{donation.foodType}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Description</p>
                  <p className="text-slate-700">{donation.foodItemsDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-bold">Quantity</p>
                    <p className="text-slate-900 font-semibold">{donation.quantity}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-bold">Est. People Served</p>
                    <p className="text-slate-900 font-semibold">{donation.estimatedPeopleServed || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                <span>Pickup Location</span>
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Address</p>
                  <p className="text-slate-700">{donation.pickupAddress}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-bold">City</p>
                    <p className="text-slate-900 font-semibold">{donation.city}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-bold">PIN Code</p>
                    <p className="text-slate-900 font-semibold">{donation.pinCode}</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Pickup Window</p>
                  <p className="text-slate-900 font-semibold">{donation.pickupTimeWindow}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer Info (if assigned) */}
          {donation.assignedVolunteer && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 shadow-sm mb-8 border border-purple-200">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-purple-600" />
                <span>Assigned Volunteer</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Name</p>
                  <p className="text-slate-900 font-semibold">{donation.assignedVolunteer.fullName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Phone</p>
                  <a
                    href={`tel:${donation.assignedVolunteer.mobileNumber}`}
                    className="text-purple-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Phone size={14} />
                    {donation.assignedVolunteer.mobileNumber}
                  </a>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">City</p>
                  <p className="text-slate-900 font-semibold">{donation.assignedVolunteer.city || 'Lucknow'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Impact Summary (if completed) */}
          {isCompleted && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 shadow-sm border border-emerald-200">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-600" />
                <span>Impact Summary</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Actual Quantity Collected</p>
                  <p className="text-slate-900 font-semibold text-lg">{donation.actualQuantityCollected || donation.quantity}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">People Served</p>
                  <p className="text-emerald-600 font-black text-lg">{donation.actualPeopleServed || donation.estimatedPeopleServed || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Completion Date</p>
                  <p className="text-slate-900 font-semibold">
                    {new Date(donation.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status History */}
          {history.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Status History</h2>
              <div className="space-y-3">
                {history.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{entry.status}</p>
                      <p className="text-xs text-slate-500">{entry.notes}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

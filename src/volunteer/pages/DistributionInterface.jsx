import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, Loader, Heart, MapPin, Users, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../Website/components/Navbar';
import Footer from '../../Website/components/Footer';
import SEOHead from '../../Website/components/SEOHead';
import API_BASE_URL from '../../shared/apiConfig';
import PhotoUpload from '../components/PhotoUpload';

const getAuthToken = () => {
  return (
    localStorage.getItem('savitram_volunteer_token') ||
    localStorage.getItem('savitram_admin_token') ||
    localStorage.getItem('savitram_superadmin_token') ||
    localStorage.getItem('savitram_member_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('volunteerToken') ||
    ''
  );
};

export default function DistributionInterface() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [collectionPhotos, setCollectionPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [impactSummary, setImpactSummary] = useState(null);

  // Form State
  const [photos, setPhotos] = useState([]);
  const [peopleServed, setPeopleServed] = useState('');
  const [distributionLocation, setDistributionLocation] = useState('');
  const [distributionNotes, setDistributionNotes] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    axios
      .get(`${API_BASE_URL}/api/public/food-donations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success) {
          const doc = res.data.data.donation || res.data.data;
          setDonation(doc);
          setCollectionPhotos(res.data.data.collectionUrls || []);
          if (doc.estimatedPeopleServed) {
            setPeopleServed(doc.estimatedPeopleServed.toString());
          }
          if (doc.city) {
            setDistributionLocation(`Community Shelter, ${doc.city}`);
          }
        } else {
          setError('Failed to fetch donation details.');
        }
      })
      .catch((err) => {
        console.error('Error fetching donation details for distribution:', err);
        setError(err.response?.data?.message || 'Could not load donation details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitDistribution = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const token = getAuthToken();
    const photoKeys = photos.map((p) => (typeof p === 'string' ? p : p.key));

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/volunteer/food-donations/${id}/distribute`,
        {
          distributionProofPhotos: photoKeys,
          actualPeopleServed: Number(peopleServed) || 0,
          distributionNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setImpactSummary({
          donationId: donation?.donationId,
          peopleServed: Number(peopleServed) || 0,
          location: distributionLocation,
        });
      } else {
        setError(res.data?.message || 'Failed to complete distribution.');
      }
    } catch (err) {
      console.error('Error submitting distribution:', err);
      setError(err.response?.data?.message || 'Error submitting distribution details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-32 pb-20 text-center">
          <Loader size={36} className="animate-spin text-[#1B5E20] mx-auto mb-3" />
          <p className="text-sm font-black text-slate-600">Loading distribution interface...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (impactSummary) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-32 pb-20 px-4 max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mx-auto shadow-sm">
              <Heart size={44} className="fill-[#1B5E20]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mission Accomplished! 🎉</h2>
              <p className="text-xs text-slate-600 font-semibold">
                Surplus food donation <strong className="text-slate-900">{impactSummary.donationId}</strong> has been successfully distributed to beneficiaries.
              </p>
            </div>

            {/* Impact Metrics Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-2xl font-black text-[#1B5E20]">{impactSummary.peopleServed}</span>
                <p className="text-[11px] font-black text-[#1B5E20] uppercase tracking-wider mt-0.5">People Served</p>
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 line-clamp-1">{impactSummary.location}</span>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mt-0.5">Distribution Spot</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate('/volunteer/food-donation/my-assignments')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-black transition-colors cursor-pointer"
              >
                Back to My Assignments
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <SEOHead title={`Distribute Food ${donation?.donationId || ''} | Volunteer Portal`} />
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-4 md:px-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/volunteer/food-donation/my-assignments')}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">Beneficiary Distribution Verification</h1>
              <p className="text-xs text-slate-500 font-medium">Tracking ID: {donation?.donationId}</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">
            Collected
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Read-Only Info & Pickup Proof Photos */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Donation Overview
              </h3>

              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Food Category</span>
                <p className="font-extrabold text-slate-900">{donation?.foodType} ({donation?.quantity})</p>
                {donation?.actualQuantityCollected && (
                  <p className="text-purple-800 font-extrabold">Collected: {donation.actualQuantityCollected}</p>
                )}
              </div>

              {/* Pickup Proof Photos Display */}
              {collectionPhotos.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                    <ImageIcon size={12} />
                    <span>Pickup Proof Photos</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {collectionPhotos.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="block h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs">
                        <img src={url} alt={`Pickup proof ${idx + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Distribution Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmitDistribution} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Record Distribution Impact</h2>

              {/* Distribution Photo Upload */}
              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                label="Upload Beneficiary Distribution Photos"
                maxPhotos={4}
              />

              {/* People Served Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Number of People Served
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={peopleServed}
                  onChange={(e) => setPeopleServed(e.target.value)}
                  placeholder="e.g. 60"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-xs font-extrabold focus:outline-none focus:border-[#1B5E20]"
                />
                {donation?.estimatedPeopleServed > 0 && (
                  <p className="text-[11px] text-slate-400 font-medium">Estimated by donor: ~{donation.estimatedPeopleServed} people</p>
                )}
              </div>

              {/* Distribution Location Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Distribution Spot / Location
                </label>
                <input
                  type="text"
                  required
                  value={distributionLocation}
                  onChange={(e) => setDistributionLocation(e.target.value)}
                  placeholder="e.g. Rain Basera Night Shelter, Sector 62 Noida"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-xs font-extrabold focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              {/* Distribution Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Distribution Notes / Impact Summary
                </label>
                <textarea
                  rows="3"
                  value={distributionNotes}
                  onChange={(e) => setDistributionNotes(e.target.value)}
                  placeholder="e.g. Distributed hot meal packets to shelter residents & daily wage workers."
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-xs font-medium focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Submitting Distribution Proof...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm & Mark as Distributed</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

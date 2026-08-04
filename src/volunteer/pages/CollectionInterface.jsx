import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, AlertCircle, ArrowLeft, Loader, User, Utensils, MapPin, Camera } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../Website/components/Navbar';
import Footer from '../../Website/components/Footer';
import SEOHead from '../../Website/components/SEOHead';
import API_BASE_URL from '../../shared/apiConfig';
import PhotoUpload from '../components/PhotoUpload';

const getAuthToken = () => {
  return (
    localStorage.getItem('savitram_admin_token') ||
    localStorage.getItem('savitram_superadmin_token') ||
    localStorage.getItem('savitram_member_token') ||
    localStorage.getItem('token') ||
    ''
  );
};

export default function CollectionInterface() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [photos, setPhotos] = useState([]);
  const [actualQuantityCollected, setActualQuantityCollected] = useState('');
  const [collectionNotes, setCollectionNotes] = useState('');

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
          setActualQuantityCollected(doc.quantity || '');
        } else {
          setError('Failed to fetch donation details.');
        }
      })
      .catch((err) => {
        console.error('Error fetching donation details for collection:', err);
        setError(err.response?.data?.message || 'Could not load donation details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitCollection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const token = getAuthToken();
    const photoKeys = photos.map((p) => (typeof p === 'string' ? p : p.key));

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/volunteer/food-donations/${id}/collect`,
        {
          collectionProofPhotos: photoKeys,
          actualQuantityCollected,
          collectionNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setSuccessMsg(`Donation ${donation?.donationId || ''} marked as COLLECTED successfully!`);
      } else {
        setError(res.data?.message || 'Failed to update collection status.');
      }
    } catch (err) {
      console.error('Error submitting collection:', err);
      setError(err.response?.data?.message || 'Error submitting collection proof.');
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
          <p className="text-sm font-black text-slate-600">Loading collection interface...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (successMsg) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-32 pb-20 px-4 max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pickup Verification Complete!</h2>
            <p className="text-xs text-slate-600 font-semibold">{successMsg}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate(`/volunteer/food-donation/${id}/distribute`)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Truck size={16} />
                <span>Proceed to Distribution Now</span>
              </button>
              <button
                onClick={() => navigate('/volunteer/food-donation/my-assignments')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
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
      <SEOHead title={`Collect Food ${donation?.donationId || ''} | Volunteer Portal`} />
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
              <h1 className="text-xl font-black text-slate-900">Food Pickup Verification</h1>
              <p className="text-xs text-slate-500 font-medium">Tracking ID: {donation?.donationId}</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
            Assigned
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Read-Only Info Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Pickup Summary
              </h3>

              {/* Donor Contact */}
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Donor Contact</span>
                <p className="font-extrabold text-slate-900">{donation?.donorName}</p>
                <p className="text-emerald-700 font-extrabold">{donation?.donorPhone}</p>
                <p className="text-slate-500">{donation?.organizationType}</p>
              </div>

              {/* Food Details */}
              <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Food Details</span>
                <p className="font-extrabold text-slate-900">{donation?.foodType}</p>
                <p className="text-slate-600">Est. Quantity: {donation?.quantity}</p>
                {donation?.estimatedPeopleServed && (
                  <p className="text-emerald-800 font-bold">Serves ~{donation.estimatedPeopleServed} people</p>
                )}
              </div>

              {/* Pickup Address */}
              <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Pickup Location</span>
                <p className="font-extrabold text-slate-900">{donation?.pickupAddress}</p>
                <p className="text-slate-500">{donation?.city}, {donation?.state} - {donation?.pinCode}</p>
                <p className="text-emerald-800 font-bold mt-1">Window: {donation?.pickupTimeWindow}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Collection Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmitCollection} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Record Pickup Verification</h2>

              {/* Photo Upload Section */}
              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                label="Take / Upload Pickup Proof Photos"
                maxPhotos={4}
              />

              {/* Actual Quantity Collected */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Actual Quantity Collected
                </label>
                <input
                  type="text"
                  required
                  value={actualQuantityCollected}
                  onChange={(e) => setActualQuantityCollected(e.target.value)}
                  placeholder="e.g. 50 meal packets / 20 kg food"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-xs font-extrabold focus:outline-none focus:border-[#1B5E20]"
                />
                <p className="text-[11px] text-slate-400 font-medium">Estimated by donor: {donation?.quantity}</p>
              </div>

              {/* Collection Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Collection Notes / Remarks
                </label>
                <textarea
                  rows="3"
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  placeholder="e.g. Verified food temperature & packaging condition at donor site."
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
                    <span>Submitting Collection Proof...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm & Mark as Collected</span>
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

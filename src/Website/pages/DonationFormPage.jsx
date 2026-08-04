import React, { useState } from 'react';
import { ChevronRight, Upload, MapPin, Phone, Mail, AlertCircle, CheckCircle, Loader, Trash2, Camera, Utensils } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';
import API_BASE_URL from '../../shared/apiConfig';

export default function DonationFormPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [donationId, setDonationId] = useState('');
  const [error, setError] = useState('');
  
  // Store uploaded photos as objects { key: string, preview: string }
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState('');

  const [formData, setFormData] = useState({
    // Donor Details
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    organizationType: 'Individual',
    organizationName: '',

    // Food Details
    foodType: 'Cooked Food',
    foodItemsDescription: '',
    quantity: '',
    estimatedPeopleServed: '',
    preparedDateTime: new Date().toISOString().slice(0, 16),
    shelfLifeHours: '6',
    eventType: 'Wedding',

    // Pickup Details
    pickupAddress: '',
    city: '',
    state: '',
    pinCode: '',
    pickupTimeWindow: 'Immediate (Within 1 Hour)',
    pickupInstructions: '',
    latitude: null,
    longitude: null,
  });

  const isInIndia = (lat, lon) => {
    return lat >= 8 && lat <= 38 && lon >= 68 && lon <= 97;
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter your address manually.');
      return;
    }

    setFetchingLocation(true);
    setError('');
    setLocationSuccess('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (!isInIndia(latitude, longitude)) {
          setError('GPS location appears to be outside India. Please enter your address manually.');
          setFetchingLocation(false);
          return;
        }

        let detectedAddress = '';
        let detectedCity = '';
        let detectedState = '';
        let detectedPin = '';
        let warningMsg = '';

        // Check for Low Accuracy (e.g. > 5000m IP-based location fallback on Desktop)
        if (accuracy > 5000) {
          setError(`⚠️ Low GPS Accuracy (~${Math.round(accuracy / 1000)} km). Your browser returned an IP network location instead of exact GPS. Please enter your address and city manually.`);
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
          }));
          setFetchingLocation(false);
          return;
        }

        try {
          // 1. Call Backend Location Detection API
          const dbLocRes = await axios.get(
            `${API_BASE_URL}/api/public/locations/detect`,
            {
              params: { latitude, longitude },
              timeout: 8000
            }
          ).catch(() => null);

          if (dbLocRes?.data?.success && dbLocRes?.data?.data) {
            const locData = dbLocRes.data.data;
            detectedCity = locData.city || '';
            detectedState = locData.state || '';
            if (locData.pinCodes && locData.pinCodes.length > 0) {
              detectedPin = locData.pinCodes[0];
            }
          }

          // 2. Call Nominatim for reverse geocoding of pickup street address
          const nomRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { timeout: 8000 }
          ).catch(() => null);

          if (nomRes?.data?.address) {
            const a = nomRes.data.address;
            const streetComponents = [
              a.amenity || a.building || a.shop || a.office || a.house_number || a.house_name,
              a.road || a.street || a.path || a.pedestrian,
              a.suburb || a.neighbourhood || a.residential || a.quarter || a.locality,
              a.city_district || a.subdistrict || a.area
            ].filter(Boolean);

            const uniqueComponents = [...new Set(streetComponents)];

            if (uniqueComponents.length > 0) {
              detectedAddress = uniqueComponents.join(', ');
            } else if (nomRes.data.display_name) {
              const displayNameParts = nomRes.data.display_name.split(',').map(s => s.trim());
              detectedAddress = displayNameParts.slice(0, Math.min(4, Math.max(1, displayNameParts.length - 3))).join(', ');
            }

            if (!detectedCity) {
              detectedCity = a.city || a.town || a.village || a.county || a.district || '';
            }
            if (!detectedState) {
              detectedState = a.state || '';
            }
            if (!detectedPin) {
              detectedPin = a.postcode || '';
            }
          }

          // Fallback if still empty
          if (!detectedAddress && nomRes?.data?.display_name) {
            detectedAddress = nomRes.data.display_name;
          }

          setFormData(prev => ({
            ...prev,
            pickupAddress: detectedAddress || prev.pickupAddress,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
            pinCode: detectedPin || prev.pinCode,
            latitude,
            longitude,
          }));

          let successMessage = 'Real-time GPS Location captured!';
          if (accuracy > 1000) {
            successMessage += ` (Moderate Accuracy: ~${Math.round(accuracy)}m)`;
          } else if (accuracy > 0) {
            successMessage += ` (High Accuracy: ~${Math.round(accuracy)}m)`;
          }

          setLocationSuccess(successMessage);
        } catch (geoErr) {
          console.warn('Location detection error:', geoErr);
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
          }));
          setLocationSuccess(`GPS Coordinates captured (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } finally {
          setFetchingLocation(false);
        }
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        setFetchingLocation(false);
        let msg = 'Unable to fetch current location. Please enter address manually.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'Location access was denied. Please allow location permissions in your browser or type address manually.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Location request timed out. Please try again or type address manually.';
        }
        setError(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    setError('');

    try {
      for (const file of files) {
        // Create instant crisp Object URL preview
        const blobPreview = URL.createObjectURL(file);

        let photoKey = blobPreview;
        try {
          const fileName = file.name;
          const fileType = file.type;

          const urlRes = await axios.get(`${API_BASE_URL}/api/public/food-donations/upload-url`, {
            params: { fileName, fileType },
          });

          if (urlRes.data?.success) {
            const { uploadUrl, key } = urlRes.data.data;
            await axios.put(uploadUrl, file, {
              headers: { 'Content-Type': fileType },
            });
            photoKey = key;
          }
        } catch (r2Err) {
          console.warn('R2 Direct upload skipped, using local blob preview:', r2Err);
        }

        setUploadedPhotos(prev => [...prev, { key: photoKey, preview: blobPreview }]);
      }
    } catch (err) {
      console.error('Error in photo handling:', err);
      setError('Photo processing error. Please try another image.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.donorName.trim() || !formData.donorPhone.trim() || !formData.donorEmail.trim()) {
        setError('Please enter your Name, Phone Number, and Email Address.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.foodType || !formData.foodItemsDescription.trim() || !formData.quantity.trim()) {
        setError('Please fill in the Food Category, Description, and Estimated Quantity.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.pickupAddress.trim() || !formData.city.trim() || !formData.pinCode.trim() || !formData.pickupTimeWindow.trim()) {
        setError('Please enter your complete Pickup Address, City, PIN Code, and Preferred Time Window.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        foodPhotos: uploadedPhotos.map(p => p.key),
        estimatedPeopleServed: parseInt(formData.estimatedPeopleServed) || 0,
        shelfLifeHours: parseInt(formData.shelfLifeHours) || 6,
      };

      const res = await axios.post(`${API_BASE_URL}/api/public/food-donations`, payload);

      if (res.data?.success) {
        setDonationId(res.data.data.donationId);
        setSubmitSuccess(true);
      } else {
        setError(res.data?.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Server error. Please verify input fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <SEOHead title="Donation Submitted | AnnDan Savitram Foundation" />
        <Navbar />
        <main className="flex-grow pt-28 pb-16 px-6 flex items-center justify-center">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 text-center space-y-6 shadow-xl border border-slate-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Food Donation Submitted!</h1>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Thank you for donating surplus food! Our operations team is assigning a field volunteer for pickup.
            </p>
            <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-2xl p-5 text-left space-y-2">
              <p className="text-xs text-emerald-800 uppercase font-black tracking-wider">Your Tracking ID</p>
              <p className="text-2xl font-black text-[#1B5E20] tracking-wide">{donationId}</p>
              <p className="text-xs text-slate-600 font-medium">Use this unique tracking ID to monitor real-time status and pickup photos.</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <a
                href={`/food-donation/track/${donationId}`}
                className="w-full px-6 py-3.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-all text-center"
              >
                Track Live Status
              </a>
              <a
                href="/food-donation"
                className="w-full px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all text-center"
              >
                Back to AnnDan Home
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <SEOHead title="Submit Food Donation | AnnDan Savitram Foundation" />
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-[#1B5E20] text-xs font-black uppercase tracking-wider">
              <Utensils size={14} />
              <span>AnnDan Surplus Food Rescue</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Submit Your Food Donation</h1>
            <p className="text-slate-600 text-sm font-bold">
              Step {step} of 3 — {step === 1 ? 'Donor Profile' : step === 2 ? 'Food & Quantity Details' : 'Pickup Location & Schedule'}
            </p>
          </div>

          {/* Stepper Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8">
            <div className="flex justify-between items-center gap-3">
              {[
                { num: 1, label: 'Donor Info' },
                { num: 2, label: 'Food Details' },
                { num: 3, label: 'Pickup Location' },
              ].map((s) => (
                <div key={s.num} className="flex-1 text-center">
                  <div
                    className={`h-2.5 rounded-full transition-all mb-2 ${
                      s.num <= step ? 'bg-[#1B5E20]' : 'bg-slate-200'
                    }`}
                  />
                  <span className={`text-xs font-extrabold ${s.num <= step ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                    {s.num}. {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 flex items-start gap-3 shadow-sm">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-extrabold text-red-800">{error}</p>
            </div>
          )}

          {/* Main Card Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-10 shadow-md border border-slate-200 space-y-6">
            
            {/* STEP 1: DONOR DETAILS */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-black text-slate-900">Step 1: Contact & Donor Profile</h2>
                  <p className="text-xs text-slate-500 font-medium">How can our dispatch volunteer contact you for pickup?</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                    FULL NAME / PRIMARY CONTACT *
                  </label>
                  <input
                    type="text"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      MOBILE PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      name="donorPhone"
                      value={formData.donorPhone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      name="donorEmail"
                      value={formData.donorEmail}
                      onChange={handleInputChange}
                      placeholder="name@domain.com"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      ORGANIZATION TYPE
                    </label>
                    <select
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-extrabold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 cursor-pointer"
                    >
                      <option value="Individual">Individual Household</option>
                      <option value="Hotel">Hotel / Resort</option>
                      <option value="Restaurant">Restaurant / Cafe</option>
                      <option value="Event Organizer">Wedding / Event Banquet</option>
                      <option value="Corporate">Corporate Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      ESTABLISHMENT / ORG NAME
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      placeholder="e.g. Hotel Taj Residency"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FOOD DETAILS & PHOTO UPLOAD */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-black text-slate-900">Step 2: Surplus Food Details</h2>
                  <p className="text-xs text-slate-500 font-medium">Describe the food quantity and upload visual photos for verification.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      FOOD TYPE *
                    </label>
                    <select
                      name="foodType"
                      value={formData.foodType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-extrabold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 cursor-pointer"
                    >
                      <option value="Cooked Food">Cooked Food (Meals/Curry/Rice/Roti)</option>
                      <option value="Packaged Food">Packaged Goods & Snacks</option>
                      <option value="Raw Ingredients">Raw Groceries & Vegetables</option>
                      <option value="Bakery & Sweets">Bakery Goods & Sweets</option>
                      <option value="Beverages">Beverages & Milk</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      EVENT TYPE
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-extrabold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 cursor-pointer"
                    >
                      <option value="Wedding">Wedding Banquet</option>
                      <option value="Party">Party / Celebration</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Hotel Surplus">Hotel Daily Surplus</option>
                      <option value="Restaurant Surplus">Restaurant Surplus</option>
                      <option value="Household">Household Excess</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                    FOOD DESCRIPTION *
                  </label>
                  <textarea
                    name="foodItemsDescription"
                    value={formData.foodItemsDescription}
                    onChange={handleInputChange}
                    placeholder="e.g. Veg Biryani, Paneer Curry, Tandoori Roti, Gulab Jamun (Untouched fresh surplus)"
                    rows="3"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      QUANTITY *
                    </label>
                    <input
                      type="text"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="e.g. 50 meals or 25 kg"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      ESTIMATED PEOPLE SERVED
                    </label>
                    <input
                      type="number"
                      name="estimatedPeopleServed"
                      value={formData.estimatedPeopleServed}
                      onChange={handleInputChange}
                      placeholder="e.g. 60"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      PREPARED DATE & TIME
                    </label>
                    <input
                      type="datetime-local"
                      name="preparedDateTime"
                      value={formData.preparedDateTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      SHELF LIFE (HOURS)
                    </label>
                    <input
                      type="number"
                      name="shelfLifeHours"
                      value={formData.shelfLifeHours}
                      onChange={handleInputChange}
                      placeholder="6"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                </div>

                {/* PHOTO UPLOAD BOX - Entire area clickable */}
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                    FOOD PHOTOS (CLICK BOX BELOW TO UPLOAD)
                  </label>
                  
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                    id="photo-upload-input"
                  />

                  <label
                    htmlFor="photo-upload-input"
                    className="block border-2 border-dashed border-[#1B5E20]/50 bg-emerald-50/40 hover:bg-emerald-50/90 rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all shadow-sm group hover:border-[#1B5E20]"
                  >
                    {uploadingPhoto ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <Loader size={32} className="animate-spin text-[#1B5E20]" />
                        <span className="text-sm font-extrabold text-[#1B5E20]">Uploading photos...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-sm">
                          <Upload size={28} />
                        </div>
                        <p className="text-base font-extrabold text-[#1B5E20]">Click here to upload photos</p>
                        <p className="text-xs font-bold text-slate-500">or drag and drop files from your device</p>
                      </div>
                    )}
                  </label>

                  {/* Thumbnail Previews */}
                  {uploadedPhotos.length > 0 && (
                    <div className="mt-5 space-y-2">
                      <p className="text-xs font-black text-[#1B5E20] uppercase tracking-wider">
                        Uploaded Photos ({uploadedPhotos.length}):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {uploadedPhotos.map((photoObj, idx) => {
                          const imgSrc = typeof photoObj === 'string' ? photoObj : (photoObj?.preview || photoObj?.key || '');
                          return (
                            <div key={idx} className="relative group bg-slate-900 rounded-2xl overflow-hidden border-2 border-[#1B5E20] shadow-md transition-all">
                              <div className="w-full h-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                                <img
                                  src={imgSrc}
                                  alt={`Food photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-xs px-2.5 py-1.5 flex items-center justify-between text-[11px] font-extrabold text-white">
                                <span>Photo #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePhoto(idx);
                                  }}
                                  className="p-1 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                                  title="Delete Photo"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: PICKUP DETAILS */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Step 3: Pickup Location & Schedule</h2>
                    <p className="text-xs text-slate-500 font-medium">Where should our volunteer reach for pickup?</p>
                  </div>
                </div>

                {locationSuccess && (
                  <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border-2 border-emerald-200 text-[#1B5E20] rounded-2xl text-xs font-extrabold shadow-xs">
                    <CheckCircle size={18} className="text-[#1B5E20] shrink-0" />
                    <span>{locationSuccess}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      PICKUP STREET ADDRESS *
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={fetchingLocation}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {fetchingLocation ? (
                        <>
                          <Loader size={14} className="animate-spin text-white" />
                          <span>Detecting GPS Location...</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={14} className="text-white" />
                          <span>Use Current Location 📍</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleInputChange}
                    placeholder="House/Hall No, Street Name, Landmark"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-2 text-xs">
                    <p className="text-slate-500 font-medium">
                      💡 <span className="font-bold text-slate-700">Tip:</span> You can edit or add your exact flat/house number or landmark above.
                    </p>
                    {formData.latitude && formData.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1B5E20] hover:underline font-bold flex items-center gap-1"
                      >
                        <span>View on Google Maps ↗</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      CITY *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Lucknow"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      STATE
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Uttar Pradesh"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      PIN CODE *
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      placeholder="226001"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                    PREFERRED PICKUP TIME WINDOW *
                  </label>
                  <select
                    name="pickupTimeWindow"
                    value={formData.pickupTimeWindow}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-extrabold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 cursor-pointer"
                  >
                    <option value="Immediate (Within 1 Hour)">Immediate (Within 1 Hour)</option>
                    <option value="14:00 - 16:00">14:00 - 16:00 (Afternoon)</option>
                    <option value="18:00 - 20:00">18:00 - 20:00 (Evening)</option>
                    <option value="22:00 - 00:00">22:00 - 00:00 (Late Night)</option>
                    <option value="Tomorrow Morning">Tomorrow Morning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                    SPECIAL INSTRUCTIONS FOR VOLUNTEER
                  </label>
                  <textarea
                    name="pickupInstructions"
                    value={formData.pickupInstructions}
                    onChange={handleInputChange}
                    placeholder="e.g. Contact Manager at Gate 2, food is packed in insulated containers"
                    rows="3"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-sm transition-all"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep()) setStep(step + 1);
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Next Step</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-black text-sm transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Submit Food Donation</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

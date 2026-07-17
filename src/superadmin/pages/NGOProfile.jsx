import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Phone, Mail, Globe, MapPin, Award, FileText,
  Upload, Loader2, Save, Trash2, ShieldCheck, Heart, Edit2, X, Check, ArrowLeft, ArrowRight
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/superadmin/ngo-profile`;

const NGOProfile = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null); // 'logo', 'signature', 'seal'

  // Modal editor states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStep, setEditStep] = useState(1); // Steps 1 to 4

  // NGO Details state
  const [ngoDetails, setNgoDetails] = useState(null);

  // Form states for editor modal
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    registrationDate: '',
    panNumber: '',
    tanNumber: '',
    contactNumber: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    district: '',
    pinCode: '',
    about: '',
    mission: '',
    vision: '',
    logo: '',
    logoUrl: '',
    signature: '',
    signatureUrl: '',
    seal: '',
    sealUrl: '',
    taxStatus: {
      is80GRegistered: false,
      registrationNumber80G: '',
      is12ARegistered: false,
      registrationNumber12A: '',
      csrNumber: '',
      isFcraRegistered: false,
      fcraNumber: '',
    },
  });

  const buildFormData = (data) => ({
    name: data.name || '',
    registrationNumber: data.registrationNumber || '',
    registrationDate: data.registrationDate ? new Date(data.registrationDate).toISOString().split('T')[0] : '',
    panNumber: data.panNumber || '',
    tanNumber: data.tanNumber || '',
    contactNumber: data.contactNumber || '',
    email: data.email || '',
    website: data.website || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    district: data.district || '',
    pinCode: data.pinCode || '',
    about: data.about || '',
    mission: data.mission || '',
    vision: data.vision || '',
    logo: data.logo || '',
    logoUrl: data.logoUrl || '',
    signature: data.signature || '',
    signatureUrl: data.signatureUrl || '',
    seal: data.seal || '',
    sealUrl: data.sealUrl || '',
    taxStatus: {
      is80GRegistered: data.taxStatus?.is80GRegistered || false,
      registrationNumber80G: data.taxStatus?.registrationNumber80G || '',
      is12ARegistered: data.taxStatus?.is12ARegistered || false,
      registrationNumber12A: data.taxStatus?.registrationNumber12A || '',
      csrNumber: data.taxStatus?.csrNumber || '',
      isFcraRegistered: data.taxStatus?.isFcraRegistered || false,
      fcraNumber: data.taxStatus?.fcraNumber || '',
    },
  });

  // Fetch NGO Profile
  const fetchProfile = useCallback(async (updateForm = true) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        const data = resData.data;
        setNgoDetails(data);
        if (updateForm) setFormData(buildFormData(data));
      } else {
        setNgoDetails(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Open Edit Modal and reset to step 1
  const handleOpenEditModal = () => {
    setEditStep(1);
    if (ngoDetails) setFormData(buildFormData(ngoDetails));
    setIsEditModalOpen(true);
  };

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Tax Status Change
  const handleTaxChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      taxStatus: {
        ...prev.taxStatus,
        [name]: value,
      },
    }));
  };

  // Upload Asset Flow
  const handleFileUpload = async (e, fieldType) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WEBP images are allowed');
      return;
    }

    setUploadingField(fieldType);
    try {
      // Get Presigned upload URL
      const url = `${API_BASE}/upload-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}&fileType=${fieldType}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate upload URL');
      }

      const { uploadUrl, key } = data;

      // Upload file directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image directly to storage');
      }

      // Create Local URL for Instant Preview
      const localUrl = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        [fieldType]: key,
        [`${fieldType}Url`]: localUrl,
      }));

      toast.success(`${fieldType.toUpperCase()} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  // Clear Uploaded Asset
  const handleClearAsset = (fieldType) => {
    setFormData((prev) => ({
      ...prev,
      [fieldType]: '',
      [`${fieldType}Url`]: '',
    }));
  };

  // Validate Step Inputs before moving next
  const validateStep = () => {
    if (editStep === 1) {
      if (!formData.name) {
        toast.error('NGO Name is required');
        return false;
      }
      if (!formData.email) {
        toast.error('Primary Email is required');
        return false;
      }
      if (!formData.contactNumber) {
        toast.error('Contact Phone is required');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setEditStep(prev => prev + 1);
    }
  };

  const handleBackStep = () => {
    setEditStep(prev => prev - 1);
  };

  // Save/Update NGO Profile
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        registrationDate: formData.registrationDate,
        panNumber: formData.panNumber,
        tanNumber: formData.tanNumber,
        contactNumber: formData.contactNumber,
        email: formData.email,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        district: formData.district,
        pinCode: formData.pinCode,
        about: formData.about,
        mission: formData.mission,
        vision: formData.vision,
        logo: formData.logo || undefined,
        signature: formData.signature || undefined,
        seal: formData.seal || undefined,
        taxStatus: formData.taxStatus,
      };

      const res = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || 'NGO Profile updated successfully!');
        setIsEditModalOpen(false);
        fetchProfile(false);
      } else {
        toast.error(resData.message || 'Failed to save NGO Profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Building2 className="text-[#1B5E20]" size={28} />
              NGO Profile
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Official records, registration numbers, tax exemptions, and media branding
            </p>
          </div>
          <button
            onClick={handleOpenEditModal}
            className="px-5 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow hover:shadow-lg active:scale-95"
          >
            <Edit2 size={16} />
            {ngoDetails ? 'Edit NGO Profile' : 'Add NGO Profile'}
          </button>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-sm font-semibold text-gray-500">Loading profile data...</p>
          </div>
        ) : !ngoDetails ? (
          <div
            className="rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4"
            style={{
              backgroundColor: '#F5F5F5',
              boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
            }}
          >
            <Building2 className="text-gray-300" size={64} />
            <div>
              <h2 className="text-xl font-black text-black">NGO Profile not configured</h2>
              <p className="text-sm text-gray-500 font-semibold mt-1 max-w-md">
                Setup your NGO's official information, logo, signature, and tax details to get started.
              </p>
            </div>
            <button
              onClick={handleOpenEditModal}
              className="px-6 py-3 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-black text-sm transition-all cursor-pointer shadow active:scale-95"
            >
              Setup NGO Profile
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* NGO Hero Detail Box */}
            <div
              className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
              }}
            >
              {/* Logo display */}
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-white border border-[#1B5E20]/15 flex items-center justify-center overflow-hidden p-3 shadow-sm flex-shrink-0">
                {ngoDetails.logoUrl ? (
                  <img src={ngoDetails.logoUrl} alt="NGO Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="text-gray-300" size={64} />
                )}
              </div>

              {/* Title & Info grid */}
              <div className="flex-1 space-y-4 text-center md:text-left w-full">
                <div>
                  <h2 className="text-3xl font-black text-black">{ngoDetails.name}</h2>
                  {ngoDetails.registrationNumber && (
                    <p className="text-sm text-gray-500 font-black mt-1 uppercase tracking-wide">
                      Reg No: <span className="text-black">{ngoDetails.registrationNumber}</span>
                      {ngoDetails.registrationDate && ` (Est: ${new Date(ngoDetails.registrationDate).toLocaleDateString('en-IN')})`}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2.5 text-black font-semibold">
                    <Mail size={16} className="text-[#1B5E20]" />
                    <span>{ngoDetails.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2.5 text-black font-semibold">
                    <Phone size={16} className="text-[#1B5E20]" />
                    <span>{ngoDetails.contactNumber}</span>
                  </div>
                  {ngoDetails.website && (
                    <div className="flex items-center justify-center md:justify-start gap-2.5 text-black font-semibold">
                      <Globe size={16} className="text-[#1B5E20]" />
                      <a href={ngoDetails.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                        {ngoDetails.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mission & Vision Section */}
              <div
                className="lg:col-span-2 rounded-3xl p-6 md:p-8 space-y-6"
                style={{
                  backgroundColor: '#F5F5F5',
                  boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
                }}
              >
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-3">
                    About the Organization
                  </h3>
                  <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-line">
                    {ngoDetails.about || 'No details provided about the NGO yet.'}
                  </p>
                </div>

                {ngoDetails.mission && (
                  <div>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-200 pb-2 mb-3">
                      <Heart size={14} className="text-red-500 fill-red-500" />
                      Our Mission
                    </h3>
                    <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-line">
                      {ngoDetails.mission}
                    </p>
                  </div>
                )}

                {ngoDetails.vision && (
                  <div>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-200 pb-2 mb-3">
                      <ShieldCheck size={14} className="text-blue-600" />
                      Our Vision
                    </h3>
                    <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-line">
                      {ngoDetails.vision}
                    </p>
                  </div>
                )}
              </div>

              {/* Legal Address & Tax Cards */}
              <div className="space-y-6">
                {/* Registered Address Card */}
                <div
                  className="rounded-3xl p-6 space-y-4"
                  style={{
                    backgroundColor: '#F5F5F5',
                    boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
                  }}
                >
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2">
                    Registered Address
                  </h3>
                  <div className="flex gap-3 text-sm text-black font-semibold">
                    <MapPin size={18} className="text-[#1B5E20] flex-shrink-0 mt-0.5" />
                    <div>
                      {ngoDetails.address ? (
                        <>
                          <p>{ngoDetails.address}</p>
                          <p>
                            {[ngoDetails.city, ngoDetails.district].filter(Boolean).join(', ')}
                          </p>
                          <p>
                            {[ngoDetails.state, ngoDetails.pinCode].filter(Boolean).join(' - ')}
                          </p>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No address registered</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tax & Registration numbers Card */}
                <div
                  className="rounded-3xl p-6 space-y-4"
                  style={{
                    backgroundColor: '#F5F5F5',
                    boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
                  }}
                >
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2">
                    Tax Status & Numbers
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-500">PAN Number</span>
                      <span className="text-sm font-black text-black">{ngoDetails.panNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-500">TAN Number</span>
                      <span className="text-sm font-black text-black">{ngoDetails.tanNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-500">CSR Registration</span>
                      <span className="text-sm font-black text-black">{ngoDetails.taxStatus?.csrNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-500">80G Exemption</span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${ngoDetails.taxStatus?.is80GRegistered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {ngoDetails.taxStatus?.is80GRegistered ? ngoDetails.taxStatus.registrationNumber80G || 'Registered' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-500">12A Registration</span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${ngoDetails.taxStatus?.is12ARegistered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {ngoDetails.taxStatus?.is12ARegistered ? ngoDetails.taxStatus.registrationNumber12A || 'Registered' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-500">FCRA Details</span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${ngoDetails.taxStatus?.isFcraRegistered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {ngoDetails.taxStatus?.isFcraRegistered ? ngoDetails.taxStatus.fcraNumber || 'Registered' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signature & Stamp Card */}
                <div
                  className="rounded-3xl p-6 space-y-4"
                  style={{
                    backgroundColor: '#F5F5F5',
                    boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
                  }}
                >
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2">
                    Authorized Signatures & Seals
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sig */}
                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase mb-2">Signature</span>
                      <div className="w-full h-16 bg-gray-50 rounded border border-gray-50 flex items-center justify-center overflow-hidden">
                        {ngoDetails.signatureUrl ? (
                          <img src={ngoDetails.signatureUrl} alt="Signature" className="w-full h-full object-contain" />
                        ) : (
                          <FileText size={20} className="text-gray-300" />
                        )}
                      </div>
                    </div>
                    {/* Seal */}
                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase mb-2">Official Seal</span>
                      <div className="w-full h-16 bg-gray-50 rounded border border-gray-50 flex items-center justify-center overflow-hidden">
                        {ngoDetails.sealUrl ? (
                          <img src={ngoDetails.sealUrl} alt="Official Seal" className="w-full h-full object-contain" />
                        ) : (
                          <Award size={20} className="text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4-Step Wizard Modal for Editing NGO Profile */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
            <div
              className="w-full max-w-3xl rounded-3xl p-6 md:p-8 relative bg-[#F5F5F5] max-h-[95vh] flex flex-col shadow-2xl"
              style={{
                boxShadow: '12px 12px 24px #1b1b1b50',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow"
              >
                <X size={18} />
              </button>

              {/* Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-black">{ngoDetails ? 'Edit NGO Profile' : 'Add NGO Profile'}</h2>
                <p className="text-xs text-gray-500 font-bold mt-1">
                  Complete the steps below to {ngoDetails ? 'update' : 'setup'} your organization profile.
                </p>
              </div>

              {/* Stepper Progress bar */}
              <div className="mb-8 flex items-center justify-between w-full px-4 relative">
                {/* Horizontal progress background lines */}
                <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
                <div
                  className="absolute left-10 top-1/2 -translate-y-1/2 h-1 bg-[#1B5E20] z-0 transition-all duration-300"
                  style={{
                    width: `${((editStep - 1) / 3) * 80}%`,
                  }}
                ></div>

                {/* Step Circles */}
                {[
                  { step: 1, label: 'General Info' },
                  { step: 2, label: 'Vision & Mission' },
                  { step: 3, label: 'Tax & Legal' },
                  { step: 4, label: 'Assets & Media' },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center z-10 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 ${
                        editStep >= s.step
                          ? 'bg-[#1B5E20] border-[#1B5E20] text-white'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}
                    >
                      {editStep > s.step ? <Check size={16} /> : s.step}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider mt-2.5 transition-all ${
                      editStep === s.step ? 'text-[#1B5E20]' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step Forms Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto pr-1 py-1 no-scrollbar space-y-6 min-h-[300px]">
                {/* Step 1: General Info */}
                {editStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">NGO Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. SAVITRAM FOUNDATION"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">Registration Number</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        placeholder="e.g. NGO/REG/2026/8987"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">Registration Date</label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={formData.registrationDate}
                        onChange={handleChange}
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">Primary Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. info@ngo.org"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">Contact Phone *</label>
                      <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="e.g. +91 9876543210"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">Website URL</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="e.g. https://savitram.org"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">Office Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g. Office Suite 404, SAVITRAM FOUNDATION Tower"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. New Delhi"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">District</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="e.g. South Delhi"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Delhi"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">PIN Code</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                        placeholder="e.g. 110001"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Vision & Mission */}
                {editStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">About NGO (Description)</label>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        placeholder="Provide a brief summary detailing the NGO's purpose, background, and reach."
                        rows="5"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all resize-none shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">Mission Statement</label>
                      <textarea
                        name="mission"
                        value={formData.mission}
                        onChange={handleChange}
                        placeholder="State the core mission and focus areas of your organization..."
                        rows="4"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all resize-none shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">Vision Statement</label>
                      <textarea
                        name="vision"
                        value={formData.vision}
                        onChange={handleChange}
                        placeholder="State the long-term vision of what the NGO aims to accomplish..."
                        rows="4"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all resize-none shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Tax & Legal */}
                {editStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">PAN Number</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        placeholder="e.g. AAATA0000A"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider">TAN Number</label>
                      <input
                        type="text"
                        name="tanNumber"
                        value={formData.tanNumber}
                        onChange={handleChange}
                        placeholder="e.g. DELA00000A"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white text-sm font-bold text-black transition-all shadow-sm"
                      />
                    </div>

                    {/* 80G */}
                    <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/15 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-800 uppercase tracking-wide">80G Status</span>
                        <input
                          type="checkbox"
                          checked={formData.taxStatus.is80GRegistered}
                          onChange={(e) => handleTaxChange('is80GRegistered', e.target.checked)}
                          className="w-4 h-4 cursor-pointer text-[#1B5E20]"
                        />
                      </div>
                      {formData.taxStatus.is80GRegistered && (
                        <input
                          type="text"
                          value={formData.taxStatus.registrationNumber80G}
                          onChange={(e) => handleTaxChange('registrationNumber80G', e.target.value)}
                          placeholder="Enter 80G Registration Number"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 text-xs font-bold text-black focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white shadow-sm"
                        />
                      )}
                    </div>

                    {/* 12A */}
                    <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/15 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-800 uppercase tracking-wide">12A Status</span>
                        <input
                          type="checkbox"
                          checked={formData.taxStatus.is12ARegistered}
                          onChange={(e) => handleTaxChange('is12ARegistered', e.target.checked)}
                          className="w-4 h-4 cursor-pointer text-[#1B5E20]"
                        />
                      </div>
                      {formData.taxStatus.is12ARegistered && (
                        <input
                          type="text"
                          value={formData.taxStatus.registrationNumber12A}
                          onChange={(e) => handleTaxChange('registrationNumber12A', e.target.value)}
                          placeholder="Enter 12A Registration Number"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 text-xs font-bold text-black focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white shadow-sm"
                        />
                      )}
                    </div>

                    {/* CSR Number */}
                    <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/15 space-y-3 shadow-sm">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-black text-gray-800 uppercase tracking-wide">CSR Registration Number</span>
                        <input
                          type="text"
                          value={formData.taxStatus.csrNumber}
                          onChange={(e) => handleTaxChange('csrNumber', e.target.value)}
                          placeholder="e.g. CSR00000000"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 text-xs font-bold text-black focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white shadow-sm"
                        />
                      </div>
                    </div>

                    {/* FCRA */}
                    <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/15 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-800 uppercase tracking-wide">FCRA Status</span>
                        <input
                          type="checkbox"
                          checked={formData.taxStatus.isFcraRegistered}
                          onChange={(e) => handleTaxChange('isFcraRegistered', e.target.checked)}
                          className="w-4 h-4 cursor-pointer text-[#1B5E20]"
                        />
                      </div>
                      {formData.taxStatus.isFcraRegistered && (
                        <input
                          type="text"
                          value={formData.taxStatus.fcraNumber}
                          onChange={(e) => handleTaxChange('fcraNumber', e.target.value)}
                          placeholder="Enter FCRA Registration Number"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 text-xs font-bold text-black focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none bg-white shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Assets & Media */}
                {editStep === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Logo Upload */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col items-center text-center shadow-sm">
                      <span className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">NGO Logo</span>
                      <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mb-4 relative shadow-inner">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="text-gray-300" size={36} />
                        )}
                        {uploadingField === 'logo' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <label className="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow">
                          <Upload size={12} />
                          Upload
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, 'logo')}
                            className="hidden"
                            accept="image/*"
                            disabled={!!uploadingField}
                          />
                        </label>
                        {formData.logo && (
                          <button
                            type="button"
                            onClick={() => handleClearAsset('logo')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Signature Upload */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col items-center text-center shadow-sm">
                      <span className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">Signature</span>
                      <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mb-4 relative shadow-inner">
                        {formData.signatureUrl ? (
                          <img src={formData.signatureUrl} alt="Signature" className="w-full h-full object-contain" />
                        ) : (
                          <FileText className="text-gray-300" size={36} />
                        )}
                        {uploadingField === 'signature' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <label className="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow">
                          <Upload size={12} />
                          Upload
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, 'signature')}
                            className="hidden"
                            accept="image/*"
                            disabled={!!uploadingField}
                          />
                        </label>
                        {formData.signature && (
                          <button
                            type="button"
                            onClick={() => handleClearAsset('signature')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Seal Upload */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col items-center text-center shadow-sm">
                      <span className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">Official Seal</span>
                      <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mb-4 relative shadow-inner">
                        {formData.sealUrl ? (
                          <img src={formData.sealUrl} alt="Seal" className="w-full h-full object-contain" />
                        ) : (
                          <Award className="text-gray-300" size={36} />
                        )}
                        {uploadingField === 'seal' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <label className="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow">
                          <Upload size={12} />
                          Upload
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, 'seal')}
                            className="hidden"
                            accept="image/*"
                            disabled={!!uploadingField}
                          />
                        </label>
                        {formData.seal && (
                          <button
                            type="button"
                            onClick={() => handleClearAsset('seal')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer Controls */}
              <div className="pt-5 border-t border-gray-200 flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={handleBackStep}
                  disabled={editStep === 1 || saving || !!uploadingField}
                  className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                {editStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow active:scale-95"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving || !!uploadingField}
                    className="px-6 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow hover:shadow-lg active:scale-95"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NGOProfile;

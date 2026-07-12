import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, Loader2, Search, X, Check, AlertCircle,
  DollarSign, Gift, Clock, Users, ChevronDown, ChevronUp, Settings, Eye
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/superadmin/membership-types`;

const MembershipTypes = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [membershipTypes, setMembershipTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCustomName, setIsCustomName] = useState(false);

  const handleDropdownToggle = (e, typeId) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === typeId ? null : typeId));
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    annualFee: '',
    lifetimeFee: '',
    benefits: '',
    maxUpgrades: '',
    validityYears: '1',
    isActive: true,
  });

  const fetchMembershipTypes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = new URL(API_BASE);
      if (search) url.searchParams.append('search', search);
      if (filterActive !== 'all') url.searchParams.append('isActive', filterActive === 'active');

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await res.json();
      if (resData.success) {
        setMembershipTypes(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch membership types');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load membership types');
    } finally {
      setLoading(false);
    }
  }, [token, search, filterActive, toast]);

  useEffect(() => {
    fetchMembershipTypes();
  }, [fetchMembershipTypes]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      annualFee: '',
      lifetimeFee: '',
      benefits: '',
      maxUpgrades: '',
      validityYears: '1',
      isActive: true,
    });
    setEditingId(null);
    setIsCustomName(false);
  };

  const handleEdit = (type) => {
    setFormData({
      name: type.name,
      description: type.description || '',
      annualFee: type.annualFee.toString(),
      lifetimeFee: type.lifetimeFee.toString(),
      benefits: type.benefits.join(', '),
      maxUpgrades: type.maxUpgrades.toString(),
      validityYears: type.validityYears.toString(),
      isActive: type.isActive,
    });
    setEditingId(type._id);
    const defaults = ["General", "Life", "Honorary", "Student", "Corporate"];
    setIsCustomName(!defaults.includes(type.name));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.annualFee || !formData.lifetimeFee) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        annualFee: Number(formData.annualFee),
        lifetimeFee: Number(formData.lifetimeFee),
        benefits: formData.benefits
          .split(',')
          .map(b => b.trim())
          .filter(b => b),
        maxUpgrades: Number(formData.maxUpgrades) || 0,
        validityYears: Number(formData.validityYears) || 1,
        isActive: formData.isActive,
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || (editingId ? 'Membership type updated successfully' : 'Membership type created successfully'));
        fetchMembershipTypes();
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(resData.message || 'Failed to save membership type');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this membership type?')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || 'Membership type deleted successfully');
        fetchMembershipTypes();
      } else {
        toast.error(resData.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  const filteredTypes = membershipTypes.filter(type => {
    if (search) {
      return (
        type.name.toLowerCase().includes(search.toLowerCase()) ||
        type.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <Layout>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Gift className="text-[#1B5E20]" size={28} />
              Membership Types
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Manage membership types, fees, and benefits
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#1B5E20] hover:bg-[#145a1b] transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Membership Type
          </button>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
          }}
        >
          {/* Search & Filter */}
          <div className="mb-6 border-b border-gray-200 pb-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gift size={16} className="text-[#1B5E20]" />
                Membership Types ({filteredTypes.length})
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center min-w-[200px]">
                  <Search className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, description..."
                    className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                  />
                </div>

                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading membership types...</p>
            </div>
          ) : filteredTypes.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Gift size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Membership Types Found</p>
                <p className="text-xs text-gray-400 mt-1">Create your first membership type to get started</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-700 text-xs font-extrabold uppercase tracking-wider">
                    <th className="px-4 py-3.5">Membership Name</th>
                    <th className="px-4 py-3.5">Annual Fee</th>
                    <th className="px-4 py-3.5">Lifetime Fee</th>
                    <th className="px-4 py-3.5">Validity</th>
                    <th className="px-4 py-3.5">Max Upgrades</th>
                    <th className="px-4 py-3.5">Benefits</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTypes.map(type => (
                    <tr key={type._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 font-extrabold text-black">{type.name}</td>
                      <td className="px-4 py-4 font-bold text-black">₹{type.annualFee.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 font-bold text-black">₹{type.lifetimeFee.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-black font-bold">
                        {type.validityYears} {type.validityYears > 1 ? 'Years' : 'Year'}
                      </td>
                      <td className="px-4 py-4 text-black font-bold">{type.maxUpgrades}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {type.benefits.slice(0, 3).map((benefit, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1B5E20]/10 text-[#1B5E20]">
                              {benefit}
                            </span>
                          ))}
                          {type.benefits.length > 3 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">
                              + {type.benefits.length - 3} more
                            </span>
                          )}
                          {type.benefits.length === 0 && <span className="text-gray-400 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          type.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {type.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right relative overflow-visible">
                        <div className="inline-block text-left">
                          <button
                            onClick={(e) => handleDropdownToggle(e, type._id)}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer text-gray-700 hover:text-[#1B5E20]"
                            title="Actions"
                          >
                            <Settings size={18} className={activeDropdownId === type._id ? 'animate-spin text-[#1B5E20]' : ''} />
                          </button>

                          {activeDropdownId === type._id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-4 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left"
                              style={{
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                              }}
                            >
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setViewingId(type._id);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Eye size={14} className="text-gray-400" /> View Details
                              </button>

                              <div className="border-t border-gray-100 my-1"></div>

                              {/* Edit */}
                              <button
                                onClick={() => {
                                  handleEdit(type);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 size={14} className="text-gray-400" /> Edit
                              </button>

                              <div className="border-t border-gray-100 my-1"></div>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  handleDelete(type._id);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 size={14} className="text-red-400" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
            style={{
              backgroundColor: '#F5F5F5',
              boxShadow: '10px 10px 20px rgba(0,0,0,0.2)',
            }}
          >
            <button
              onClick={() => setViewingId(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
            >
              <X size={20} />
            </button>

            {membershipTypes.find(t => t._id === viewingId) && (() => {
              const type = membershipTypes.find(t => t._id === viewingId);
              return (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-3xl font-extrabold text-black mb-3">{type.name}</h2>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                      type.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Fees */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/25 shadow-sm">
                      <p className="text-xs text-gray-900 font-extrabold mb-2 uppercase tracking-wide">Annual Fee</p>
                      <p className="font-black text-black text-xl">₹{type.annualFee.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/25 shadow-sm">
                      <p className="text-xs text-gray-900 font-extrabold mb-2 uppercase tracking-wide">Lifetime Fee</p>
                      <p className="font-black text-black text-xl">₹{type.lifetimeFee.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Validity & Max Upgrades */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/25 shadow-sm">
                      <p className="text-xs text-gray-900 font-extrabold mb-2 uppercase tracking-wide">Validity Period</p>
                      <p className="font-black text-black text-xl">{type.validityYears} Year{type.validityYears > 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/25 shadow-sm">
                      <p className="text-xs text-gray-900 font-extrabold mb-2 uppercase tracking-wide">Max Upgrades</p>
                      <p className="font-black text-black text-xl">{type.maxUpgrades}</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  {type.benefits.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-900 font-extrabold mb-3 uppercase tracking-wide">Benefits</p>
                      <div className="space-y-2">
                        {type.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#1B5E20]/20 shadow-sm">
                            <Check size={16} className="text-[#1B5E20] stroke-[3px] flex-shrink-0" />
                            <span className="text-sm font-bold text-black">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {type.description && (
                    <div>
                      <p className="text-xs text-gray-900 font-extrabold mb-3 uppercase tracking-wide">Description</p>
                      <div className="bg-white p-4 rounded-xl border border-[#1B5E20]/20 shadow-sm">
                        <p className="text-sm font-bold text-black leading-relaxed">{type.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Close Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setViewingId(null)}
                      className="w-full px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
            style={{
              backgroundColor: '#F5F5F5',
              boxShadow: '10px 10px 20px rgba(0,0,0,0.2)',
            }}
          >
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">
                {editingId ? 'Edit Membership Type' : 'Add New Membership Type'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingId ? 'Update membership type details' : 'Create a new membership type'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">
                  Membership Type Name <span className="text-red-600">*</span>
                </label>
                {isCustomName ? (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!!editingId}
                      placeholder="Enter custom membership name (e.g., Premium, Patron)"
                      className="w-full pr-20 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white text-sm transition-all disabled:bg-gray-100"
                    />
                    {!editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomName(false);
                          setFormData({ ...formData, name: '' });
                        }}
                        className="absolute right-3 text-xs font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer focus:outline-none"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.name}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomName(true);
                        setFormData({ ...formData, name: '' });
                      } else {
                        setFormData({ ...formData, name: e.target.value });
                      }
                    }}
                    disabled={!!editingId}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white text-sm transition-all cursor-pointer disabled:bg-gray-100"
                  >
                    <option value="">Select membership type</option>
                    <option value="General">General</option>
                    <option value="Life">Life</option>
                    <option value="Honorary">Honorary</option>
                    <option value="Student">Student</option>
                    <option value="Corporate">Corporate</option>
                    <option value="custom">+ Add Custom Membership Type</option>
                  </select>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter membership type description"
                  rows="3"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white text-sm transition-all resize-none"
                />
              </div>

              {/* Fees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">
                    Annual Fee (₹) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.annualFee}
                    onChange={(e) => setFormData({ ...formData, annualFee: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">
                    Lifetime Fee (₹) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.lifetimeFee}
                    onChange={(e) => setFormData({ ...formData, lifetimeFee: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white text-sm transition-all"
                  />
                </div>
              </div>

              {/* Validity & Max Upgrades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Validity (Years)</label>
                  <input
                    type="number"
                    value={formData.validityYears}
                    onChange={(e) => setFormData({ ...formData, validityYears: e.target.value })}
                    placeholder="1"
                    min="1"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Max Upgrades</label>
                  <input
                    type="number"
                    value={formData.maxUpgrades}
                    onChange={(e) => setFormData({ ...formData, maxUpgrades: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white text-sm transition-all"
                  />
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">
                  Benefits <span className="text-gray-400 font-normal">(comma separated)</span>
                </label>
                <textarea
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="e.g., Free events, Priority support, Certificate"
                  rows="3"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white text-sm transition-all resize-none"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Active Status
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#1B5E20] hover:bg-[#145a1b] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MembershipTypes;

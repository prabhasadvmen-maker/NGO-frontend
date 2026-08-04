import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Search, 
  RefreshCw, CheckCircle, AlertCircle, Loader2, Globe, Shield, Filter
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import axios from 'axios';

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
    <div className="w-full max-w-2xl my-8 rounded-3xl p-6 md:p-8 bg-white border border-slate-100 shadow-2xl relative">
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold">
        <MapPin size={20} />
      </div>
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
    </div>
    <button 
      onClick={onClose} 
      className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
    >
      <X size={20} />
    </button>
  </div>
);

export default function LocationsList() {
  const { token } = useAuth();
  const toast = useToast();
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    city: '',
    state: 'Uttar Pradesh',
    district: '',
    minLatitude: '',
    maxLatitude: '',
    minLongitude: '',
    maxLongitude: '',
    pinCodesString: '',
    isActive: true,
  });

  const getHeaders = () => {
    const authToken = token || localStorage.getItem('token') || localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    };
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/locations`, getHeaders());
      if (res.data?.success) {
        setLocations(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      toast?.showToast?.('Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({
      city: '',
      state: 'Uttar Pradesh',
      district: '',
      minLatitude: '',
      maxLatitude: '',
      minLongitude: '',
      maxLongitude: '',
      pinCodesString: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditingLocation(loc);
    setFormData({
      city: loc.city || '',
      state: loc.state || '',
      district: loc.district || '',
      minLatitude: loc.minLatitude ?? '',
      maxLatitude: loc.maxLatitude ?? '',
      minLongitude: loc.minLongitude ?? '',
      maxLongitude: loc.maxLongitude ?? '',
      pinCodesString: (loc.pinCodes || []).join(', '),
      isActive: loc.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (loc) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/locations/${loc._id}`,
        { isActive: !loc.isActive },
        getHeaders()
      );
      if (res.data?.success) {
        toast?.showToast?.(`Location status updated to ${!loc.isActive ? 'Active' : 'Inactive'}`, 'success');
        fetchLocations();
      }
    } catch (err) {
      console.error('Error toggling location status:', err);
      toast?.showToast?.('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location master entry?')) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/locations/${id}`, getHeaders());
      if (res.data?.success) {
        toast?.showToast?.('Location deleted successfully', 'success');
        fetchLocations();
      }
    } catch (err) {
      console.error('Error deleting location:', err);
      toast?.showToast?.('Failed to delete location', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const pinCodesArr = formData.pinCodesString
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const payload = {
      city: formData.city.trim(),
      state: formData.state.trim(),
      district: formData.district.trim(),
      minLatitude: parseFloat(formData.minLatitude),
      maxLatitude: parseFloat(formData.maxLatitude),
      minLongitude: parseFloat(formData.minLongitude),
      maxLongitude: parseFloat(formData.maxLongitude),
      pinCodes: pinCodesArr,
      isActive: formData.isActive,
    };

    try {
      if (editingLocation) {
        const res = await axios.put(
          `${API_BASE_URL}/api/admin/locations/${editingLocation._id}`,
          payload,
          getHeaders()
        );
        if (res.data?.success) {
          toast?.showToast?.('Location updated successfully', 'success');
          setIsModalOpen(false);
          fetchLocations();
        }
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/api/admin/locations`,
          payload,
          getHeaders()
        );
        if (res.data?.success) {
          toast?.showToast?.('New Location created successfully', 'success');
          setIsModalOpen(false);
          fetchLocations();
        }
      }
    } catch (err) {
      console.error('Error saving location:', err);
      const msg = err.response?.data?.message || 'Failed to save location';
      toast?.showToast?.(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = 
        !search ||
        loc.city?.toLowerCase().includes(search.toLowerCase()) ||
        loc.state?.toLowerCase().includes(search.toLowerCase()) ||
        loc.district?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = 
        statusFilter === 'All' ||
        (statusFilter === 'Active' && loc.isActive) ||
        (statusFilter === 'Inactive' && !loc.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [locations, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = locations.length;
    const active = locations.filter(l => l.isActive).length;
    const inactive = total - active;
    const states = new Set(locations.map(l => l.state)).size;
    return { total, active, inactive, states };
  }, [locations]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#1B5E20] text-xs font-black uppercase tracking-wider mb-2">
              <MapPin size={14} />
              <span>Location Master Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Location Master</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage GPS boundary coordinates, cities, districts, and PIN codes for automatic location detection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLocations}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer shadow-xs"
              title="Refresh Locations"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={openAddModal}
              className="px-5 py-3 rounded-2xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10"
            >
              <Plus size={18} />
              <span>Add Location</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Locations</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Locations</p>
              <h3 className="text-2xl font-black text-emerald-700">{stats.active}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inactive Locations</p>
              <h3 className="text-2xl font-black text-amber-700">{stats.inactive}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">States Covered</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.states}</h3>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search city, district, state..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Filter size={16} />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1B5E20] cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Locations Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={36} className="animate-spin text-[#1B5E20]" />
              <p className="text-xs font-extrabold text-slate-500">Loading location master data...</p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center p-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MapPin size={32} />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">No Locations Found</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                No location entries match your search criteria. Click "Add Location" to create a new entry.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">City</th>
                    <th className="py-4 px-6">State</th>
                    <th className="py-4 px-6">District</th>
                    <th className="py-4 px-6">Lat Range</th>
                    <th className="py-4 px-6">Lon Range</th>
                    <th className="py-4 px-6">PIN Codes</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {filteredLocations.map(loc => (
                    <tr key={loc._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-900 flex items-center gap-2">
                        <MapPin size={14} className="text-[#1B5E20] shrink-0" />
                        <span>{loc.city}</span>
                      </td>
                      <td className="py-4 px-6">{loc.state}</td>
                      <td className="py-4 px-6 text-slate-600">{loc.district}</td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-600">
                        {loc.minLatitude?.toFixed(2)} - {loc.maxLatitude?.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-600">
                        {loc.minLongitude?.toFixed(2)} - {loc.maxLongitude?.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold" title={(loc.pinCodes || []).join(', ')}>
                          {loc.pinCodes?.length || 0} PINS
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${
                          loc.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${loc.isActive ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          <span>{loc.isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1 shrink-0">
                        <button
                          onClick={() => handleToggleStatus(loc)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            loc.isActive ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'
                          }`}
                          title={loc.isActive ? 'Deactivate Location' : 'Activate Location'}
                        >
                          {loc.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => openEditModal(loc)}
                          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Edit Location"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(loc._id)}
                          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Location"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Location Modal */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <ModalHeader
              title={editingLocation ? 'Edit Location Master' : 'Add New Location Master'}
              onClose={() => setIsModalOpen(false)}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Shrawasti"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Shrawasti"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Min Lat *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.minLatitude}
                    onChange={e => setFormData({ ...formData, minLatitude: e.target.value })}
                    placeholder="27.50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Max Lat *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.maxLatitude}
                    onChange={e => setFormData({ ...formData, maxLatitude: e.target.value })}
                    placeholder="27.90"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Min Lon *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.minLongitude}
                    onChange={e => setFormData({ ...formData, minLongitude: e.target.value })}
                    placeholder="81.80"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Max Lon *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.maxLongitude}
                    onChange={e => setFormData({ ...formData, maxLongitude: e.target.value })}
                    placeholder="82.20"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                  PIN Codes (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.pinCodesString}
                  onChange={e => setFormData({ ...formData, pinCodesString: e.target.value })}
                  placeholder="e.g. 271831, 271835, 271840"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1B5E20]"
                />
                <p className="text-[11px] text-slate-400 font-medium mt-1">Separate multiple postal codes with commas.</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#1B5E20] rounded-md border-slate-300 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Mark as Active Location
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin text-white" />}
                  <span>{editingLocation ? 'Save Changes' : 'Create Location'}</span>
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

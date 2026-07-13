import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/campaigns`;
const BRANCH_API = `${API_BASE_URL}/api/branches`;

const CreateCampaign = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
    status: 'Planned',
    branch: ''
  });

  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(BRANCH_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBranches(data.data.filter(b => b.isActive));
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount) || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Crowdfunding campaign launched successfully');
        navigate('/admin/crowdfunding');
      } else {
        toast.error(data.message || 'Failed to initiate campaign');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error creating campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl pb-10">
        <button
          onClick={() => navigate('/admin/crowdfunding')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Campaigns
        </button>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Megaphone size={26} className="text-green-700" />
            Initiate Crowdfunding Drive
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Define a target goal, expiration dates, and launch a social crowdfunding drive</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-3xl p-6 md:p-8 space-y-6"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Village Solar Electrification Fund"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Description & Target Objectives *</label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Outline objectives, why funding is needed, budget distributions..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Target Fund Amount (INR) *</label>
              <input
                type="number"
                name="targetAmount"
                required
                min="1"
                placeholder="e.g. 250000"
                value={formData.targetAmount}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Designated Branch office</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
              >
                <option value="">Global/Central Operations</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date *</label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">End Date / Deadline *</label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Launch status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/crowdfunding')}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-green-700 hover:opacity-90 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Launch Campaign
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateCampaign;

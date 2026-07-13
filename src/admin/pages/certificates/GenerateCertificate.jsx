import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Loader2, User } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/certificates`;

const GenerateCertificate = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [recipientSource, setRecipientSource] = useState('Manual'); // 'Manual', 'Member', 'Volunteer'
  const [membersList, setMembersList] = useState([]);
  const [volunteersList, setVolunteersList] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    role: 'Member',
    type: 'Appreciation',
    title: 'Certificate of Appreciation',
    description: 'For outstanding commitment and dedicated support to Advmen NGO projects.',
    signatoryName: 'Branch Executive Committee',
    signatoryTitle: 'Authorized Representative'
  });

  const fetchDirectory = useCallback(async (source) => {
    if (!token || source === 'Manual') return;
    setLoadingDirectory(true);
    try {
      let url = '';
      if (source === 'Member') url = `${API_BASE_URL}/api/superadmin/members`; // admin can query members list
      else if (source === 'Volunteer') url = `${API_BASE_URL}/api/superadmin/volunteers`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (source === 'Member') setMembersList(data.data);
        else setVolunteersList(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load directory details');
    } finally {
      setLoadingDirectory(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchDirectory(recipientSource);
  }, [recipientSource, fetchDirectory]);

  const handleSourceSelect = (e) => {
    const source = e.target.value;
    setRecipientSource(source);
    if (source === 'Member') {
      setFormData(prev => ({ ...prev, role: 'Member', recipientName: '', recipientEmail: '' }));
    } else if (source === 'Volunteer') {
      setFormData(prev => ({ ...prev, role: 'Volunteer', recipientName: '', recipientEmail: '' }));
    } else {
      setFormData(prev => ({ ...prev, role: 'Other', recipientName: '', recipientEmail: '' }));
    }
  };

  const handleEntitySelect = (e) => {
    const list = recipientSource === 'Member' ? membersList : volunteersList;
    const found = list.find(x => x._id === e.target.value);
    if (found) {
      setFormData(prev => ({
        ...prev,
        recipientName: found.name,
        recipientEmail: found.email
      }));
    }
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
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Certificate generated successfully');
        navigate('/admin/certificates');
      } else {
        toast.error(data.message || 'Failed to issue certificate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error creating certificate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl pb-10">
        <button
          onClick={() => navigate('/admin/certificates')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Certificate Log
        </button>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Award size={26} className="text-green-700" />
            Issue New Certificate
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Generate verified, QR-authenticated certificates for branch helpers</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-3xl p-6 md:p-8 space-y-6"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select Recipient Source</label>
              <select
                value={recipientSource}
                onChange={handleSourceSelect}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
              >
                <option value="Manual">Manual Entry (Custom Recipient)</option>
                <option value="Member">From Active Members Directory</option>
                <option value="Volunteer">From Active Volunteers Directory</option>
              </select>
            </div>

            {recipientSource !== 'Manual' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Select {recipientSource} Target
                </label>
                {loadingDirectory ? (
                  <div className="flex items-center py-3 text-xs text-gray-400 gap-2">
                    <Loader2 className="animate-spin text-green-700" size={14} /> Loading list...
                  </div>
                ) : (
                  <select
                    onChange={handleEntitySelect}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
                  >
                    <option value="">-- Choose Recipient --</option>
                    {(recipientSource === 'Member' ? membersList : volunteersList).map(x => (
                      <option key={x._id} value={x._id}>{x.name} ({x.email})</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Recipient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jane Doe"
                value={formData.recipientName}
                onChange={(e) => setFormData(p => ({ ...p, recipientName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Recipient Email *</label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={formData.recipientEmail}
                onChange={(e) => setFormData(p => ({ ...p, recipientEmail: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Recipient Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
              >
                <option value="Member">Member</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Donor">Donor</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Certificate Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
              >
                <option value="Appreciation">Appreciation</option>
                <option value="Membership">Membership</option>
                <option value="Volunteering">Volunteering</option>
                <option value="Donation">Donation</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Certificate Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Certificate of Achievement"
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Certificate body text *</label>
            <textarea
              required
              rows={4}
              placeholder="For incredible contributions towards..."
              value={formData.description}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Signatory Name</label>
              <input
                type="text"
                value={formData.signatoryName}
                onChange={(e) => setFormData(p => ({ ...p, signatoryName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Signatory Title</label>
              <input
                type="text"
                value={formData.signatoryTitle}
                onChange={(e) => setFormData(p => ({ ...p, signatoryTitle: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/certificates')}
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
              Publish Certificate
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default GenerateCertificate;

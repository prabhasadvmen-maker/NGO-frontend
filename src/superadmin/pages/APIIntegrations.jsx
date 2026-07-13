import React, { useState, useEffect } from 'react';
import { Plug, Key, Rss, Settings as SettingsIcon, Plus, Copy, Check, Eye, EyeOff, Trash2, Settings, Loader2, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const SYSTEM_API = `${API_BASE_URL}/api/superadmin/system`;

const APIIntegrations = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('keys'); // keys, webhooks, credentials
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // API Keys List
  const [apiKeys, setApiKeys] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // New Key Form Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({ name: '', scopes: ['read'] });
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);

  // Configurations
  const [configForm, setConfigForm] = useState({
    webhookUrl: '',
    webhookEvents: [],
    r2AccessKey: '',
    r2SecretKey: '',
    twilioSid: '',
    twilioToken: ''
  });

  const fetchKeysAndConfigs = async () => {
    try {
      setLoading(true);
      // Keys
      const keysRes = await fetch(`${SYSTEM_API}/api-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const keysData = await keysRes.json();
      if (keysData.success) {
        setApiKeys(keysData.apiKeys || []);
      }

      // Configurations
      const configRes = await fetch(`${SYSTEM_API}/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const configData = await configRes.json();
      if (configData.success && configData.config) {
        setConfigForm({
          webhookUrl: configData.config.webhookUrl || '',
          webhookEvents: configData.config.webhookEvents || [],
          r2AccessKey: configData.config.r2AccessKey || '',
          r2SecretKey: configData.config.r2SecretKey || '',
          twilioSid: configData.config.twilioSid || '',
          twilioToken: configData.config.twilioToken || ''
        });
      }
    } catch (err) {
      toast.error('Network error loading integrations catalogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeysAndConfigs();
  }, []);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyForm.name.trim()) return toast.error('Please enter client integration name');
    try {
      setSubmitting(true);
      const res = await fetch(`${SYSTEM_API}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newKeyForm)
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedKey(data.rawKey);
        fetchKeysAndConfigs();
        toast.success('API Key generated successfully');
      } else {
        toast.error(data.message || 'Generation failed');
      }
    } catch (err) {
      toast.error('Network error generating API key');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This client will be immediately blocked.')) return;
    try {
      const res = await fetch(`${SYSTEM_API}/api-keys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('API Access Key revoked');
        fetchKeysAndConfigs();
      } else {
        toast.error(data.message || 'Failed to revoke key');
      }
    } catch (err) {
      toast.error('Network error revoking key');
    }
  };

  const handleSaveConfigs = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch(`${SYSTEM_API}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(configForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Integrations configurations updated');
        fetchKeysAndConfigs();
      } else {
        toast.error(data.message || 'Save failed');
      }
    } catch (err) {
      toast.error('Network error saving configurations');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('API Key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleEventTrigger = (event) => {
    setConfigForm(prev => {
      const exists = prev.webhookEvents.includes(event);
      const nextEvents = exists
        ? prev.webhookEvents.filter(e => e !== event)
        : [...prev.webhookEvents, event];
      return { ...prev, webhookEvents: nextEvents };
    });
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10" onClick={() => setOpenMenuId(null)}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Plug className="text-[#1B5E20]" size={28} />
              API & Service Integrations
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">
              Configure Webhooks dispatches, generate client API tokens, and sync third-party storage or SMS gateway credentials
            </p>
          </div>

          {activeTab === 'keys' && (
            <button
              onClick={() => {
                setGeneratedKey('');
                setNewKeyForm({ name: '', scopes: ['read'] });
                setIsKeyModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0 w-fit self-end"
            >
              <Plus size={16} /> Generate API Key
            </button>
          )}
        </div>

        {/* Sub-tab navigation */}
        <div className="flex border-b border-gray-200 gap-6">
          {[
            { id: 'keys', label: 'Client API Keys', icon: Key },
            { id: 'webhooks', label: 'Webhooks Endpoint', icon: Rss },
            { id: 'credentials', label: 'Cloud Credentials', icon: SettingsIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-0 ${
                  activeTab === tab.id
                    ? 'border-[#1B5E20] text-[#1B5E20]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs text-gray-400 font-bold">Retrieving service configurations...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab: API Keys List */}
            {activeTab === 'keys' && (
              apiKeys.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl py-20 text-center text-gray-400 font-semibold shadow-sm">
                  No active external integrations. Generate an API key to connect third-party clients.
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[40vh]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase text-left w-16">S.R.</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Client Name</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Token Prefix</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Scopes</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Status</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Date Generated</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase text-right pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map((key, idx) => (
                          <tr key={key._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            <td className="px-4 py-4 font-bold text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-4 font-bold text-gray-800">{key.name}</td>
                            <td className="px-4 py-4 font-mono text-xs font-bold text-gray-500">{key.keyPrefix}...</td>
                            <td className="px-4 py-4">
                              <span className="flex flex-wrap gap-1">
                                {key.scopes.map(s => (
                                  <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold uppercase">{s}</span>
                                ))}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                key.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                              }`}>{key.status}</span>
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-400 font-semibold">{new Date(key.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-4 text-right pr-6">
                              {key.status === 'Active' ? (
                                <div className="relative inline-block text-left">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === key._id ? null : key._id); }}
                                    className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                                  >
                                    <Settings size={14} className="text-gray-500" />
                                  </button>
                                  {openMenuId === key._id && (
                                    <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-32 py-1" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => { handleRevokeKey(key._id); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-0"
                                      >
                                        <EyeOff size={13} /> Revoke Key
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-300 font-bold uppercase">Disabled</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {/* Tab: Webhooks settings */}
            {activeTab === 'webhooks' && (
              <form onSubmit={handleSaveConfigs} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left max-w-2xl">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-gray-800">Webhook Dispatch Endpoint</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Automatically trigger external POST dispatches whenever selected database transactions occur.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Payload Destination URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://api.yourdomain.com/webhooks"
                      value={configForm.webhookUrl}
                      onChange={(e) => setConfigForm(p => ({ ...p, webhookUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 text-gray-700 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Select Event Triggers</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        { id: 'member.created', label: 'Member Approved' },
                        { id: 'donation.received', label: 'Donation Received' },
                        { id: 'volunteer.applied', label: 'Volunteer Application Received' },
                        { id: 'expense.logged', label: 'New Expense Registered' }
                      ].map(ev => {
                        const active = configForm.webhookEvents.includes(ev.id);
                        return (
                          <div
                            key={ev.id}
                            onClick={() => toggleEventTrigger(ev.id)}
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                              active ? 'bg-green-50/50 border-green-300 text-green-800' : 'bg-gray-50/30 border-gray-150 text-gray-650'
                            }`}
                          >
                            <span className="text-xs font-bold font-mono">{ev.id}</span>
                            <span className="text-[10px] font-bold text-gray-400">{active ? 'ON' : 'OFF'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-3 rounded-xl bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 border-0 cursor-pointer shadow-sm transition-all"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    Save Webhook Settings
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Credentials Cloud Configuration */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleSaveConfigs} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left max-w-2xl">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-gray-800">Cloud Service Credentials</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Configure the access credentials utilized by file uploads and SMS notification templates modules.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Cloudflare R2 */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 border-b border-gray-100 pb-1.5 uppercase tracking-wider">Cloudflare R2 Bucket Store</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">R2 Access Key Id</label>
                        <input
                          type="text"
                          placeholder="e.g. c3d92bf..."
                          value={configForm.r2AccessKey}
                          onChange={(e) => setConfigForm(p => ({ ...p, r2AccessKey: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 text-gray-700 font-semibold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">R2 Secret Access Key</label>
                        <input
                          type="password"
                          placeholder="Enter secret parameter..."
                          value={configForm.r2SecretKey}
                          onChange={(e) => setConfigForm(p => ({ ...p, r2SecretKey: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 text-gray-700 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Twilio SMS API */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-gray-700 border-b border-gray-100 pb-1.5 uppercase tracking-wider">Twilio SMS Gateway</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Twilio Account SID</label>
                        <input
                          type="text"
                          placeholder="e.g. AC69d0bf..."
                          value={configForm.twilioSid}
                          onChange={(e) => setConfigForm(p => ({ ...p, twilioSid: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 text-gray-700 font-semibold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Twilio Auth Token</label>
                        <input
                          type="password"
                          placeholder="Enter auth token..."
                          value={configForm.twilioToken}
                          onChange={(e) => setConfigForm(p => ({ ...p, twilioToken: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 text-gray-700 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-3 rounded-xl bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 border-0 cursor-pointer shadow-sm transition-all"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    Save Service Configurations
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* MODAL: GENERATE API KEY */}
        {isKeyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
            <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-800">Generate Client Access Token</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-bold">Authorise external applications to fetch database views</p>
                </div>
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent"
                >
                  <Copy size={16} className="text-gray-400 hidden" />
                  <span className="text-xs text-gray-500 font-bold">✕</span>
                </button>
              </div>

              {!generatedKey ? (
                <form onSubmit={handleGenerateKey} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Integration / Client Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Website Donation Form widget"
                      value={newKeyForm.name}
                      onChange={(e) => setNewKeyForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 text-gray-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Scopes Selection</label>
                    <div className="flex gap-4">
                      {['read', 'write'].map(sc => (
                        <label key={sc} className="flex items-center gap-2 text-xs font-bold text-gray-600 capitalize cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newKeyForm.scopes.includes(sc)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setNewKeyForm(prev => {
                                const next = checked ? [...prev.scopes, sc] : prev.scopes.filter(x => x !== sc);
                                return { ...prev, scopes: next };
                              });
                            }}
                            className="rounded text-green-600 focus:ring-green-500"
                          />
                          {sc} access
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsKeyModalOpen(false)}
                      className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-xs text-gray-600 cursor-pointer bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs rounded-xl border-0 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 size={12} className="animate-spin" />}
                      Generate Key
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-green-50 border border-green-150 rounded-2xl flex items-start gap-2">
                    <Check className="text-green-600 shrink-0 mt-0.5" size={16} />
                    <span className="text-[10px] text-green-800 leading-normal font-bold">
                      Key generated successfully! Save it now. For security purposes, it will <strong>not</strong> be shown again.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Access Token Code</span>
                    <div className="flex items-center gap-2 p-3 bg-gray-900 rounded-2xl border border-gray-800 font-mono text-xs text-green-400 select-all">
                      <span className="flex-1 truncate select-all">{generatedKey}</span>
                      <button
                        onClick={() => copyToClipboard(generatedKey)}
                        className="p-1.5 rounded hover:bg-gray-800 border-0 bg-transparent text-green-400 cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsKeyModalOpen(false)}
                      className="w-full py-3 bg-gray-800 text-white font-bold text-xs rounded-xl border-0 cursor-pointer text-center"
                    >
                      I have saved this key
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default APIIntegrations;

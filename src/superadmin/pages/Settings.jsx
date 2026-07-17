import React, { useState } from 'react';
import { Settings as SettingsIcon, Lock, Bell, Upload, Eye, EyeOff, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useToast } from '../../shared/ToastContext';

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-700 outline-none border border-gray-250 focus:border-green-500 bg-gray-50/50 transition-colors font-semibold"
    />
  </div>
);

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="text-left">
      <p className="text-xs font-bold text-gray-750">{label}</p>
      {desc && <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={onChange}
      type="button"
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 border-0 cursor-pointer ${
        checked ? 'bg-[#1B5E20]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'transform translate-x-4.5' : ''
        }`}
      />
    </button>
  </div>
);

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [general, setGeneral] = useState({ appName: 'SAVITRAM FOUNDATION Management System', contactEmail: 'admin@savitram.org' });
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    donationAlerts: true,
    volunteerAlerts: true
  });

  const save = async (msg) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success(msg);
    setLoading(false);
  };

  const handleSecuritySave = async () => {
    if (!security.currentPassword) return toast.error('Enter current password');
    if (security.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (security.newPassword !== security.confirmPassword) return toast.error('Passwords do not match');
    await save('Password changed successfully!');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const tabs = [
    { id: 'general',       label: 'General Config',       icon: SettingsIcon },
    { id: 'security',      label: 'Security Access',      icon: Lock },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <SettingsIcon className="text-[#1B5E20]" size={28} />
            System Configurations
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1">
            Manage system-wide parameters, security accesses, credentials logs, and notification targets preferences
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 gap-6">
          {tabs.map((tab) => {
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

        {/* Content Panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left max-w-2xl min-h-[45vh] flex flex-col justify-between">
          <div className="space-y-6">
            {activeTab === 'general' && (
              <>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-gray-800">General Parameters</h3>
                  <p className="text-[10px] text-gray-450 font-bold">Configure application metadata headers and contact mail channels</p>
                </div>
                <div className="space-y-4">
                  <InputField
                    label="Application Name"
                    type="text"
                    value={general.appName}
                    onChange={e => setGeneral(p => ({ ...p, appName: e.target.value }))}
                  />
                  <InputField
                    label="Contact Email"
                    type="email"
                    value={general.contactEmail}
                    onChange={e => setGeneral(p => ({ ...p, contactEmail: e.target.value }))}
                  />
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">System Brand Logo</label>
                    <label
                      htmlFor="logo-upload"
                      className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-2xl border-2 border-dashed border-gray-250 cursor-pointer hover:bg-gray-50/50 hover:border-green-500 transition-colors bg-gray-50/30"
                    >
                      <Upload size={22} className="text-gray-400" />
                      <span className="text-xs text-gray-400 font-bold">Drag and drop file here or click to select</span>
                      <input id="logo-upload" type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-gray-800">Security Credentials</h3>
                  <p className="text-[10px] text-gray-450 font-bold">Update credentials to block unauthorised login access</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'currentPassword', label: 'Current Password', pwdKey: 'current' },
                    { key: 'newPassword',     label: 'New Password',     pwdKey: 'new' },
                    { key: 'confirmPassword', label: 'Confirm New Password', pwdKey: 'confirm' },
                  ].map(({ key, label, pwdKey }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
                      <div className="relative">
                        <input
                          type={showPwd[pwdKey] ? 'text' : 'password'}
                          value={security[key]}
                          onChange={e => setSecurity(p => ({ ...p, [key]: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm text-gray-700 outline-none border border-gray-250 focus:border-green-500 bg-gray-50/50 transition-colors font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(p => ({ ...p, [pwdKey]: !p[pwdKey] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer"
                        >
                          {showPwd[pwdKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-gray-800">Notification Preferences</h3>
                  <p className="text-[10px] text-gray-450 font-bold">Select system events and channels to dispatch alerts logs</p>
                </div>
                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/20">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive system alerts digests via email address' },
                    { key: 'smsNotifications',   label: 'SMS Notifications',   desc: 'Receive mobile text alerts on event dispatches' },
                    { key: 'donationAlerts',     label: 'Donation Received Alerts', desc: 'Notify branch heads on crowdfunding donation entries' },
                    { key: 'volunteerAlerts',    label: 'Volunteer Registrations Alerts', desc: 'Notify admins on volunteer signup applications' },
                  ].map(({ key, label, desc }) => (
                    <Toggle
                      key={key}
                      label={label}
                      desc={desc}
                      checked={notifications[key]}
                      onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-gray-150">
            {activeTab === 'general' && (
              <button
                onClick={() => save('General settings saved!')}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 border-0 cursor-pointer shadow-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Save General Settings
              </button>
            )}
            {activeTab === 'security' && (
              <button
                onClick={handleSecuritySave}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 border-0 cursor-pointer shadow-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Update Access Password
              </button>
            )}
            {activeTab === 'notifications' && (
              <button
                onClick={() => save('Notification preferences saved!')}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 border-0 cursor-pointer shadow-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Save Alert Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

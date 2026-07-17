import React, { useState } from 'react';
import { Settings as SettingsIcon, Lock, Bell, Upload, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/Layout';
import { useToast } from '../../shared/ToastContext';
import { COLORS } from '../../shared/colors';

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input {...props} className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 border border-gray-200 focus:border-green-500 outline-none bg-gray-50 transition-colors" />
  </div>
);

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button onClick={onChange} className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ backgroundColor: checked ? COLORS.primary : '#D1D5DB' }}>
      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
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
  const [notifications, setNotifications] = useState({ emailNotifications: true, smsNotifications: false, donationAlerts: true, volunteerAlerts: true });

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
    { id: 'general',       label: 'General',       icon: SettingsIcon },
    { id: 'security',      label: 'Security',      icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your preferences and account security</p>
        </div>

        <div className="flex gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: activeTab === id ? COLORS.primary : COLORS.light, color: activeTab === id ? '#fff' : '#6B7280', boxShadow: activeTab === id ? 'none' : '4px 4px 8px #D0D0D0, -4px -4px 8px #FFFFFF' }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-6 space-y-5"
          style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>

          {activeTab === 'general' && (
            <>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">General Settings</h3>
              <InputField label="Application Name" type="text" value={general.appName} onChange={e => setGeneral(p => ({ ...p, appName: e.target.value }))} />
              <InputField label="Contact Email" type="email" value={general.contactEmail} onChange={e => setGeneral(p => ({ ...p, contactEmail: e.target.value }))} />
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Logo Upload</label>
                <label htmlFor="logo-upload" className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.primary }}>
                  <Upload size={24} style={{ color: COLORS.primary }} />
                  <span className="text-sm text-gray-400 font-medium">Click to upload logo</span>
                  <input id="logo-upload" type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <button onClick={() => save('General settings saved!')} disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all"
                style={{ backgroundColor: COLORS.primary }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Change Password</h3>
              {[
                { key: 'currentPassword', label: 'Current Password', pwdKey: 'current' },
                { key: 'newPassword',     label: 'New Password',     pwdKey: 'new' },
                { key: 'confirmPassword', label: 'Confirm New Password', pwdKey: 'confirm' },
              ].map(({ key, label, pwdKey }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <div className="relative">
                    <input type={showPwd[pwdKey] ? 'text' : 'password'} value={security[key]}
                      onChange={e => setSecurity(p => ({ ...p, [key]: e.target.value }))} placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-gray-700 border border-gray-200 focus:border-green-500 outline-none bg-gray-50 transition-colors" />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, [pwdKey]: !p[pwdKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd[pwdKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleSecuritySave} disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all"
                style={{ backgroundColor: COLORS.primary }}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notification Preferences</h3>
              <div>
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'smsNotifications',   label: 'SMS Notifications',   desc: 'Receive updates via SMS' },
                  { key: 'donationAlerts',     label: 'Donation Alerts',     desc: 'Get notified on new donations' },
                  { key: 'volunteerAlerts',    label: 'Volunteer Alerts',    desc: 'Get notified on volunteer activity' },
                ].map(({ key, label, desc }) => (
                  <Toggle key={key} label={label} desc={desc} checked={notifications[key]}
                    onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} />
                ))}
              </div>
              <button onClick={() => save('Notification preferences saved!')} disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all"
                style={{ backgroundColor: COLORS.primary }}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

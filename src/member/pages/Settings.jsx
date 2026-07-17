import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon, ShieldAlert, Key, Bell, Loader2, Save,
  CheckCircle2, Lock, Eye, EyeOff
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS, SHADOWS } from '../../shared/colors';

const API_NOTIFS = `${API_BASE_URL}/api/member/activities/settings/notifications`;
const API_PASSWORD = `${API_BASE_URL}/api/member/activities/settings/change-password`;

const Settings = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [updatingNotifs, setUpdatingNotifs] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  // Notification states
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [eventNotif, setEventNotif] = useState(true);
  const [donationNotif, setDonationNotif] = useState(true);

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_NOTIFS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setEmailNotif(resData.data.email !== false);
        setSmsNotif(resData.data.sms !== false);
        setEventNotif(resData.data.events !== false);
        setDonationNotif(resData.data.donations !== false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdateNotifs = async (e) => {
    e.preventDefault();
    setUpdatingNotifs(true);
    try {
      const res = await fetch(API_NOTIFS, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailNotif,
          sms: smsNotif,
          events: eventNotif,
          donations: donationNotif
        })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Notification preferences updated successfully!');
      } else {
        toast.error(resData.message || 'Failed to update preferences');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error updating notification settings');
    } finally {
      setUpdatingNotifs(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setUpdatingPass(true);
    try {
      const res = await fetch(API_PASSWORD, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(resData.message || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error changing password');
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1 text-left">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <SettingsIcon className="text-[#1B5E20]" size={28} />
              Portal Settings
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Configure communication preferences and update login security settings
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
            <p className="text-sm font-semibold text-gray-500 font-bold">Loading settings panel...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Preferences Card */}
            <div
              className="rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: SHADOWS.neo
              }}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                  <Bell className="text-[#1B5E20]" size={20} />
                  Notification Settings
                </h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Choose how and when you want to receive alerts from SAVITRAM FOUNDATION:
                </p>

                <div className="space-y-4 pt-4">
                  {/* Email Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-150 cursor-pointer select-none">
                    <div>
                      <span className="block text-xs font-extrabold text-gray-800">Email Notifications</span>
                      <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Receive membership news via email</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={(e) => setEmailNotif(e.target.checked)}
                      className="accent-[#1B5E20] h-4 w-4 cursor-pointer"
                    />
                  </label>

                  {/* SMS Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-150 cursor-pointer select-none">
                    <div>
                      <span className="block text-xs font-extrabold text-gray-800">SMS Alerts</span>
                      <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Receive immediate OTPs and urgent reports</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsNotif}
                      onChange={(e) => setSmsNotif(e.target.checked)}
                      className="accent-[#1B5E20] h-4 w-4 cursor-pointer"
                    />
                  </label>

                  {/* Event Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-150 cursor-pointer select-none">
                    <div>
                      <span className="block text-xs font-extrabold text-gray-800">Event Notifications</span>
                      <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Receive updates on events registered</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={eventNotif}
                      onChange={(e) => setEventNotif(e.target.checked)}
                      className="accent-[#1B5E20] h-4 w-4 cursor-pointer"
                    />
                  </label>

                  {/* Donation Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-150 cursor-pointer select-none">
                    <div>
                      <span className="block text-xs font-extrabold text-gray-800">Donation Acknowledgements</span>
                      <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Receive receipt updates and certificates</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={donationNotif}
                      onChange={(e) => setDonationNotif(e.target.checked)}
                      className="accent-[#1B5E20] h-4 w-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleUpdateNotifs}
                disabled={updatingNotifs}
                className="w-full py-3 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl text-xs font-black cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5 mt-6 disabled:opacity-50"
              >
                {updatingNotifs ? (
                  <Loader2 className="animate-spin text-white" size={15} />
                ) : (
                  <Save size={14} />
                )}
                {updatingNotifs ? 'Saving Preferences...' : 'Save Notification Preferences'}
              </button>
            </div>

            {/* Change Password Card */}
            <div
              className="rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: SHADOWS.neo
              }}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                  <Lock className="text-[#1B5E20]" size={20} />
                  Change Password
                </h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Protect your account by setting a strong security password:
                </p>

                <form className="space-y-3 pt-4">
                  {/* Old Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Old Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showOldPass ? "text" : "password"}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter old password"
                        className="w-full rounded-xl border border-gray-250 bg-white/80 px-3 py-2.5 text-xs outline-none focus:border-green-700 transition-all font-semibold pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 outline-none"
                      >
                        {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full rounded-xl border border-gray-250 bg-white/80 px-3 py-2.5 text-xs outline-none focus:border-green-700 transition-all font-semibold pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 outline-none"
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border border-gray-250 bg-white/80 px-3 py-2.5 text-xs outline-none focus:border-green-700 transition-all font-semibold pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 outline-none"
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={updatingPass}
                className="w-full py-3 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl text-xs font-black cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5 mt-6 disabled:opacity-50"
              >
                {updatingPass ? (
                  <Loader2 className="animate-spin text-white" size={15} />
                ) : (
                  <Lock size={14} />
                )}
                {updatingPass ? 'Updating Password...' : 'Change Login Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellOff, CheckCheck, Loader2, Calendar, 
  Info, ShieldCheck, Mail, Heart, Award, FolderKanban
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS, SHADOWS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/member/activities/notifications`;

const Notifications = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setNotifications(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`${API_BASE}/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch(`${API_BASE}/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      } else {
        toast.error(resData.message || 'Failed to mark all as read');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error updating notifications');
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Membership':
        return <Award className="text-blue-500" size={18} />;
      case 'Donation':
        return <Heart className="text-red-500" size={18} />;
      case 'Event':
        return <Calendar className="text-amber-500" size={18} />;
      case 'Project':
        return <FolderKanban className="text-purple-500" size={18} />;
      case 'Referral':
        return <Info className="text-green-600" size={18} />;
      default:
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1 text-left">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Bell className="text-[#1B5E20]" size={28} />
              Notifications
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Stay updated with system announcements, events, and membership actions
            </p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="px-4 py-2 bg-white text-gray-700 hover:text-green-700 border border-gray-200 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="animate-spin text-green-700" size={14} />
              ) : (
                <CheckCheck size={14} className="text-green-700" />
              )}
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: SHADOWS.neo
          }}
        >
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500 font-bold">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-150 flex items-center justify-center text-gray-400 shadow-inner">
                <BellOff size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">All Clear!</p>
                <p className="text-xs text-gray-400 mt-1 font-semibold">You don't have any notifications at the moment</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  className={`p-4 md:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    n.isRead 
                      ? 'bg-white/40 border-gray-100/70 opacity-75' 
                      : 'bg-white border-[#1B5E20]/25 shadow-sm cursor-pointer hover:border-[#1B5E20]/50'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 bg-[#F5F5F5] border border-gray-100 ${
                    !n.isRead ? 'shadow-inner' : ''
                  }`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`text-xs md:text-sm tracking-tight ${
                        n.isRead ? 'font-bold text-gray-700' : 'font-extrabold text-gray-900'
                      }`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-black whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-gray-500 font-semibold leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, CheckCircle, Clock, AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../../shared/apiConfig';

export default function VolunteerTable({ volunteers, onEdit, onDelete, onApprove, onReject, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLastLoginStatus = (lastLogin) => {
    if (!lastLogin) return { text: 'Never logged in', color: 'text-slate-500', icon: AlertCircle };
    
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffMs = now - loginDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return { text: `${diffMins}m ago`, color: 'text-green-600', icon: LogIn };
    } else if (diffHours < 24) {
      return { text: `${diffHours}h ago`, color: 'text-green-600', icon: LogIn };
    } else if (diffDays < 7) {
      return { text: `${diffDays}d ago`, color: 'text-blue-600', icon: LogIn };
    } else {
      return { text: `${diffDays}d ago`, color: 'text-slate-500', icon: Clock };
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">#</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">Volunteer Profile</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">Contact</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">Branch</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">Availability / Skills</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">Last Login</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">Login Count</th>
            <th className="px-4 py-3 text-left font-black text-slate-900 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.length === 0 ? (
            <tr>
              <td colSpan="10" className="px-4 py-8 text-center text-slate-500 font-semibold">
                No volunteers found
              </td>
            </tr>
          ) : (
            volunteers.map((volunteer, index) => {
              const lastLoginStatus = getLastLoginStatus(volunteer.lastLogin);
              const LoginIcon = lastLoginStatus.icon;

              return (
                <tr key={volunteer._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{index + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{volunteer.volunteerId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {volunteer.photoUrl ? (
                        <img
                          src={volunteer.photoUrl}
                          alt={volunteer.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                          {volunteer.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{volunteer.fullName}</p>
                        <p className="text-slate-500">{volunteer.gender || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{volunteer.mobileNumber}</p>
                      <p className="text-slate-500">{volunteer.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{volunteer.branch?.name || 'N/A'}</p>
                      <p className="text-slate-500">Code: {volunteer.branch?.code || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{volunteer.availability}</p>
                      <p className="text-slate-500 line-clamp-2">
                        Skills: {volunteer.skills?.length > 0 ? volunteer.skills.join(', ') : 'None'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(volunteer.status)}`}>
                      {volunteer.status === 'Active' && <CheckCircle size={12} className="mr-1" />}
                      {volunteer.status === 'Pending' && <Clock size={12} className="mr-1" />}
                      {volunteer.status === 'Inactive' && <AlertCircle size={12} className="mr-1" />}
                      {volunteer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <LoginIcon size={14} className={lastLoginStatus.color} />
                      <span className={`font-semibold ${lastLoginStatus.color}`}>
                        {lastLoginStatus.text}
                      </span>
                    </div>
                    {volunteer.lastLogin && (
                      <p className="text-slate-500 text-[10px] mt-1">
                        {formatDate(volunteer.lastLogin)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <LogIn size={14} className="text-blue-600" />
                      <span className="font-bold text-slate-900">{volunteer.loginCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(volunteer)}
                        className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      {volunteer.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => onApprove(volunteer._id)}
                            className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => onReject(volunteer._id)}
                            className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                            title="Reject"
                          >
                            <AlertCircle size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDelete(volunteer._id)}
                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Database, Upload, Download, Trash2, Loader2, Settings, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const SYSTEM_API = `${API_BASE_URL}/api/superadmin/system`;

const Backup = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [backups, setBackups] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fileInputRef = useRef(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SYSTEM_API}/backup`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups || []);
      } else {
        toast.error(data.message || 'Failed to retrieve backup log catalog');
      }
    } catch (err) {
      toast.error('Network error retrieving backup history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`${SYSTEM_API}/backup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Database backup created successfully');
        fetchBackups();
      } else {
        toast.error(data.message || 'Failed to write backup file');
      }
    } catch (err) {
      toast.error('Network error starting backup process');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const res = await fetch(`${SYSTEM_API}/backup/${filename}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status !== 200) {
        throw new Error('Download failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Backup file downloaded');
    } catch (err) {
      toast.error('Failed to download archive');
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm('Are you sure you want to permanently delete this backup file?')) return;
    try {
      const res = await fetch(`${SYSTEM_API}/backup/${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Backup file deleted');
        fetchBackups();
      } else {
        toast.error(data.message || 'Failed to remove backup');
      }
    } catch (err) {
      toast.error('Network error deleting backup file');
    }
  };

  // Restore database
  const handleRestoreUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a valid JSON backup file.');
      return;
    }

    if (!window.confirm('WARNING: Restoring the database will overwrite current data. Do you wish to proceed?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setSubmitting(true);
        const backupData = JSON.parse(event.target.result);

        const res = await fetch(`${SYSTEM_API}/backup/restore`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ backupData })
        });
        const data = await res.json();
        if (data.success) {
          toast.success('System database restored successfully!');
          fetchBackups();
        } else {
          toast.error(data.message || 'Restore operation failed');
        }
      } catch (err) {
        toast.error('Invalid JSON structure inside backup archive');
      } finally {
        setSubmitting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10" onClick={() => setOpenMenuId(null)}>
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Database className="text-[#1B5E20]" size={28} />
            Backup & Restore Manager
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1">
            Download full database snapshots, generate schedule backups, or restore previous versions of database collections
          </p>
        </div>

        {/* Action Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Backup */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-1.5">
                <Database className="text-green-600" size={20} /> Create System Snapshot
              </h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Generates a JSON data snapshot including NGO profile settings, members, volunteers, donations register, events, and logs audits files.
              </p>
            </div>
            <button
              onClick={handleCreateBackup}
              disabled={submitting}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 border-0 cursor-pointer shadow-sm transition-all"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Database size={14} />}
              Generate Manual Backup
            </button>
          </div>

          {/* Restore Database */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-1.5">
                <Upload className="text-amber-600" size={20} /> Restore Database State
              </h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Select and upload a previously downloaded `.json` database file. This will wipe the corresponding tables and restore files.
              </p>
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={submitting}
                className="w-full md:w-auto px-5 py-3 rounded-2xl border border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={14} />}
                Upload JSON Backup File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="p-4 bg-red-50 border border-red-150 rounded-3xl flex items-start gap-2.5 text-left">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-bold text-red-800">Critical Warning: Data Overwrite</h4>
            <p className="text-[10px] text-red-750 font-semibold leading-relaxed mt-0.5">
              Performing a database restore is destructive. All current records will be deleted and replaced with the values stored inside the uploaded backup file. Ensure you perform a manual backup before restoring!
            </p>
          </div>
        </div>

        {/* Backups List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs text-gray-400 font-bold">Scanning backups directory...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 text-center text-gray-400 font-semibold shadow-sm">
            No backup files stored on system disk yet.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[30vh]">
            <h3 className="text-sm font-extrabold text-gray-800 mb-4 text-left flex items-center gap-1.5"><Info className="text-blue-500" size={18} /> Backup Logs Archive</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left w-16">S.R.</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">File Name</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">File Size</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Created Date</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((b, idx) => (
                    <tr key={b.filename} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      <td className="px-4 py-4 font-bold text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-4 font-bold text-gray-800 font-mono text-xs">{b.filename}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-500">{formatSize(b.size)}</td>
                      <td className="px-4 py-4 text-xs text-gray-400 font-semibold">{new Date(b.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="px-4 py-4 text-right pr-6">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === b.filename ? null : b.filename); }}
                            className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Settings size={14} className="text-gray-500" />
                          </button>
                          {openMenuId === b.filename && (
                            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-32 py-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => { handleDownload(b.filename); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                              >
                                <Download size={13} className="text-green-600" /> Download
                              </button>
                              <button
                                onClick={() => { handleDelete(b.filename); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-0"
                              >
                                <Trash2 size={13} /> Delete
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Backup;

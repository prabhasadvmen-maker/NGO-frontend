import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Search, Eye, Trash2, Loader2, Settings, X, Terminal, ShieldAlert } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const SYSTEM_API = `${API_BASE_URL}/api/superadmin/system`;

const AuditLogs = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View modal
  const [selectedLog, setSelectedLog] = useState(null);

  const modules = ['SYSTEM', 'ORGANIZATION', 'USERS', 'FINANCE', 'CONTENT', 'DOCUMENTS'];

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${SYSTEM_API}/audit-logs?page=${page}&limit=10&search=${search}&module=${selectedModule}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to fetch audit logs');
      }
    } catch (err) {
      toast.error('Network error loading logs');
    } finally {
      setLoading(false);
    }
  }, [token, page, search, selectedModule, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    try {
      const res = await fetch(`${SYSTEM_API}/audit-logs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Log entry removed');
        fetchLogs();
      } else {
        toast.error(data.message || 'Failed to delete log entry');
      }
    } catch (err) {
      toast.error('Network error deleting log');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10" onClick={() => setOpenMenuId(null)}>
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <ClipboardList className="text-[#1B5E20]" size={28} />
            System Audit Logs
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1">
            Real-time security auditing, data transactions, and administrator activity log records
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-sm">
          {/* Search */}
          <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50">
            <Search className="text-gray-400 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Search by action, email, or details..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent border-0 outline-none text-xs w-full font-semibold text-gray-700"
            />
          </div>

          {/* Module Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedModule}
              onChange={(e) => { setSelectedModule(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 text-xs font-bold text-gray-650 outline-none focus:border-green-500 cursor-pointer"
            >
              <option value="">All Modules</option>
              {modules.map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Datatable */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs text-gray-400 font-bold">Querying system log logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 text-center text-gray-400 font-semibold shadow-sm">
            No system audit log entries found matching criteria.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[40vh]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left w-16">S.R.</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">User / Role</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Action</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Module</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">IP Address</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-left">Timestamp</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={log._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      <td className="px-4 py-4 font-bold text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-gray-800 block">{log.userEmail}</span>
                        <span className="text-[10px] text-gray-400 block font-bold uppercase mt-0.5">{log.userRole.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-gray-700 block">{log.action}</span>
                        <span className="text-[10px] text-gray-400 block truncate max-w-xs font-semibold mt-0.5">{log.details}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border bg-gray-50 border-gray-200 text-gray-650">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono font-bold text-gray-500">{log.ipAddress}</td>
                      <td className="px-4 py-4 text-xs text-gray-400 font-semibold">{new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="px-4 py-4 text-right pr-6">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === log._id ? null : log._id); }}
                            className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Settings size={14} className="text-gray-500" />
                          </button>
                          {openMenuId === log._id && (
                            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-32 py-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => { setSelectedLog(log); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0"
                              >
                                <Eye size={13} className="text-blue-500" /> Inspect
                              </button>
                              <button
                                onClick={() => { handleDeleteLog(log._id); setOpenMenuId(null); }}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-400 font-bold">Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOG DETAILS MODAL */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
            <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-1.5">
                    <Terminal className="text-[#1B5E20]" size={20} /> Audit Payload Inspector
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-bold">System meta parameters transaction records</p>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Operator Email</span>
                  <span className="font-bold text-gray-700 text-xs mt-0.5 block">{selectedLog.userEmail}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Operator Role</span>
                  <span className="font-bold text-gray-700 text-xs mt-0.5 block uppercase">{selectedLog.userRole.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">System Module</span>
                  <span className="font-bold text-gray-700 text-xs mt-0.5 block">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">IP & Client</span>
                  <span className="font-bold text-gray-700 text-xs mt-0.5 block truncate" title={selectedLog.userAgent}>{selectedLog.ipAddress} ({selectedLog.userAgent.substring(0, 15)}...)</span>
                </div>
              </div>

              <div className="text-left space-y-1">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Description / Details</span>
                <p className="text-xs font-semibold text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 p-3 rounded-xl">{selectedLog.details}</p>
              </div>

              <div className="text-left space-y-1">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Transaction Payload (JSON)</span>
                <pre className="text-[10px] font-mono bg-gray-900 text-green-400 p-4 rounded-2xl overflow-x-auto max-h-[30vh]">
                  {JSON.stringify(selectedLog.payload || { status: 'No explicit payload attributes saved for transaction' }, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer bg-white"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuditLogs;

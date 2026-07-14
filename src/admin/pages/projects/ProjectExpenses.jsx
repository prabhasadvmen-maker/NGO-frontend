import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  FolderKanban, DollarSign, Calendar, Plus, Trash2, Loader2, RefreshCw, Landmark, Save, FileText, FileSpreadsheet,
  Settings, Eye, Pencil, Printer, X
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import { COLORS } from '../../../shared/colors';
import API_BASE_URL from '../../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div className="w-full max-w-lg my-8 rounded-3xl p-6 md:p-8 bg-white border border-gray-100 shadow-2xl relative">
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-extrabold text-gray-800">{title}</h2>
    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
      <X size={18} className="text-gray-500" />
    </button>
  </div>
);

const ActionMenu = ({ expense, onView, onEdit, onPrint, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(p => !p)} 
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
        title="Actions"
      >
        <Settings size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button 
            onClick={() => { onView(expense); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          <button 
            onClick={() => { onEdit(expense); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Pencil size={14} className="text-green-600" /> Edit Invoice
          </button>
          <button 
            onClick={() => { onPrint(expense); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Printer size={14} className="text-indigo-500" /> Print Receipt
          </button>
          <div className="border-t border-gray-100" />
          <button 
            onClick={() => { onDelete(expense); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <Trash2 size={14} /> Delete Bill
          </button>
        </div>
      )}
    </div>
  );
};

const ProjectExpenses = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals state
  const [viewExpense, setViewExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    date: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  // Fetch projects list for dropdown selection
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${API}/admin/projects?limit=100`, { headers });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
        if (data.data.length > 0) {
          setSelectedProjectId(data.data[0]._id);
          setSelectedProject(data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading projects options');
    } finally {
      setLoadingProjects(false);
    }
  }, [headers, toast]);

  // Fetch expenses for selected project
  const fetchExpenses = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoadingExpenses(true);
    try {
      const res = await fetch(`${API}/admin/projects/${selectedProjectId}/expenses`, { headers });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading project expenses log');
    } finally {
      setLoadingExpenses(false);
    }
  }, [selectedProjectId, headers, toast]);

  useEffect(() => {
    if (token) fetchProjects();
  }, [token, fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchExpenses();
      const projObj = projects.find(p => p._id === selectedProjectId);
      if (projObj) setSelectedProject(projObj);
    } else {
      setSelectedProject(null);
      setExpenses([]);
    }
  }, [selectedProjectId, projects, fetchExpenses]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSubmitting(true);
    try {
      const bodyData = {
        ...form,
        amount: Number(form.amount) || 0
      };

      const res = await fetch(`${API}/admin/projects/${selectedProjectId}/expenses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Expense recorded and project totals updated');
        setForm({
          title: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          notes: ''
        });
        
        fetchExpenses();
        // Update local budget stats display
        setProjects(prev => prev.map(p => {
          if (p._id === selectedProjectId) {
            return {
              ...p,
              expenses: (p.expenses || 0) + Number(bodyData.amount)
            };
          }
          return p;
        }));
      } else {
        toast.error(data.message || 'Failed to submit expense receipt');
      }
    } catch {
      toast.error('Server error posting expense log');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (expense) => {
    setEditExpense(expense);
    setEditForm({
      title: expense.title || '',
      amount: expense.amount || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      paymentMethod: expense.paymentMethod || 'cash',
      notes: expense.notes || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...editForm,
        amount: Number(editForm.amount) || 0
      };

      const res = await fetch(`${API}/admin/projects/${selectedProjectId}/expenses/${editExpense._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Expense receipt updated successfully');
        setEditExpense(null);
        fetchExpenses();
        
        // Update display budget stats dynamically
        const amountDiff = Number(bodyData.amount) - Number(editExpense.amount);
        setProjects(prev => prev.map(p => {
          if (p._id === selectedProjectId) {
            return {
              ...p,
              expenses: Math.max((p.expenses || 0) + amountDiff, 0)
            };
          }
          return p;
        }));
      } else {
        toast.error(data.message || 'Failed to update expense');
      }
    } catch {
      toast.error('Server error updating expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      const res = await fetch(`${API}/admin/projects/${selectedProjectId}/expenses/${deleteExpense._id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Expense log removed successfully');
        setExpenses(prev => prev.filter(exp => exp._id !== deleteExpense._id));
        
        // Adjust display budget
        setProjects(prev => prev.map(p => {
          if (p._id === selectedProjectId) {
            return {
              ...p,
              expenses: Math.max((p.expenses || 0) - Number(deleteExpense.amount), 0)
            };
          }
          return p;
        }));
        setDeleteExpense(null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Server error deleting expense log');
    }
  };

  const handlePrintReceipt = (expense) => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) {
      toast.error('Popup blocker is active. Please allow popups to print receipt.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Receipt - ${expense.expenseId || ''}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; color: #333; line-height: 1.5; }
            .receipt-container { border: 2px dashed #000; padding: 20px; max-width: 450px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .ngo-name { font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase; }
            .ngo-sub { font-size: 11px; margin: 2px 0 0 0; color: #666; }
            .receipt-title { font-size: 14px; font-weight: bold; margin-top: 10px; text-decoration: underline; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 12px; }
            .notes { border-top: 1px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 11px; font-style: italic; }
            .footer { text-align: center; margin-top: 30px; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1 class="ngo-name">Advmen NGO</h1>
              <p class="ngo-sub">Aid welfare and community development directory</p>
              <div class="receipt-title">PAYMENT VOUCHER RECEIPT</div>
            </div>
            <div class="row"><strong>Voucher ID:</strong> <span>${expense.expenseId || 'N/A'}</span></div>
            <div class="row"><strong>Project:</strong> <span>${selectedProject?.title || 'General'}</span></div>
            <div class="row"><strong>Title:</strong> <span>${expense.title}</span></div>
            <div class="row"><strong>Date:</strong> <span>${new Date(expense.date).toLocaleDateString('en-IN')}</span></div>
            <div class="row"><strong>Payment Mode:</strong> <span style="text-transform: uppercase;">${expense.paymentMethod}</span></div>
            <div class="row" style="font-size: 14px; border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px;">
              <strong>TOTAL AMOUNT:</strong> <span><strong>Rs. ${expense.amount.toLocaleString('en-IN')}</strong></span>
            </div>
            ${expense.notes ? `<div class="notes"><strong>Description notes:</strong> ${expense.notes}</div>` : ''}
            <div class="footer">
              <p>Thank you for supporting community welfare.</p>
              <p>© ${new Date().getFullYear()} Advmen NGO. All rights reserved.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <DollarSign className="text-[#1B5E20]" size={28} />
              Project Expenditure Logs
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Audit financial bills and record payments mapped to specific social programs</p>
          </div>
          <button 
            onClick={fetchProjects}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Configurations selector panel */}
        <div 
          className="rounded-2xl p-5 bg-white"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loadingProjects ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-semibold py-2">
              <Loader2 className="animate-spin" size={16} /> Loading project rosters...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-gray-400 font-semibold text-center py-2">
              Please register a project first to manage expenditures.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-end gap-5">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-sans">Select Active Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 text-gray-700 font-bold cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.title} ({p.branch?.name || 'Local'})</option>
                  ))}
                </select>
              </div>
              
              {selectedProject && (
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto flex-shrink-0 text-sm font-semibold border-l pl-5 border-gray-150">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Allocated Budget</span>
                    <span className="text-green-700 text-base font-extrabold">{formatCurrency(selectedProject.budget)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Spent So Far</span>
                    <span className="text-red-600 text-base font-extrabold">{formatCurrency(selectedProject.expenses)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Split grid for registering bills and listing logs */}
        {selectedProject && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form column */}
            <div 
              className="rounded-3xl p-6 bg-white border border-gray-100 space-y-4 self-start lg:col-span-1"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b pb-3 mb-4 border-gray-100">
                <Plus size={16} className="text-[#1B5E20]" /> Log Expenditure Receipt
              </h2>
              
              <form onSubmit={handleAddExpense} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Expense Title *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Venue setup billing, rations purchase"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount (INR) *</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder="Enter bill value"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Billing Date *</label>
                  <input 
                    type="date" 
                    required
                    value={form.date}
                    onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-55 text-gray-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment Method *</label>
                  <select 
                    value={form.paymentMethod}
                    onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 outline-none focus:border-green-500 bg-gray-55 text-gray-600 font-semibold cursor-pointer"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Debit/Credit Card</option>
                    <option value="online">Online Wallet/UPI</option>
                    <option value="other">Other Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Remarks / Bill Notes</label>
                  <textarea 
                    rows={2} 
                    placeholder="Log invoice/voucher numbers or references..."
                    value={form.notes}
                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-1 cursor-pointer mt-4"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Submit Expense
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* List column */}
            <div 
              className="rounded-3xl overflow-hidden bg-white border border-gray-100 lg:col-span-2 flex flex-col"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <h2 className="text-sm font-bold text-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet size={16} className="text-[#1B5E20]" /> Mapped Expenditures
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-extrabold uppercase">
                  {expenses.length} entries
                </span>
              </h2>

              {loadingExpenses ? (
                <div className="flex flex-col items-center justify-center py-24 gap-2">
                  <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
                  <p className="text-sm font-semibold text-gray-400">Loading ledger sheet...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                  <FileText size={36} className="opacity-30" />
                  <p className="font-semibold text-sm">No expenses recorded for this project yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1 text-center">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50/50" style={{ borderColor: '#E5E5E5' }}>
                        {['Receipt Details', 'Amount', 'Date', 'Mode', 'Action'].map((h, i) => (
                          <th key={h} className={`px-5 py-3 font-bold text-gray-500 uppercase tracking-wider ${i === 4 ? 'text-center' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(exp => (
                        <tr key={exp._id} className="border-b last:border-0 hover:bg-gray-50/55 transition-colors" style={{ borderColor: '#F2F2F2' }}>
                          
                          {/* Receipt details */}
                          <td className="px-5 py-3.5 text-left">
                            <div>
                              <p className="font-bold text-gray-800 leading-tight">{exp.title}</p>
                              {exp.notes && <p className="text-[10px] text-gray-400 italic mt-0.5 line-clamp-1" title={exp.notes}>{exp.notes}</p>}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-3.5 text-red-600 font-bold text-left">{formatCurrency(exp.amount)}</td>

                          {/* Date */}
                          <td className="px-5 py-3.5 text-gray-500 font-semibold text-left">{formatDate(exp.date)}</td>

                          {/* Payment method */}
                          <td className="px-5 py-3.5 text-left">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase text-[9px] tracking-wider">
                              {exp.paymentMethod.replace('_', ' ')}
                            </span>
                          </td>

                          {/* Action gear dropdown */}
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex justify-center">
                              <ActionMenu 
                                expense={exp} 
                                onView={setViewExpense} 
                                onEdit={openEdit} 
                                onPrint={handlePrintReceipt}
                                onDelete={setDeleteExpense} 
                              />
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* VIEW EXPENSE DETAILS MODAL */}
      {viewExpense && (
        <Modal onClose={() => setViewExpense(null)}>
          <ModalHeader title="Expenditure Bill Details" onClose={() => setViewExpense(null)} />
          <div className="space-y-5 text-sm">
            <div className="pb-3 border-b">
              <h3 className="text-base font-extrabold text-gray-850 leading-tight">{viewExpense.title}</h3>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Voucher Code: <span className="text-indigo-650">{viewExpense.expenseId || 'N/A'}</span></p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Expense Value</p>
                <p className="text-red-600 font-bold text-base">{formatCurrency(viewExpense.amount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Billing Date</p>
                <p className="text-gray-700 font-semibold">{formatDate(viewExpense.date)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Payment Method</p>
                <p className="text-gray-700 font-bold uppercase text-xs">{viewExpense.paymentMethod.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Parent Project</p>
                <p className="text-gray-700 font-semibold">{selectedProject?.title}</p>
              </div>
            </div>

            {viewExpense.notes && (
              <div className="space-y-1.5 pt-3 border-t">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Voucher Description Notes</p>
                <p className="text-gray-600 text-xs leading-relaxed bg-gray-50 p-3 rounded-xl border font-medium">{viewExpense.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <button 
                onClick={() => handlePrintReceipt(viewExpense)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer size={14} /> Print Voucher Bill
              </button>
              <button 
                onClick={() => setViewExpense(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-150 hover:bg-gray-200 transition-colors"
              >
                Close details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT EXPENSE DETAILS MODAL */}
      {editExpense && (
        <Modal onClose={() => setEditExpense(null)}>
          <ModalHeader title="Edit Expenditure Bill" onClose={() => setEditExpense(null)} />
          <form onSubmit={handleEditSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Expense Title *</label>
              <input 
                type="text" 
                required 
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount (INR) *</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={editForm.amount}
                  onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Billing Date *</label>
                <input 
                  type="date" 
                  required
                  value={editForm.date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-55 text-gray-700 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment Method *</label>
              <select 
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 outline-none focus:border-green-500 bg-gray-55 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Debit/Credit Card</option>
                <option value="online">Online Wallet/UPI</option>
                <option value="other">Other Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Remarks / Bill Notes</label>
              <textarea 
                rows={2} 
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-semibold"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditExpense(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Saving bill...' : 'Save Bill Changes'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteExpense && (
        <Modal onClose={() => setDeleteExpense(null)}>
          <ModalHeader title="Delete Bill Record" onClose={() => setDeleteExpense(null)} />
          <div className="flex flex-col items-center gap-3 py-2 mb-6">
            <p className="text-center text-gray-600 text-sm">
              Are you sure you want to delete expenditure log <span className="font-bold text-gray-800">"{deleteExpense.title}"</span>?<br />
              <span className="text-red-500 font-bold text-xs">WARNING: This will permanently remove the billing log and adjust project cumulative expenses.</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteExpense(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
              Cancel
            </button>
            <button onClick={handleDeleteExpense} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer">
              Yes, Delete Bill
            </button>
          </div>
        </Modal>
      )}

    </Layout>
  );
};

export default ProjectExpenses;

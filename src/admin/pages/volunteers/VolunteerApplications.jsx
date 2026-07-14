import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, CheckCircle, XCircle, Search, Loader2, Eye, X, Landmark, Phone, Mail, MapPin, User, Calendar, FileText, Settings, Wrench
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import { COLORS } from '../../../shared/colors';
import API_BASE_URL from '../../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div className="w-full max-w-2xl my-8 rounded-3xl p-6 md:p-8 bg-white border border-gray-100 shadow-2xl relative">
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

const ActionMenu = ({ volunteer, onView, onApprove, onReject }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(p => !p)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Actions">
        <Settings size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button onClick={() => { onView(volunteer); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          <button onClick={() => { onApprove(volunteer._id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <CheckCircle size={14} className="text-green-500" /> Verify/Approve
          </button>
          <button onClick={() => { onReject(volunteer._id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <XCircle size={14} className="text-red-500" /> Reject
          </button>
        </div>
      )}
    </div>
  );
};

const VolunteerApplications = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [viewVolunteer, setViewVolunteer] = useState(null);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        status: 'Pending'
      });
      const res = await fetch(`${API}/admin/volunteers?${queryParams}`, { headers });
      const data = await res.json();
      if (data.success) {
        setVolunteers(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.message || 'Failed to fetch pending applications');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading pending applications');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, headers, toast]);

  useEffect(() => {
    if (token) fetchPending();
  }, [token, fetchPending]);

  const handleApprove = async (id) => {
    if (!window.confirm('Verify and approve this volunteer application?')) return;
    try {
      const res = await fetch(`${API}/admin/volunteers/${id}/approve-request`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Volunteer approved successfully');
        setVolunteers(prev => prev.filter(v => v._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Server error approving volunteer');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this volunteer application request?')) return;
    try {
      const res = await fetch(`${API}/admin/volunteers/${id}/reject-request`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Volunteer request rejected');
        setVolunteers(prev => prev.filter(v => v._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Server error rejecting volunteer');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-[#1B5E20]" size={28} />
            Volunteer Applications
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Audit and approve pending volunteer registrants for task assignment</p>
        </div>

        {/* Toolbar */}
        <div 
          className="rounded-2xl p-5 bg-white"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search pending by ID, Name, Mobile..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Table List */}
        <div 
          className="rounded-2xl overflow-hidden bg-white"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-400">Loading pending applications...</p>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <Users size={44} className="opacity-30" />
              <p className="font-semibold text-sm">No pending volunteer applications awaiting review</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'ID', 'Volunteer Profile', 'Contact', 'Branch', 'Availability / Skills', 'Status', 'Verification Action'].map(h => (
                      <th key={h} className={`px-3.5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 ${h === 'Verification Action' ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((volunteer, idx) => (
                    <tr key={volunteer._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      
                      {/* Sr. No */}
                      <td className="px-2.5 py-3 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>

                      {/* ID */}
                      <td className="px-3.5 py-3 font-bold text-gray-700">{volunteer.volunteerId || 'N/A'}</td>

                      {/* Profile & Name */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
                            {volunteer.photoUrl ? (
                              <img src={volunteer.photoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <User size={18} className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{volunteer.fullName}</p>
                            <p className="text-[10px] text-gray-500 font-semibold capitalize">{volunteer.gender || 'No spec'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3.5 py-3">
                        <div className="space-y-0.5">
                          <p className="text-gray-700 font-semibold text-xs flex items-center gap-1">
                            <Phone size={11} className="text-gray-500" /> {volunteer.mobileNumber}
                          </p>
                          <p className="text-gray-500 text-[11px] flex items-center gap-1 max-w-[150px] truncate" title={volunteer.email || ''}>
                            <Mail size={11} className="text-gray-400" /> {volunteer.email || 'No email'}
                          </p>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="px-3.5 py-3">
                        {volunteer.branch ? (
                          <div>
                            <p className="font-bold text-gray-700">{volunteer.branch.name}</p>
                            <p className="text-[10px] text-gray-500 font-semibold">Code: {volunteer.branch.code}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Unassigned</span>
                        )}
                      </td>

                      {/* Availability & Skills */}
                      <td className="px-3.5 py-3">
                        <div>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700 border border-green-100">
                            {volunteer.availability}
                          </span>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1 max-w-[150px] truncate" title={volunteer.skills?.join(', ') || ''}>
                            Skills: {volunteer.skills && volunteer.skills.length > 0 ? volunteer.skills.join(', ') : 'None listed'}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          {volunteer.status}
                        </span>
                      </td>

                      {/* Verification Action */}
                      <td className="px-3.5 py-3 text-center">
                        <div className="flex justify-center">
                          <ActionMenu 
                            volunteer={volunteer} 
                            onView={setViewVolunteer} 
                            onApprove={handleApprove} 
                            onReject={handleReject} 
                          />
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* VIEW VOLUNTEER DETAILS MODAL */}
      {viewVolunteer && (
        <Modal onClose={() => setViewVolunteer(null)}>
          <ModalHeader title="Volunteer Application Details" onClose={() => setViewVolunteer(null)} />
          
          <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 no-scrollbar">
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-100">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-amber-500 shadow flex-shrink-0">
                {viewVolunteer.photoUrl ? (
                  <img src={viewVolunteer.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User size={36} className="text-gray-400" />
                )}
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-xl font-extrabold text-gray-800">{viewVolunteer.fullName}</h3>
                <p className="text-sm text-gray-500 font-semibold flex items-center justify-center md:justify-start gap-1">
                  <Landmark size={14} /> ID: <span className="text-green-700 font-bold">{viewVolunteer.volunteerId || 'N/A'}</span>
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    Awaiting Verification
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    {viewVolunteer.availability} Availability
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              
              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Personal Details</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Gender</p>
                      <p className="text-gray-700 font-semibold">{viewVolunteer.gender || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Date of Birth</p>
                      <p className="text-gray-700 font-semibold">{formatDate(viewVolunteer.dateOfBirth)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wrench size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {viewVolunteer.skills && viewVolunteer.skills.length > 0 ? (
                          viewVolunteer.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 text-xs font-bold rounded bg-amber-50 text-amber-700 border border-amber-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-700 font-semibold">No special skills listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Contact & Address</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</p>
                      <p className="text-gray-700 font-semibold">{viewVolunteer.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                      <p className="text-gray-700 font-semibold break-all">{viewVolunteer.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Full Address</p>
                      <p className="text-gray-700 font-semibold text-xs leading-tight">
                        {viewVolunteer.address ? `${viewVolunteerAddress(viewVolunteer)}` : 'No address saved'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch & Joined Date */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">NGO Branch & Joined Date</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <Landmark size={16} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned Branch</p>
                        <p className="text-gray-700 font-semibold">{viewVolunteer.branch?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Application Date</p>
                        <p className="text-gray-700 font-semibold">{formatDate(viewVolunteer.joinedDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3 border-t pt-4">
            <button 
              onClick={() => handleReject(viewVolunteer._id)} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
            <button 
              onClick={() => handleApprove(viewVolunteer._id)} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: COLORS.primary }}
            >
              Verify & Approve
            </button>
          </div>
        </Modal>
      )}

    </Layout>
  );
};

const viewVolunteerAddress = (v) => {
  const parts = [];
  if (v.address) parts.push(v.address);
  if (v.city) parts.push(v.city);
  if (v.district) parts.push(v.district);
  if (v.state) parts.push(v.state);
  if (v.pinCode) parts.push(v.pinCode);
  return parts.join(', ');
};

export default VolunteerApplications;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contact, Search, Loader2, Printer, ShieldCheck } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const GenerateIDCard = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [roleType, setRoleType] = useState('Member');
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Customization
  const [cardTheme, setCardTheme] = useState('Standard');
  const [expiryYear, setExpiryYear] = useState('2028');

  const cardPrintRef = useRef(null);

  const fetchUsers = useCallback(async (role = roleType, searchQ = searchQuery) => {
    if (!token) return;
    setLoading(true);
    try {
      let endpoint = '';
      if (role === 'Member') endpoint = `${API_BASE_URL}/api/superadmin/members`;
      else if (role === 'Volunteer') endpoint = `${API_BASE_URL}/api/superadmin/volunteers`;

      const searchParam = searchQ ? `?search=${encodeURIComponent(searchQ)}` : '';
      const res = await fetch(`${endpoint}${searchParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // If the admin belongs to a branch, filter members/volunteers by that branch
        let filtered = data.data;
        if (user && user.branch) {
          const userBranchId = typeof user.branch === 'object' ? user.branch._id : user.branch;
          filtered = data.data.filter(u => {
            const uBranchId = u.branch && typeof u.branch === 'object' ? u.branch._id : u.branch;
            return uBranchId === userBranchId;
          });
        }
        setUsersList(filtered);
        if (filtered.length > 0) {
          setSelectedUser(filtered[0]);
        } else {
          setSelectedUser(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load branch directory');
    } finally {
      setLoading(false);
    }
  }, [token, roleType, searchQuery, user, toast]);

  useEffect(() => {
    fetchUsers(roleType, searchQuery);
  }, [roleType, searchQuery, fetchUsers]);

  const handlePrint = () => {
    if (!selectedUser) return;
    const printContent = cardPrintRef.current.innerHTML;
    const windowName = 'PrintIDCard' + Date.now();
    const printWindow = window.open('', windowName, 'width=700,height=500');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print ID Card</title>
          <style>
            body { margin: 0; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fff; display: flex; justify-content: center; gap: 40px; }
            .id-card-print {
              display: flex;
              gap: 30px;
            }
            .card-wrapper {
              width: 85.6mm;
              height: 54mm;
              border: 1px solid #ccc;
              border-radius: 8px;
              overflow: hidden;
              position: relative;
              background-color: #fff;
              color: #333;
              box-shadow: 0 4px 10px rgba(0,0,0,0.15);
              page-break-inside: avoid;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .card-header {
              height: 14mm;
              background-color: #1B5E20;
              color: #fff;
              display: flex;
              align-items: center;
              padding: 0 8px;
              justify-content: space-between;
            }
            .card-header-logo { font-size: 11px; font-weight: bold; letter-spacing: 1px; }
            .card-header-sub { font-size: 7px; opacity: 0.8; }
            .card-badge {
              font-size: 7px;
              background-color: rgba(255,255,255,0.25);
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .card-body {
              display: flex;
              padding: 6px;
              height: calc(54mm - 14mm);
              box-sizing: border-box;
              gap: 8px;
            }
            .profile-photo {
              width: 22mm;
              height: 28mm;
              border: 1.5px solid #1B5E20;
              border-radius: 4px;
              object-fit: cover;
              background-color: #f5f5f5;
            }
            .profile-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              font-size: 11px;
            }
            .info-name {
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
            }
            .info-id {
              font-size: 11px;
              font-weight: 800;
              color: #1B5E20;
              margin: 2px 0 6px 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 50px 1fr;
              row-gap: 2.5px;
              color: #334155;
            }
            .info-lbl { font-weight: 800; color: #475569; }
            .info-val { font-weight: 800; color: #0f172a; }
            
            /* Back side styles */
            .card-back-body {
              padding: 10px;
              height: 100%;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              font-size: 9.5px;
              font-weight: bold;
              color: #334155;
              line-height: 1.4;
            }
            .back-terms {
              margin: 0;
              padding-left: 12px;
            }
            .back-footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
            }
            .back-meta-title { font-weight: 850; color: #0f172a; }
            .back-qr { width: 34px; height: 34px; }
            
            /* Themes colors overrides */
            .theme-corporate .card-header { background-color: #0d47a1 !important; }
            .theme-corporate .profile-photo { border-color: #0d47a1 !important; }
            .theme-corporate .info-id { color: #0d47a1 !important; }
            .theme-life .card-header { background-color: #311b92 !important; }
            .theme-life .profile-photo { border-color: #311b92 !important; }
            .theme-life .info-id { color: #311b92 !important; }

            @media print {
              body { padding: 0; margin: 0; }
              .id-card-print { gap: 10mm; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="id-card-print">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getUserDetails = () => {
    if (!selectedUser) return null;
    let name = selectedUser.name;
    let email = selectedUser.email;
    let uniqueId = selectedUser.membershipId || selectedUser.volunteerId || selectedUser._id.substring(18).toUpperCase();
    let branchName = selectedUser.branch?.name || user?.branch?.name || 'Local Branch';
    let bloodGroup = selectedUser.bloodGroup || 'Not Specified';
    let phone = selectedUser.phone || 'N/A';
    let status = selectedUser.isActive || selectedUser.status === 'Approved' ? 'ACTIVE' : 'INACTIVE';
    let role = roleType.toUpperCase();
    
    return { name, email, uniqueId, branchName, bloodGroup, phone, status, role };
  };

  const getQRData = (details) => {
    if (!details) return '';
    return `${window.location.origin}/admin/id-cards/verify?id=${details.uniqueId}`;
  };

  const uDetails = getUserDetails();

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Contact size={28} className="text-[#1B5E20]" />
            Branch ID Card Portal
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Generate and print dual-sided ID cards for branch members and volunteers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div 
            className="bg-white rounded-3xl p-6 space-y-5 lg:col-span-1"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
          >
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Card Parameters</h3>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Directory Source</label>
              <select
                value={roleType}
                onChange={(e) => { setRoleType(e.target.value); setUsersList([]); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
              >
                <option value="Member">Branch Members</option>
                <option value="Volunteer">Branch Volunteers</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Filter Directory Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Select Target</label>
              <select
                value={selectedUser ? selectedUser._id : ''}
                onChange={(e) => {
                  const found = usersList.find(u => u._id === e.target.value);
                  if (found) setSelectedUser(found);
                }}
                disabled={usersList.length === 0}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold disabled:opacity-50"
              >
                {usersList.length === 0 ? (
                  <option value="">No branch members/volunteers found</option>
                ) : (
                  usersList.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Card Design Layout</label>
              <select
                value={cardTheme}
                onChange={(e) => setCardTheme(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
              >
                <option value="Standard">Standard Green (Classic)</option>
                <option value="Corporate">Ocean Blue (Corporate)</option>
                <option value="Life">Royal Purple (Premium)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Card Expiry Year</label>
              <input
                type="number"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                min="2026"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 font-bold"
              />
            </div>

            <button
              onClick={handlePrint}
              disabled={!selectedUser}
              className="w-full py-3 border-0 rounded-xl bg-green-700 hover:opacity-90 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              <Printer size={16} /> Print Dual-Side ID Card
            </button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-3xl min-h-[400px]">
            {loading ? (
              <Loader2 className="animate-spin text-green-700" size={36} />
            ) : !selectedUser ? (
              <div className="text-center text-gray-400 font-bold text-sm">Select an active user from your branch directory list to preview.</div>
            ) : (
              <div className="space-y-8 w-full max-w-md">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Branch ID Card Previews (Double-Sided)</h4>

                <div ref={cardPrintRef} className="flex flex-col gap-6 items-center justify-center">
                  
                  {/* FRONT */}
                  <div className={`card-wrapper select-none theme-${cardTheme.toLowerCase()}`} style={{
                    width: '324px',
                    height: '204px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}>
                    <div className="card-header" style={{
                      height: '52px',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <div className="card-header-logo" style={{ fontSize: '12px', fontWeight: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>ADVMEN NGO</div>
                        <div className="card-header-sub" style={{ fontSize: '8px', opacity: 0.8 }}>{uDetails.branchName}</div>
                      </div>
                      <span className="card-badge" style={{
                        fontSize: '8px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                      }}>{uDetails.role}</span>
                    </div>

                    <div className="card-body" style={{ display: 'flex', padding: '12px', boxSizing: 'border-box', gap: '12px' }}>
                      <img 
                        src={selectedUser.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uDetails.name)}`}
                        alt="Profile" 
                        className="profile-photo"
                        style={{
                          width: '84px',
                          height: '106px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          border: '2px solid #1B5E20',
                          backgroundColor: '#f8fafc',
                        }}
                      />
                      
                      <div className="profile-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '11px' }}>
                        <div>
                          <h3 className="info-name" style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{uDetails.name}</h3>
                          <p className="info-id" style={{ fontSize: '11px', fontWeight: '800', margin: '2px 0 6px 0' }}>ID: {uDetails.uniqueId}</p>
                        </div>

                        <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '50px 1fr', rowGap: '2.5px', color: '#334155' }}>
                          <span className="info-lbl" style={{ fontWeight: '800', color: '#475569' }}>Branch:</span>
                          <span className="info-val" style={{ fontWeight: '800', color: '#0f172a' }}>{uDetails.branchName}</span>

                          <span className="info-lbl" style={{ fontWeight: '800', color: '#475569' }}>Blood Grp:</span>
                          <span className="info-val" style={{ fontWeight: '800', color: '#0f172a' }}>{uDetails.bloodGroup}</span>

                          <span className="info-lbl" style={{ fontWeight: '800', color: '#475569' }}>Expiry:</span>
                          <span className="info-val" style={{ fontWeight: '800', color: '#0f172a' }}>31/12/{expiryYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className={`card-wrapper select-none theme-${cardTheme.toLowerCase()}`} style={{
                    width: '324px',
                    height: '204px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}>
                    <div className="card-back-body" style={{
                      padding: '12px',
                      height: '100%',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      fontSize: '9.5px',
                      fontWeight: 'bold',
                      color: '#334155',
                      lineHeight: '1.4'
                    }}>
                      <div className="space-y-1">
                        <p className="back-meta-title" style={{ fontWeight: '850', color: '#0f172a', margin: '0 0 4px 0' }}>Card Usage Guidelines:</p>
                        <ul className="back-terms" style={{ margin: 0, paddingLeft: '12px', spaceY: '1px' }}>
                          <li>This identity card is non-transferable and remains property of Advmen NGO.</li>
                          <li>In case of emergency, please call <strong>+91-99999-88888</strong>.</li>
                          <li>Report loss of this card immediately to administration.</li>
                        </ul>
                      </div>

                      <div className="back-footer" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '6px'
                      }}>
                        <div>
                          <p className="back-meta-title" style={{ fontWeight: '850', color: '#0f172a', margin: 0 }}>Advmen Central Board</p>
                          <p style={{ margin: '1px 0 0 0', color: '#475569', fontWeight: '800' }}>Delhi Head Office, India</p>
                          <p style={{ margin: '1px 0 0 0', fontWeight: '850', color: '#22c55e' }}>Status: {uDetails.status}</p>
                        </div>

                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(getQRData(uDetails))}`}
                          alt="QR validation"
                          className="back-qr"
                          style={{
                            width: '42px',
                            height: '42px',
                            border: '1px solid #e2e8f0',
                            padding: '1px',
                            backgroundColor: '#fff',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GenerateIDCard;

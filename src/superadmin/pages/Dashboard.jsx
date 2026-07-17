import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, IndianRupee, Heart, Activity, 
  UserCheck, ShieldAlert, FileText, Settings, Database, 
  Trash2, ArrowUpRight, ArrowDownRight, Clock 
} from 'lucide-react';
import Layout from '../components/Layout';
import StatsCard from '../../shared/components/StatsCard';
import { COLORS } from '../../shared/colors';
import { useAuth } from '../../shared/AuthContext';
import API_BASE_URL from '../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const getLast6Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'short' }));
  }
  return months;
};

// Interactive SVG Bar Chart for User Registrations
const InteractiveBarChart = ({ title, data, color }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 5); // Default min peak of 5 to scale beautifully

  const width = 500;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 50
    });
    setHoveredIdx(index);
  };

  return (
    <div className="relative rounded-2xl p-6 flex flex-col h-full bg-white transition-all duration-300 hover:shadow-lg border border-gray-100"
      style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">User Registrations (Last 6 Months)</p>
        </div>
        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Monthly</span>
      </div>

      <div className="relative flex-1 min-h-[220px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Y Axis Grid Lines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={i} className="opacity-40">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#E5E7EB" strokeWidth={1} strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="text-[10px] font-bold fill-gray-400">{val}</text>
              </g>
            );
          })}

          {/* Bar elements */}
          {data.map((item, idx) => {
            const barCount = data.length;
            const colWidth = chartWidth / barCount;
            const barWidth = Math.max(colWidth * 0.45, 12);
            const x = paddingLeft + idx * colWidth + (colWidth - barWidth) / 2;
            const barHeight = maxVal > 0 ? (item.value / maxVal) * chartHeight : 0;
            const y = paddingTop + chartHeight - barHeight;

            return (
              <g key={idx} className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, idx)}
                onMouseLeave={() => setHoveredIdx(null)}>
                {/* Hover Background Area */}
                <rect x={paddingLeft + idx * colWidth} y={paddingTop} width={colWidth} height={chartHeight} fill="transparent" />
                
                {/* Visual Bar with Gradient Fill */}
                <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx={4} ry={4}
                  fill={hoveredIdx === idx ? color : `${color}D6`} className="transition-all duration-300" />
                
                {/* Advanced Value Label on top of Bar when hovered or value > 0 */}
                {(hoveredIdx === idx || item.value > 0) && (
                  <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="text-[9px] font-extrabold" fill={color}>
                    {item.value}
                  </text>
                )}

                {/* X Axis Label */}
                <text x={x + barWidth / 2} y={height - 12} textAnchor="middle" className="text-[10px] font-bold fill-gray-400">{item.month}</text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div className="absolute bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md font-bold pointer-events-none z-10 transition-all duration-150 border border-gray-800"
            style={{ left: mousePos.x, top: mousePos.y }}>
            <div className="text-[9px] text-gray-400 font-semibold mb-0.5">{data[hoveredIdx].month}</div>
            <div>{data[hoveredIdx].value} registrations</div>
          </div>
        )}
      </div>
    </div>
  );
};

// SVG Double Bar Chart for Income (Donations) vs Expenses (Reports Data)
const InteractiveDoubleBarChart = ({ title, data }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const maxVal = Math.max(...data.map(d => Math.max(d.donations, d.expenses)), 1000);

  const width = 500;
  const height = 220;
  const paddingLeft = 55;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 60
    });
    setHoveredIdx(index);
  };

  const formatVal = (val) => {
    if (val >= 100000) return `₹${(val/100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val/1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="relative rounded-2xl p-6 flex flex-col h-full bg-white transition-all duration-300 hover:shadow-lg border border-gray-100"
      style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
              <span className="text-[10px] text-gray-500 font-bold">Donations</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F44336' }} />
              <span className="text-[10px] text-gray-500 font-bold">Expenses</span>
            </div>
          </div>
        </div>
        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-100">Live Trend</span>
      </div>

      <div className="relative flex-1 min-h-[220px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Y Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={i} className="opacity-40">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#E5E7EB" strokeWidth={1} strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="text-[10px] font-bold fill-gray-400">{formatVal(val)}</text>
              </g>
            );
          })}

          {/* Bar Groups */}
          {data.map((item, idx) => {
            const count = data.length;
            const colWidth = chartWidth / count;
            const groupWidth = colWidth * 0.7;
            const singleBarWidth = groupWidth / 2 - 2;

            const groupX = paddingLeft + idx * colWidth + (colWidth - groupWidth) / 2;
            
            const donHeight = maxVal > 0 ? (item.donations / maxVal) * chartHeight : 0;
            const donY = paddingTop + chartHeight - donHeight;

            const expHeight = maxVal > 0 ? (item.expenses / maxVal) * chartHeight : 0;
            const expY = paddingTop + chartHeight - expHeight;

            return (
              <g key={idx} className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, idx)}
                onMouseLeave={() => setHoveredIdx(null)}>
                
                {/* Donation Bar (Green) */}
                <rect x={groupX} y={donY} width={singleBarWidth} height={Math.max(donHeight, 2)} rx={2} ry={2}
                  fill={hoveredIdx === idx ? COLORS.primary : `${COLORS.primary}CC`} className="transition-all duration-300" />

                {/* Expense Bar (Red) */}
                <rect x={groupX + singleBarWidth + 4} y={expY} width={singleBarWidth} height={Math.max(expHeight, 2)} rx={2} ry={2}
                  fill={hoveredIdx === idx ? '#F44336' : '#F44336CC'} className="transition-all duration-300" />

                {/* Advanced Values Labels directly on chart during hover */}
                {hoveredIdx === idx && (
                  <>
                    <text x={groupX + singleBarWidth / 2} y={donY - 5} textAnchor="middle" className="text-[8px] font-bold fill-emerald-700">
                      {formatVal(item.donations)}
                    </text>
                    <text x={groupX + singleBarWidth * 1.5 + 4} y={expY - 5} textAnchor="middle" className="text-[8px] font-bold fill-rose-700">
                      {formatVal(item.expenses)}
                    </text>
                  </>
                )}

                {/* X Axis label */}
                <text x={groupX + groupWidth / 2} y={height - 12} textAnchor="middle" className="text-[10px] font-bold fill-gray-400">{item.label}</text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div className="absolute bg-gray-950 text-white text-xs px-3 py-2 rounded-xl shadow-lg font-bold pointer-events-none z-10 transition-all duration-150 border border-gray-800"
            style={{ left: mousePos.x, top: mousePos.y }}>
            <div className="text-[10px] text-gray-400 font-semibold mb-1">{data[hoveredIdx].label}</div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-4 text-emerald-400">
                <span>Income:</span>
                <span>{formatVal(data[hoveredIdx].donations)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-rose-400">
                <span>Expenses:</span>
                <span>{formatVal(data[hoveredIdx].expenses)}</span>
              </div>
              <div className="border-t border-gray-800 my-1" />
              <div className="flex items-center justify-between gap-4 text-white">
                <span>Net:</span>
                <span>{formatVal(data[hoveredIdx].donations - data[hoveredIdx].expenses)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [financialTrend, setFinancialTrend] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { 
    if (token) fetchAll(); 
  }, [token]);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, reportsRes, logsRes] = await Promise.all([
        fetch(`${API}/auth/dashboard/stats`, { headers }),
        fetch(`${API}/admins`, { headers }),
        fetch(`${API_BASE_URL}/api/reports/superadmin`, { headers }),
        fetch(`${API_BASE_URL}/api/superadmin/system/audit-logs?page=1&limit=6`, { headers })
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const reportsData = await reportsRes.json();
      const logsData = await logsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setRecentUsers(usersData.data.slice(0, 5));
      if (logsData.success && logsData.logs) setAuditLogs(logsData.logs);

      if (reportsData.success && reportsData.data && reportsData.data.monthlyTrend) {
        setFinancialTrend(reportsData.data.monthlyTrend);
      } else {
        // Fallback default trend
        setFinancialTrend([
          { label: 'Feb', donations: 12000, expenses: 8000 },
          { label: 'Mar', donations: 18000, expenses: 14000 },
          { label: 'Apr', donations: 15000, expenses: 12000 },
          { label: 'May', donations: 24000, expenses: 16000 },
          { label: 'Jun', donations: 30000, expenses: 22000 },
          { label: 'Jul', donations: 35000, expenses: 19000 }
        ]);
      }

      buildChartData(usersData.success ? usersData.data : []);
    } catch (err) {
      console.error('Super Admin Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildChartData = (users) => {
    const months = getLast6Months();
    const now = new Date();
    const userCounts = months.map((month, i) => {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const count = users.filter(u => {
        const d = new Date(u.createdAt);
        return d.getFullYear() === targetMonth.getFullYear() && d.getMonth() === targetMonth.getMonth();
      }).length;
      return { month, value: count };
    });
    setChartData({ userCounts });
  };

  const getFormattedDate = () =>
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const formatTime = (d) =>
    d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

  const months = getLast6Months();
  const emptyChart = months.map(m => ({ month: m, value: 0 }));

  // Helper for audit logs status styling and icons
  const getAuditLogMeta = (action, module) => {
    const actionUpper = (action || '').toUpperCase();
    if (actionUpper.includes('LOGIN') || actionUpper.includes('AUTH')) {
      return { icon: UserCheck, color: COLORS.primary, bg: `${COLORS.primary}12` };
    }
    if (actionUpper.includes('CREATE') || actionUpper.includes('ADD')) {
      return { icon: Building2, color: COLORS.info, bg: `${COLORS.info}12` };
    }
    if (actionUpper.includes('UPLOAD') || actionUpper.includes('ASSET')) {
      return { icon: FileText, color: '#9C27B0', bg: '#9C27B012' };
    }
    if (actionUpper.includes('DELETE') || actionUpper.includes('REMOVE')) {
      return { icon: Trash2, color: '#F44336', bg: '#F4433612' };
    }
    return { icon: Activity, color: '#607D8B', bg: '#607D8B12' };
  };

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }} />
        </div>
      ) : (
        <div className="space-y-8 pb-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Overview</h1>
              <p className="text-sm text-gray-400 font-semibold mt-1">{getFormattedDate()}</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-2 text-xs font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>System Live and Synchronized</span>
            </div>
          </div>

          {/* Core metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Building2} label="Total NGOs"        value={stats?.totalNGOs ?? 0}                                          color={COLORS.primary}   subtext="registered NGOs" />
            <StatsCard icon={Users}     label="Total Users"       value={stats?.totalUsers ?? 0}                                         color={COLORS.secondary} subtext="all system roles" />
            <StatsCard icon={IndianRupee} label="Total Donations"   value={stats?.totalDonations ? `₹${(stats.totalDonations/100000).toFixed(1)}L` : '₹0'} color={COLORS.accent} subtext="total collected" />
            <StatsCard icon={Heart}     label="Active Volunteers" value={stats?.activeVolunteers ?? 0}                                   color={COLORS.info}      subtext="currently active" />
          </div>

          {/* Graph Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveBarChart title="User Registrations" data={chartData?.userCounts ?? emptyChart} color={COLORS.primary} />
            <InteractiveDoubleBarChart title="Monthly Financial Trends (Income vs Expenses)" data={financialTrend} />
          </div>

          {/* Lower Grid (Recent Registrations & System Activity Logs) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* System Activity Logs Timeline */}
            <div className="rounded-2xl p-6 bg-white border border-gray-100 flex flex-col h-full"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-800">System Activity Feed</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Live System Audit Trail</p>
                </div>
                <Activity size={18} className="text-gray-400" />
              </div>

              {auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-16 text-gray-400">
                  <Database size={32} className="opacity-30 mb-2" />
                  <p className="text-sm font-medium">No activity logs recorded yet.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-gray-100 pl-6 ml-3 space-y-6 flex-1">
                  {auditLogs.map((log) => {
                    const meta = getAuditLogMeta(log.action, log.module);
                    const LogIcon = meta.icon;
                    return (
                      <div key={log._id} className="relative group">
                        {/* Timeline Icon Badge */}
                        <span className="absolute -left-[37px] top-0.5 rounded-full p-1.5 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                          style={{ backgroundColor: meta.bg, color: meta.color, border: `2px solid #FFF` }}>
                          <LogIcon size={12} />
                        </span>
                        
                        {/* Audit Details */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-xs font-bold text-gray-800 capitalize tracking-tight">{log.action.replace('_', ' ').toLowerCase()}</h4>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{log.details}</p>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase tracking-wider">{log.userRole.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{log.userEmail}</span>
                            <span>•</span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Registrations Table */}
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 flex flex-col h-full"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">Recent Registrations</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recently Added Administrators</p>
                </div>
                <Users size={18} className="text-gray-400" />
              </div>
              
              {recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-16 text-gray-400">
                  <Users size={32} className="opacity-30 mb-2" />
                  <p className="text-sm font-medium">No admin registrations yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        {['Admin Name', 'Role', 'Email', 'Joined Date', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map(u => (
                        <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors border-gray-50">
                          <td className="px-5 py-3.5 font-bold text-gray-800 text-xs">{u.name}</td>
                          <td className="px-5 py-3.5 text-xs text-gray-500 font-semibold capitalize">{u.role.replace('_', ' ')}</td>
                          <td className="px-5 py-3.5 text-xs text-gray-500 font-medium">{u.email}</td>
                          <td className="px-5 py-3.5 text-xs text-gray-400 font-semibold">{formatDate(u.createdAt)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${u.isActive ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-red-50 text-red-600 border border-red-150'}`}>
                              <span className={`w-1 h-1 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;

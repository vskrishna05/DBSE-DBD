import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Car, Calendar, DollarSign, Activity,
  CheckCircle, Building2, RefreshCw, BarChart2,
  Package, FileText, UserCheck, Wrench, Download, Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path
  const getTabFromPath = (path) => {
    if (path.includes('/admin/customers')) return 'customers';
    if (path.includes('/admin/mechanics')) return 'mechanics';
    if (path.includes('/admin/bookings')) return 'bookings';
    if (path.includes('/admin/inventory')) return 'inventory';
    if (path.includes('/admin/invoices')) return 'invoices';
    if (path.includes('/admin/centers')) return 'centers';
    return 'overview';
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab) => {
    switch (tab) {
      case 'customers': navigate('/admin/customers'); break;
      case 'mechanics': navigate('/admin/mechanics'); break;
      case 'bookings': navigate('/admin/bookings'); break;
      case 'inventory': navigate('/admin/inventory'); break;
      case 'invoices': navigate('/admin/invoices'); break;
      case 'centers': navigate('/admin/centers'); break;
      default: navigate('/admin'); break;
    }
  };

  const [analytics, setAnalytics] = useState(null);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Single Clean Demo Users
  const users = [
    { id: 1, username: 'admin', fullName: 'Administrator', email: 'admin@mechx.com', role: 'ADMIN', status: 'ACTIVE', phone: '+91 90000 00001' },
    { id: 2, username: 'manager', fullName: 'Service Manager', email: 'manager@mechx.com', role: 'SERVICE_CENTER_MANAGER', status: 'ACTIVE', phone: '+91 90000 00002' },
    { id: 3, username: 'mechanic', fullName: 'Lead Mechanic', email: 'mechanic@mechx.com', role: 'MECHANIC', status: 'ACTIVE', phone: '+91 90000 00003', specialization: 'General Servicing, Diagnostics, Engine Repair', skill: 'SENIOR', rating: 5.0, workload: 0 },
    { id: 4, username: 'customer', fullName: 'Customer Account', email: 'customer@mechx.com', role: 'CUSTOMER', status: 'ACTIVE', phone: '+91 90000 00004' },
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, centersRes, invRes, bookRes, invcRes] = await Promise.allSettled([
        api.get('/analytics/dashboard'),
        api.get('/service-centers'),
        api.get('/inventory/parts'),
        api.get('/bookings'),
        api.get('/invoices')
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data) {
        setAnalytics(dashRes.value.data);
      }

      if (centersRes.status === 'fulfilled' && Array.isArray(centersRes.value.data)) {
        setServiceCenters(centersRes.value.data);
      } else {
        setServiceCenters([
          {
            id: 1,
            name: 'MechX Prime Workshop',
            code: 'HUB-01',
            addressLine1: '100 Feet Road, Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560038',
            phoneNumber: '+91 80 2000 3000',
            operatingHours: '08:00 AM - 08:00 PM',
            totalBays: 8,
            activeMechanics: 1
          }
        ]);
      }

      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value.data)) {
        setInventory(invRes.value.data);
      }

      if (bookRes.status === 'fulfilled' && Array.isArray(bookRes.value.data)) {
        setBookings(bookRes.value.data);
      }

      if (invcRes.status === 'fulfilled' && Array.isArray(invcRes.value.data)) {
        setInvoices(invcRes.value.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load telemetry');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (partId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await api.put(`/inventory/parts/${partId}/stock`, null, {
        params: { newStockQuantity: newStock }
      });
      toast.success('Inventory stock adjusted');
      setInventory(inventory.map(p => p.id === partId ? { ...p, stockQuantity: newStock } : p));
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  const handleDownloadPdf = async (inv) => {
    try {
      toast.loading('Generating invoice PDF...', { id: 'pdf' });
      const res = await api.get(`/invoices/${inv.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MechX-Invoice-${inv.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded', { id: 'pdf' });
    } catch (err) {
      toast.error('Failed to download invoice PDF', { id: 'pdf' });
    }
  };

  const MONO_COLORS = ['#FFFFFF', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B', '#3F3F46'];

  return (
    <div className="space-y-8 bg-black text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Administration & Telemetry</h1>
          <p className="text-xs text-neutral-400 mt-1">Platform overview, workshop operations, and account directory.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAdminData}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/15 text-neutral-300 rounded-xl hover:text-white hover:bg-white/10 transition-all text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <span className="px-3 py-1.5 bg-white/5 border border-white/15 text-white text-xs font-mono rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            Services Operational
          </span>
        </div>
      </div>

      {/* Synchronized Navigation Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-3 text-xs">
        <button
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-1.5 pb-3 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" /> Platform Telemetry
        </button>
        <button
          onClick={() => handleTabChange('customers')}
          className={`flex items-center gap-1.5 pb-3 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'customers' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Customer Directory
        </button>
        <button
          onClick={() => handleTabChange('mechanics')}
          className={`flex items-center gap-1.5 pb-3 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'mechanics' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Mechanic Workforces
        </button>
        <button
          onClick={() => handleTabChange('bookings')}
          className={`flex items-center gap-1.5 pb-3 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'bookings' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => handleTabChange('inventory')}
          className={`flex items-center gap-1.5 pb-3 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'inventory' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> Spare Parts ({inventory.length})
        </button>
        <button
          onClick={() => handleTabChange('invoices')}
          className={`flex items-center gap-1.5 pb-3 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'invoices' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Invoices & Revenue ({invoices.length})
        </button>
        <button
          onClick={() => handleTabChange('centers')}
          className={`flex items-center gap-1.5 pb-3 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'centers' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Service Centers ({serviceCenters.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: PLATFORM TELEMETRY & KPIS                           */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15 hover:border-white/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] uppercase font-mono text-neutral-400">Platform Users</span>
                <Users className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {users.length}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">4 configured roles</div>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15 hover:border-white/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] uppercase font-mono text-neutral-400">Fleet Vehicles</span>
                <Car className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {analytics?.totalVehicles || 0}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Registered vehicles</div>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15 hover:border-white/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] uppercase font-mono text-neutral-400">Total Bookings</span>
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {bookings.length}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">0 pending</div>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15 hover:border-white/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] uppercase font-mono text-neutral-400">Completed</span>
                <CheckCircle className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {analytics?.completedServices || 0}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Processed orders</div>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15 hover:border-white/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] uppercase font-mono text-neutral-400">Gross Revenue</span>
                <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                ₹{Number(analytics?.totalRevenue || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Settled payments</div>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15 hover:border-white/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] uppercase font-mono text-neutral-400">SLA Rating</span>
                <Activity className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                5.0
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Turnaround nominal</div>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full"></div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#09090B] border border-white/15">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-semibold text-white">Monthly Service Volume</h3>
                  <p className="text-xs text-neutral-400">Aggregated service requests across workshops</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.monthlyBookings || [
                    { month: 'Jun', bookings: 0 },
                    { month: 'Jul', bookings: 0 },
                    { month: 'Aug', bookings: 0 },
                    { month: 'Sep', bookings: 0 },
                    { month: 'Oct', bookings: 0 },
                    { month: 'Nov', bookings: 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="month" stroke="#71717A" fontSize={11} />
                    <YAxis stroke="#71717A" fontSize={11} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="bookings" name="Bookings" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15">
              <div className="mb-4 pb-3 border-b border-white/10">
                <h3 className="text-base font-semibold text-white">Service Categories</h3>
                <p className="text-xs text-neutral-400">Distribution by maintenance category</p>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.popularServiceTypes || [
                        { categoryName: 'General Servicing', count: 1 },
                        { categoryName: 'Engine Diagnostics', count: 1 },
                        { categoryName: 'Brake Repair', count: 1 },
                        { categoryName: 'Battery Service', count: 1 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="categoryName"
                    >
                      {(analytics?.popularServiceTypes || [1, 2, 3, 4]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MONO_COLORS[index % MONO_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: CUSTOMER DIRECTORY                                 */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Customer Account Directory</h3>
              <p className="text-xs text-neutral-400">Registered vehicle owners on the platform</p>
            </div>
            <span className="text-xs font-mono text-neutral-400">Total: {users.filter(u => u.role === 'CUSTOMER').length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.filter(u => u.role === 'CUSTOMER').map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-white">{u.fullName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">@{u.username}</div>
                    </td>
                    <td className="px-6 py-3.5 text-neutral-300">{u.email}</td>
                    <td className="px-6 py-3.5 text-neutral-400 font-mono">{u.phone}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button 
                        onClick={() => toast.success(`Viewing garage for ${u.username}`)}
                        className="px-3 py-1 bg-white/5 border border-white/15 text-neutral-300 hover:text-white rounded-lg text-xs transition-all"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: MECHANIC WORKFORCES                                 */}
      {/* ============================================================== */}
      {activeTab === 'mechanics' && (
        <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Technician & Mechanic Workforce</h3>
              <p className="text-xs text-neutral-400">Certified mechanics deployed across service bays</p>
            </div>
            <span className="text-xs font-mono text-neutral-400">Total: {users.filter(u => u.role === 'MECHANIC').length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                <tr>
                  <th className="px-6 py-3.5">Technician</th>
                  <th className="px-6 py-3.5">Specialization</th>
                  <th className="px-6 py-3.5">Skill Level</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5">Active Workload</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.filter(u => u.role === 'MECHANIC').map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-white">{u.fullName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">@{u.username} • {u.phone}</div>
                    </td>
                    <td className="px-6 py-3.5 text-neutral-300">{u.specialization || 'General Servicing & Diagnostics'}</td>
                    <td className="px-6 py-3.5 font-mono">
                      <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-white">
                        {u.skill || 'SENIOR'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-white font-bold">★ {u.rating || 5.0}</td>
                    <td className="px-6 py-3.5 font-mono text-neutral-400">{u.workload || 0} active jobs</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        Available
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: ALL BOOKINGS                                        */}
      {/* ============================================================== */}
      {activeTab === 'bookings' && (
        <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">All Platform Service Bookings</h3>
              <p className="text-xs text-neutral-400">Centralized job orders across all service centers</p>
            </div>
            <span className="text-xs font-mono text-neutral-400">Total: {bookings.length}</span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
              <Calendar className="w-8 h-8 text-neutral-500 mx-auto" />
              <p className="font-medium text-white">0 Service Bookings in System</p>
              <p className="text-neutral-500">Incoming appointments booked by customers will populate this table automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                  <tr>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Vehicle</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Scheduled Date</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 font-mono text-white font-bold">{b.bookingReference}</td>
                      <td className="px-6 py-3.5">{b.vehicle?.manufacturer} {b.vehicle?.model} ({b.vehicle?.registrationNumber})</td>
                      <td className="px-6 py-3.5">{b.customer?.fullName || 'Customer'}</td>
                      <td className="px-6 py-3.5">{b.category?.name}</td>
                      <td className="px-6 py-3.5 font-mono text-neutral-400">{b.bookingDate}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/15 text-white font-mono text-[10px]">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 5: SPARE PARTS INVENTORY                               */}
      {/* ============================================================== */}
      {activeTab === 'inventory' && (
        <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Central Spare Parts & Consumables Warehouse</h3>
              <p className="text-xs text-neutral-400">Warehouse stock inventory, unit prices, and replenishment controls</p>
            </div>
            <span className="text-xs font-mono text-neutral-400">Catalog: {inventory.length} SKUs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                <tr>
                  <th className="px-6 py-3.5">Part Name</th>
                  <th className="px-6 py-3.5">Part Number</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Unit Price</th>
                  <th className="px-6 py-3.5">Stock Level</th>
                  <th className="px-6 py-3.5 text-right">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventory.map(part => (
                  <tr key={part.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-white">{part.partName}</td>
                    <td className="px-6 py-3.5 font-mono text-neutral-400">{part.partNumber}</td>
                    <td className="px-6 py-3.5 text-neutral-400">{part.category}</td>
                    <td className="px-6 py-3.5 font-mono text-white">₹{Number(part.unitPrice).toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-white">
                      {part.stockQuantity} units
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateStock(part.id, part.stockQuantity, -1)}
                        className="w-6 h-6 bg-black border border-white/15 text-neutral-300 hover:text-white rounded font-mono font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleUpdateStock(part.id, part.stockQuantity, 5)}
                        className="px-2.5 py-1 bg-white/10 border border-white/15 text-white hover:bg-white hover:text-black rounded text-xs font-medium"
                      >
                        +5 Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 6: INVOICES & REVENUE                                  */}
      {/* ============================================================== */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Invoices & Platform Revenue</h3>
              <p className="text-xs text-neutral-400">Official tax invoices, line items, and settlement vouchers</p>
            </div>
            <span className="text-xs font-mono text-neutral-400">Total: {invoices.length}</span>
          </div>

          {invoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
              <FileText className="w-8 h-8 text-neutral-500 mx-auto" />
              <p className="font-medium text-white">0 Invoices Issued</p>
              <p className="text-neutral-500">Tax invoices are generated when workshop job orders are completed and closed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                  <tr>
                    <th className="px-6 py-3.5">Invoice #</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Issued Date</th>
                    <th className="px-6 py-3.5">Grand Total</th>
                    <th className="px-6 py-3.5">Payment Status</th>
                    <th className="px-6 py-3.5 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="px-6 py-3.5">{inv.customer?.fullName || 'Customer'}</td>
                      <td className="px-6 py-3.5 font-mono text-neutral-400">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                      <td className="px-6 py-3.5 font-mono font-bold text-white">₹{Number(inv.grandTotal).toLocaleString()}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/15 text-white font-mono text-[10px]">
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/15 text-white hover:bg-white hover:text-black transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 7: SERVICE CENTERS                                    */}
      {/* ============================================================== */}
      {activeTab === 'centers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceCenters.map(center => {
            const fullAddress = [center.addressLine1, center.city, center.pincode].filter(Boolean).join(', ');
            return (
              <div key={center.id} className="p-6 rounded-2xl bg-[#09090B] border border-white/15">
                <div className="flex items-start justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-xs font-mono text-neutral-400">{center.code}</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{center.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{fullAddress || 'Indiranagar, Bangalore'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-white text-xs font-mono">
                    Operational
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 my-6 text-center text-xs">
                  <div className="p-3 rounded-xl bg-black border border-white/10">
                    <div className="text-neutral-400 text-[11px]">Service Bays</div>
                    <div className="text-lg font-bold font-mono text-white mt-1">{center.totalBays || 8}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black border border-white/10">
                    <div className="text-neutral-400 text-[11px]">Mechanics</div>
                    <div className="text-lg font-bold font-mono text-white mt-1">{center.activeMechanics || 1}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black border border-white/10">
                    <div className="text-neutral-400 text-[11px]">Hours</div>
                    <div className="text-xs font-mono text-neutral-300 mt-2">{center.operatingHours || '08:00 - 20:00'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-neutral-400">
                  <span>Support: <strong className="text-white">{center.phoneNumber || '+91 80 2000 3000'}</strong></span>
                  <button 
                    onClick={() => toast.success(`Center parameters synchronized`)}
                    className="px-3 py-1 bg-white/5 border border-white/15 text-neutral-300 hover:text-white rounded-lg transition-all"
                  >
                    Configure Hub
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

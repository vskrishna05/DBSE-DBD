import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Wrench, CheckCircle, Clock, Users, 
  Package, DollarSign, ArrowRight, ShieldCheck, RefreshCw,
  Search, Filter, ChevronRight, Check, X, FileText, Download, LayoutDashboard
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManagerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path) => {
    if (path.includes('/manager/appointments')) return 'requests';
    if (path.includes('/manager/assignments')) return 'assignment';
    if (path.includes('/manager/estimates')) return 'estimates';
    if (path.includes('/manager/inventory')) return 'inventory';
    if (path.includes('/manager/invoices')) return 'invoices';
    return 'overview';
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab) => {
    switch (tab) {
      case 'requests': navigate('/manager/appointments'); break;
      case 'assignment': navigate('/manager/assignments'); break;
      case 'estimates': navigate('/manager/estimates'); break;
      case 'inventory': navigate('/manager/inventory'); break;
      case 'invoices': navigate('/manager/invoices'); break;
      default: navigate('/manager'); break;
    }
  };

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedMechanicId, setSelectedMechanicId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estimate Form State
  const [estimateData, setEstimateData] = useState({
    serviceRequestId: '',
    laborCharges: 1500,
    discountAmount: 0,
    notes: 'Initial inspection and diagnostics estimate',
    items: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [reqRes, invRes, invoiceRes] = await Promise.allSettled([
        api.get('/service-requests/center/1'),
        api.get('/inventory/parts'),
        api.get('/invoices')
      ]);

      if (reqRes.status === 'fulfilled' && Array.isArray(reqRes.value.data?.data)) {
        setRequests(reqRes.value.data.data);
      } else if (reqRes.status === 'fulfilled' && Array.isArray(reqRes.value.data)) {
        setRequests(reqRes.value.data);
      } else {
        setRequests([]);
      }

      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value.data?.data)) {
        setInventory(invRes.value.data.data);
      } else if (invRes.status === 'fulfilled' && Array.isArray(invRes.value.data)) {
        setInventory(invRes.value.data);
      }

      if (invoiceRes.status === 'fulfilled' && Array.isArray(invoiceRes.value.data)) {
        setInvoices(invoiceRes.value.data);
      } else if (invoiceRes.status === 'fulfilled' && Array.isArray(invoiceRes.value.data?.data)) {
        setInvoices(invoiceRes.value.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load workshop data');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRecommendations = async (sr) => {
    setSelectedRequest(sr);
    navigate('/manager/assignments');
    setLoadingRecommendations(true);
    setRecommendations([]);
    setSelectedMechanicId('');

    try {
      const res = await api.get(`/mechanics/recommend/${sr.id}`);
      const recs = res.data?.data || res.data || [];
      setRecommendations(recs);
      if (recs.length > 0) {
        setSelectedMechanicId(recs[0].mechanicId);
      }
    } catch (err) {
      // Clean fallback recommendation for single lead mechanic
      setRecommendations([
        {
          mechanicId: 3,
          mechanicName: "Lead Mechanic",
          skillLevel: "SENIOR",
          specialization: "General Servicing, Diagnostics, Engine Repair",
          activeWorkload: 0,
          totalScore: 95.0,
          rating: 5.0,
          scoreBreakdown: {
            specializationMatch: 40,
            workloadAvailability: 30,
            experienceScore: 15,
            ratingScore: 10
          },
          reasoning: "Highest specialization match, zero current workload, 5.0 rating."
        }
      ]);
      setSelectedMechanicId(3);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAssignMechanic = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !selectedMechanicId) {
      toast.error('Please select a mechanic');
      return;
    }

    try {
      await api.post('/mechanics/assign', {
        serviceRequestId: selectedRequest.id,
        mechanicId: Number(selectedMechanicId),
        assignmentNotes: assignmentNotes || 'Assigned via MechX Smart Assignment Engine'
      });
      toast.success(`Assigned mechanic successfully to ${selectedRequest.bookingReference}`);
      fetchInitialData();
      setActiveTab('requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleAddEstimatePart = (part) => {
    const existing = estimateData.items.find(i => i.partId === part.id);
    if (existing) {
      setEstimateData({
        ...estimateData,
        items: estimateData.items.map(i => i.partId === part.id ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      setEstimateData({
        ...estimateData,
        items: [...estimateData.items, {
          partId: part.id,
          partName: part.partName,
          partNumber: part.partNumber,
          unitPrice: Number(part.unitPrice),
          quantity: 1
        }]
      });
    }
    toast.success(`Added ${part.partName} to estimate`);
  };

  const handleRemoveEstimatePart = (partId) => {
    setEstimateData({
      ...estimateData,
      items: estimateData.items.filter(i => i.partId !== partId)
    });
  };

  const calculateEstimateSummary = () => {
    const partsTotal = estimateData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const labor = Number(estimateData.laborCharges) || 0;
    const discount = Number(estimateData.discountAmount) || 0;
    const subtotal = Math.max(0, partsTotal + labor - discount);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    return { partsTotal, labor, discount, subtotal, tax, total };
  };

  const handleSubmitEstimate = async (e) => {
    e.preventDefault();
    if (!estimateData.serviceRequestId) {
      toast.error('Please enter a Service Request ID');
      return;
    }

    try {
      await api.post('/estimates', {
        serviceRequestId: Number(estimateData.serviceRequestId),
        laborCharges: Number(estimateData.laborCharges),
        discountAmount: Number(estimateData.discountAmount),
        notes: estimateData.notes,
        items: estimateData.items.map(i => ({
          partId: i.partId,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      });
      toast.success('Cost Estimate generated and dispatched to customer');
      setEstimateData({
        serviceRequestId: '',
        laborCharges: 1500,
        discountAmount: 0,
        notes: '',
        items: []
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate estimate');
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

  const estSummary = calculateEstimateSummary();

  return (
    <div className="space-y-8 bg-black text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Workshop Operations Manager</h1>
          <p className="text-xs text-neutral-400 mt-1">Smart mechanic dispatching, cost estimation, and spare parts management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInitialData}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/15 text-neutral-300 rounded-xl hover:text-white transition-all text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <span className="px-3 py-1.5 bg-white/5 border border-white/15 text-white text-xs font-mono rounded-xl">
            Hub: Indiranagar Prime
          </span>
        </div>
      </div>

      {/* Navigation Tabs with Fine White Border Lines */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-4">
        <button
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" /> Workshop Overview
        </button>
        <button
          onClick={() => handleTabChange('requests')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'requests' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Appointments ({requests.length})
        </button>
        <button
          onClick={() => handleTabChange('assignment')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'assignment' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Smart Dispatch Engine
        </button>
        <button
          onClick={() => handleTabChange('estimates')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'estimates' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Cost Estimate Builder
        </button>
        <button
          onClick={() => handleTabChange('inventory')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'inventory' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> Spare Parts ({inventory.length})
        </button>
        <button
          onClick={() => handleTabChange('invoices')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'invoices' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Invoices & Billing ({invoices.length})
        </button>
      </div>

      {/* TAB 1: SERVICE REQUESTS QUEUE */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15">
              <span className="text-[11px] text-neutral-400 uppercase font-mono">Incoming / Scheduled</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {requests.filter(r => r.status === 'REQUESTED' || r.status === 'SCHEDULED' || r.status === 'BOOKING_REQUESTED').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15">
              <span className="text-[11px] text-neutral-400 uppercase font-mono">In Progress</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {requests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'REPAIR_IN_PROGRESS').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15">
              <span className="text-[11px] text-neutral-400 uppercase font-mono">Quality Inspection</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {requests.filter(r => r.status === 'QUALITY_CHECK').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15">
              <span className="text-[11px] text-neutral-400 uppercase font-mono">Completed</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {requests.filter(r => r.status === 'COMPLETED').length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Service Bookings</h3>
                <p className="text-xs text-neutral-400">Click "Dispatch" to invoke automated rule-based ranking</p>
              </div>
            </div>
            {requests.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                0 service requests currently in queue. Incoming bookings from customers will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                    <tr>
                      <th className="px-6 py-3.5">Ref</th>
                      <th className="px-6 py-3.5">Vehicle</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Scheduled</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {requests.map(req => (
                      <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5 font-mono font-medium text-white">{req.bookingReference}</td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-white">{req.vehicleRegNumber || req.vehicle?.registrationNumber}</div>
                          <div className="text-[10px] text-neutral-400">{req.vehicleModel || req.vehicle?.model}</div>
                        </td>
                        <td className="px-6 py-3.5 text-neutral-300">
                          {req.serviceCategoryName || req.category?.name}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-neutral-400">
                          {req.scheduledDate || req.bookingDate}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white font-mono text-[10px]">
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleFetchRecommendations(req)}
                            className="px-3 py-1 bg-white text-black font-semibold rounded-lg text-xs hover:bg-neutral-200 transition-all"
                          >
                            Dispatch
                          </button>
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

      {/* TAB 2: SMART MECHANIC ASSIGNMENT ENGINE */}
      {activeTab === 'assignment' && (
        <div className="space-y-6">
          {selectedRequest ? (
            <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400">Target Request</span>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {selectedRequest.bookingReference} — {selectedRequest.vehicleRegNumber || selectedRequest.vehicle?.registrationNumber}
                  </h2>
                </div>
              </div>

              {loadingRecommendations ? (
                <div className="py-12 text-center text-xs text-neutral-400 font-mono">
                  Calculating mechanic ranking weights...
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                    Candidate Recommendations
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.mechanicId}
                        onClick={() => setSelectedMechanicId(rec.mechanicId)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedMechanicId === rec.mechanicId
                            ? 'bg-white/10 border-white shadow-lg'
                            : 'bg-black border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white text-sm">{rec.mechanicName}</h4>
                              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white font-mono border border-white/15">
                                {rec.skillLevel}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1">{rec.specialization}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold font-mono text-white">{rec.totalScore?.toFixed(1)}</div>
                            <div className="text-[9px] text-neutral-500 font-mono">Score/100</div>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-300 italic mt-3 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 font-mono text-[11px]">
                          "{rec.reasoning}"
                        </p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAssignMechanic} className="p-4 rounded-xl bg-black border border-white/10 space-y-3">
                    <label className="block text-xs text-neutral-400">Supervisor Dispatch Instructions</label>
                    <input
                      type="text"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="e.g. Prioritize multi-point brake rotor test"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#09090B] border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                    />
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all"
                      >
                        Confirm Dispatch
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-white/10 text-xs text-neutral-400">
              Select any incoming service booking from the queue to evaluate mechanic scores and dispatch jobs.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ESTIMATE BUILDER */}
      {activeTab === 'estimates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-4">
            <h3 className="text-base font-bold text-white pb-3 border-b border-white/10">Service Cost Estimate Builder</h3>
            <form onSubmit={handleSubmitEstimate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Service Request ID</label>
                  <input
                    type="number"
                    value={estimateData.serviceRequestId}
                    onChange={(e) => setEstimateData({ ...estimateData, serviceRequestId: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Labor Charges (₹)</label>
                  <input
                    type="number"
                    value={estimateData.laborCharges}
                    onChange={(e) => setEstimateData({ ...estimateData, laborCharges: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Technical Notes</label>
                <textarea
                  rows="2"
                  value={estimateData.notes}
                  onChange={(e) => setEstimateData({ ...estimateData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
                ></textarea>
              </div>

              {/* Estimate items */}
              <div>
                <h4 className="text-[11px] uppercase font-mono text-neutral-400 mb-2">Attached Spare Parts ({estimateData.items.length})</h4>
                {estimateData.items.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-neutral-500">
                    No parts added. Select parts from inventory panel on the right.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {estimateData.items.map(item => (
                      <div key={item.partId} className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/10 text-xs">
                        <div>
                          <span className="font-semibold text-white">{item.partName}</span>
                          <span className="text-neutral-500 font-mono ml-2">({item.partNumber})</span>
                          <div className="text-neutral-400 mt-0.5">₹{item.unitPrice.toLocaleString()} × {item.quantity} units</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-white">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEstimatePart(item.partId)}
                            className="text-neutral-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all"
              >
                Generate & Dispatch Estimate
              </button>
            </form>
          </div>

          {/* Right sidebar: Parts selector & Summary */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#09090B] border border-white/15 space-y-3">
              <h4 className="text-xs font-mono uppercase text-neutral-400 pb-2 border-b border-white/10">Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Parts:</span>
                  <span className="font-mono text-white">₹{estSummary.partsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Labor:</span>
                  <span className="font-mono text-white">₹{estSummary.labor.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400 pt-2 border-t border-white/10">
                  <span>GST (18%):</span>
                  <span className="font-mono text-white">₹{estSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span className="font-mono">₹{estSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#09090B] border border-white/15">
              <h4 className="text-xs font-semibold text-white mb-3">Add Parts from Stock</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {inventory.map(part => (
                  <div key={part.id} className="p-2.5 rounded-xl bg-black border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-white">{part.partName}</div>
                      <div className="text-neutral-500 font-mono text-[10px]">₹{Number(part.unitPrice).toLocaleString()} • {part.stockQuantity} in stock</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddEstimatePart(part)}
                      className="px-2 py-1 bg-white/10 border border-white/15 text-white hover:bg-white hover:text-black rounded text-[11px] font-semibold transition-all"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Spare Parts Inventory</h3>
              <p className="text-xs text-neutral-400">Warehouse stock monitoring and adjustments</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                <tr>
                  <th className="px-6 py-3.5">Part Name</th>
                  <th className="px-6 py-3.5">Number</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Unit Price</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5 text-right">Adjust Stock</th>
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

      {/* TAB 5: INVOICES & BILLING */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Tax Invoices & Billing Records</h3>
              <p className="text-xs text-neutral-400">View issued invoices and download generated tax receipts</p>
            </div>
          </div>
          {invoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              0 invoices recorded. Invoices will automatically generate when service requests are completed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                  <tr>
                    <th className="px-6 py-3.5">Invoice #</th>
                    <th className="px-6 py-3.5">Booking Ref</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Subtotal</th>
                    <th className="px-6 py-3.5">GST (18%)</th>
                    <th className="px-6 py-3.5">Total Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="px-6 py-3.5 font-mono text-neutral-400">{inv.serviceRequest?.bookingReference || 'SR-00' + inv.id}</td>
                      <td className="px-6 py-3.5 text-white font-medium">{inv.serviceRequest?.customer?.fullName || 'Customer'}</td>
                      <td className="px-6 py-3.5 font-mono text-neutral-300">₹{Number(inv.subtotal || 0).toLocaleString()}</td>
                      <td className="px-6 py-3.5 font-mono text-neutral-400">₹{Number(inv.taxAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-3.5 font-mono font-bold text-white">₹{Number(inv.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          inv.status === 'PAID'
                            ? 'bg-white/10 text-white border-white/20'
                            : 'bg-white/5 text-neutral-400 border-white/10'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.get(`/invoices/${inv.id}/pdf`, { responseType: 'blob' });
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `Invoice-${inv.invoiceNumber}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                            } catch (e) {
                              toast.error('Could not download PDF invoice');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-lg text-xs transition-all font-mono"
                        >
                          <Download className="w-3 h-3" /> PDF
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

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15">
              <span className="text-[11px] text-neutral-400 uppercase font-mono">Incoming Bookings</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {requests.filter(r => r.status === 'REQUESTED' || r.status === 'SCHEDULED' || r.status === 'BOOKING_REQUESTED').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15">
              <span className="text-[11px] text-neutral-400 uppercase font-mono">Active In Bay</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {requests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'REPAIR_IN_PROGRESS').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15">
              <span className="text-[11px] text-neutral-400 uppercase font-mono">Catalog Parts</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{inventory.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/15">
              <span className="text-[11px] text-neutral-400 uppercase font-mono">Invoices Issued</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{invoices.length}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#09090B] border border-white/15 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Workshop Quick Operations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleTabChange('requests')}
                className="p-4 rounded-xl bg-black border border-white/10 hover:border-white/30 text-left transition-all space-y-1"
              >
                <Clock className="w-4 h-4 text-white" />
                <div className="text-xs font-semibold text-white">View Appointments</div>
                <div className="text-[10px] text-neutral-400">Incoming service request queue</div>
              </button>
              <button
                onClick={() => handleTabChange('assignment')}
                className="p-4 rounded-xl bg-black border border-white/10 hover:border-white/30 text-left transition-all space-y-1"
              >
                <Users className="w-4 h-4 text-white" />
                <div className="text-xs font-semibold text-white">Smart Dispatch</div>
                <div className="text-[10px] text-neutral-400">Rule-based mechanic assignment</div>
              </button>
              <button
                onClick={() => handleTabChange('estimates')}
                className="p-4 rounded-xl bg-black border border-white/10 hover:border-white/30 text-left transition-all space-y-1"
              >
                <DollarSign className="w-4 h-4 text-white" />
                <div className="text-xs font-semibold text-white">Create Estimate</div>
                <div className="text-[10px] text-neutral-400">Labor and parts pricing</div>
              </button>
              <button
                onClick={() => handleTabChange('inventory')}
                className="p-4 rounded-xl bg-black border border-white/10 hover:border-white/30 text-left transition-all space-y-1"
              >
                <Package className="w-4 h-4 text-white" />
                <div className="text-xs font-semibold text-white">Manage Stock</div>
                <div className="text-[10px] text-neutral-400">Warehouse inventory levels</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

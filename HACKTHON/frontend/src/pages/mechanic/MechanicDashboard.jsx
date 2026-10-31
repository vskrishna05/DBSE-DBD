import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Wrench,
  CheckCircle2,
  Activity,
  HeartPulse,
  Package,
  Car,
  ChevronRight,
  ArrowRight,
  Clock,
  ShieldCheck,
  Send,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'INSPECTION_IN_PROGRESS',
  'ESTIMATE_PENDING',
  'REPAIR_IN_PROGRESS',
  'QUALITY_CHECK',
  'READY_FOR_DELIVERY',
  'COMPLETED'
];

export default function MechanicDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path) => {
    if (path.includes('/mechanic/tracking')) return 'tracking';
    if (path.includes('/mechanic/health-check')) return 'health';
    if (path.includes('/mechanic/parts-used')) return 'parts';
    return 'queue';
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab) => {
    switch (tab) {
      case 'tracking': navigate('/mechanic/tracking'); break;
      case 'health': navigate('/mechanic/health-check'); break;
      case 'parts': navigate('/mechanic/parts-used'); break;
      default: navigate('/mechanic'); break;
    }
  };

  const [assignedJobs, setAssignedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update form
  const [newStatus, setNewStatus] = useState('REPAIR_IN_PROGRESS');
  const [statusRemarks, setStatusRemarks] = useState('');

  // Parts consumption form
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantityUsed, setQuantityUsed] = useState(1);

  // Health inspection form
  const [healthForm, setHealthForm] = useState({
    engineScore: 90,
    brakesScore: 85,
    tyresScore: 88,
    batteryScore: 92,
    technicianSummary: 'Complete multi-point diagnostic passed. Clean fuel trim and optimal brake hydraulic pressure.',
    recommendations: 'Replace cabin air filter at next 10,000 km interval.'
  });

  useEffect(() => {
    loadMechanicData();
  }, []);

  const loadMechanicData = async () => {
    try {
      const [jRes, pRes] = await Promise.allSettled([
        api.get('/bookings'),
        api.get('/inventory/parts')
      ]);

      if (jRes.status === 'fulfilled' && Array.isArray(jRes.value.data)) {
        setAssignedJobs(jRes.value.data);
        if (jRes.value.data.length > 0) {
          setSelectedJob(jRes.value.data[0]);
        }
      }

      if (pRes.status === 'fulfilled' && Array.isArray(pRes.value.data)) {
        setSpareParts(pRes.value.data);
        if (pRes.value.data.length > 0) {
          setSelectedPartId(pRes.value.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      await api.patch(`/services/${selectedJob.id}/status`, {
        status: newStatus,
        remarks: statusRemarks || `Status updated by assigned mechanic`
      });
      toast.success(`Service status advanced to ${newStatus}`);
      loadMechanicData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleUsePart = async (e) => {
    e.preventDefault();
    if (!selectedJob || !selectedPartId) return;
    try {
      await api.post('/inventory/service-use', {
        serviceRequestId: selectedJob.id,
        partId: Number(selectedPartId),
        quantity: Number(quantityUsed)
      });
      toast.success('Part recorded and stock deducted from inventory');
      loadMechanicData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deducting part');
    }
  };

  const handleSaveHealth = async (e) => {
    e.preventDefault();
    if (!selectedJob) {
      toast.error('Please select an active job first');
      return;
    }
    const vehicleId = selectedJob.vehicle?.id;
    if (!vehicleId) {
      toast.error('Selected job has no associated vehicle ID');
      return;
    }

    try {
      await api.post('/health', {
        vehicleId: vehicleId,
        serviceRequestId: selectedJob.id,
        engineScore: Number(healthForm.engineScore),
        brakesScore: Number(healthForm.brakesScore),
        tyresScore: Number(healthForm.tyresScore),
        batteryScore: Number(healthForm.batteryScore),
        technicianSummary: healthForm.technicianSummary,
        recommendations: healthForm.recommendations
      });
      toast.success('Vehicle health inspection score recorded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record health score');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-500 font-mono">Loading technician workstation...</div>;
  }

  return (
    <div className="space-y-8 bg-black text-white">
      {/* Header */}
      <div className="pb-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-neutral-400 mb-1">
            <Wrench className="w-3.5 h-3.5 text-white" />
            <span>Technician Bay Workstation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Active Repair & Diagnostic Console</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Manage assigned job orders, update repair stages, record health telemetry, and track parts consumption.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-white/5 border border-white/15 text-white text-xs font-mono rounded-xl">
            Mechanic: Lead Mechanic
          </span>
        </div>
      </div>

      {/* Subroute Navigation Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-4">
        <button
          onClick={() => handleTabChange('queue')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'queue' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Assigned Jobs ({assignedJobs.length})
        </button>
        <button
          onClick={() => handleTabChange('tracking')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'tracking' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Live Repair Tracker
        </button>
        <button
          onClick={() => handleTabChange('health')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'health' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" /> Record Health Inspection
        </button>
        <button
          onClick={() => handleTabChange('parts')}
          className={`flex items-center gap-2 pb-3 font-medium text-xs transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'parts' 
              ? 'border-white text-white font-semibold' 
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> Record Parts Used
        </button>
      </div>

      {/* TAB 1: ASSIGNED JOBS QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Technician Service Queue</h3>
                <p className="text-xs text-neutral-400">All service requests assigned to your service bay</p>
              </div>
            </div>

            {assignedJobs.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                0 jobs currently dispatched. When the service manager assigns a vehicle to your bay, it will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-black text-[11px] uppercase text-neutral-400 border-b border-white/10 font-mono">
                    <tr>
                      <th className="px-6 py-3.5">Booking Ref</th>
                      <th className="px-6 py-3.5">Vehicle</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Scheduled Date</th>
                      <th className="px-6 py-3.5">Stage</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {assignedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5 font-mono font-bold text-white">{job.bookingReference}</td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-white">{job.vehicle?.manufacturer} {job.vehicle?.model}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{job.vehicle?.registrationNumber}</div>
                        </td>
                        <td className="px-6 py-3.5 text-neutral-300">{job.category?.name}</td>
                        <td className="px-6 py-3.5 font-mono text-neutral-400">{job.bookingDate}</td>
                        <td className="px-6 py-3.5">
                          <span className="px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white font-mono text-[10px]">
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              handleTabChange('tracking');
                            }}
                            className="px-2.5 py-1 bg-white text-black font-semibold rounded-lg text-xs hover:bg-neutral-200 transition-all"
                          >
                            Update Stage
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              handleTabChange('health');
                            }}
                            className="px-2.5 py-1 bg-white/10 border border-white/15 text-white font-medium rounded-lg text-xs hover:bg-white hover:text-black transition-all"
                          >
                            Health
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              handleTabChange('parts');
                            }}
                            className="px-2.5 py-1 bg-white/10 border border-white/15 text-white font-medium rounded-lg text-xs hover:bg-white hover:text-black transition-all"
                          >
                            Parts
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

      {/* TAB 2: LIVE REPAIR TRACKER */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {selectedJob ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Job Info */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-[#09090B] border border-white/15 space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Target Vehicle</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedJob.vehicle?.manufacturer} {selectedJob.vehicle?.model}
                  </h3>
                </div>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Ref:</span>
                    <span className="font-mono text-white">{selectedJob.bookingReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Plate:</span>
                    <span className="font-mono text-white">{selectedJob.vehicle?.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Category:</span>
                    <span className="text-white">{selectedJob.category?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Scheduled:</span>
                    <span className="font-mono text-white">{selectedJob.bookingDate}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-neutral-400">Current Stage:</span>
                    <span className="font-mono text-white font-bold">{selectedJob.status}</span>
                  </div>
                </div>
              </div>

              {/* Advance Stage Form */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-[#09090B] border border-white/15 space-y-4">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Advance Service Stage</h4>
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Select Next Target Stage</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white font-mono"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Technician Floor Notes</label>
                    <input
                      type="text"
                      value={statusRemarks}
                      onChange={(e) => setStatusRemarks(e.target.value)}
                      placeholder="e.g. Brake calipers torqued to OEM spec, fluid bled"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all"
                  >
                    Confirm Stage Progression
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-white/10 text-xs text-neutral-400">
              No active job selected. Select a job from the Assigned Jobs queue to update repair stages.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECORD HEALTH INSPECTION */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {selectedJob ? (
            <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-6">
              <div className="pb-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Multi-Point Health Inspection Report</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Recording scores for {selectedJob.vehicle?.manufacturer} {selectedJob.vehicle?.model} ({selectedJob.vehicle?.registrationNumber})
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveHealth} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Engine Score</span>
                      <span className="font-mono font-bold text-white">{healthForm.engineScore}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={healthForm.engineScore}
                      onChange={(e) => setHealthForm({ ...healthForm, engineScore: e.target.value })}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Brakes Score</span>
                      <span className="font-mono font-bold text-white">{healthForm.brakesScore}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={healthForm.brakesScore}
                      onChange={(e) => setHealthForm({ ...healthForm, brakesScore: e.target.value })}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Tyres Score</span>
                      <span className="font-mono font-bold text-white">{healthForm.tyresScore}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={healthForm.tyresScore}
                      onChange={(e) => setHealthForm({ ...healthForm, tyresScore: e.target.value })}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Battery Score</span>
                      <span className="font-mono font-bold text-white">{healthForm.batteryScore}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={healthForm.batteryScore}
                      onChange={(e) => setHealthForm({ ...healthForm, batteryScore: e.target.value })}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Technician Diagnostic Summary</label>
                    <textarea
                      rows="3"
                      value={healthForm.technicianSummary}
                      onChange={(e) => setHealthForm({ ...healthForm, technicianSummary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Technician Recommendations</label>
                    <textarea
                      rows="3"
                      value={healthForm.recommendations}
                      onChange={(e) => setHealthForm({ ...healthForm, recommendations: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Save Health Inspection
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-white/10 text-xs text-neutral-400">
              No active job selected. Select a job from the Assigned Jobs queue to record component health scores.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RECORD PARTS USED */}
      {activeTab === 'parts' && (
        <div className="space-y-6">
          {selectedJob ? (
            <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-6">
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Record Spare Parts Consumption</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Deduct spare parts directly against job {selectedJob.bookingReference} ({selectedJob.vehicle?.registrationNumber})
                </p>
              </div>

              <form onSubmit={handleUsePart} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-neutral-400 mb-1">Select Part from Inventory</label>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                  >
                    {spareParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.partName} ({p.partNumber}) — ₹{Number(p.unitPrice).toLocaleString()} ({p.stockQuantity} in stock)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Quantity Used</label>
                  <input
                    type="number"
                    min="1"
                    value={quantityUsed}
                    onChange={(e) => setQuantityUsed(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white font-mono"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Allocate & Deduct Stock
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-white/10 text-xs text-neutral-400">
              No active job selected. Select a job from the Assigned Jobs queue to record spare parts consumption.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

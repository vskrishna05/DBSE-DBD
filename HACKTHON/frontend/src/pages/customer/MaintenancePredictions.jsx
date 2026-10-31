import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Cpu,
  RefreshCw,
  Calendar,
  Gauge,
  Car,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const MaintenancePredictions = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningModel, setRunningModel] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      if (Array.isArray(res.data)) {
        setVehicles(res.data);
        if (res.data.length > 0) {
          setSelectedVehicle(res.data[0]);
          loadPredictions(res.data[0].id);
        }
      }
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async (vId) => {
    try {
      const res = await api.get(`/maintenance/vehicle/${vId}`);
      if (Array.isArray(res.data)) setPredictions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectVehicle = (v) => {
    setSelectedVehicle(v);
    loadPredictions(v.id);
  };

  const handleRunAiModel = async () => {
    if (!selectedVehicle) return;
    setRunningModel(true);
    try {
      const res = await api.post(`/maintenance/predict/${selectedVehicle.id}`);
      if (Array.isArray(res.data)) setPredictions(res.data);
      toast.success('Random Forest ML model executed successfully');
    } catch (err) {
      toast.error('Error executing predictive model');
    } finally {
      setRunningModel(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading predictive model telemetry...</div>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 rounded-2xl bg-[#09090B] border border-white/10 text-center space-y-3 bg-black text-white">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-neutral-400">
          <Car className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No Registered Vehicles</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Add a vehicle to your digital garage to execute the Random Forest predictive maintenance engine.
        </p>
        <Link
          to="/customer/vehicles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all mt-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 bg-black text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-neutral-400 mb-1">
            <Cpu className="w-3.5 h-3.5 text-white" />
            <span>Python FastAPI & Scikit-learn Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Predictive Maintenance Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-1">Component degradation analysis forecasting due mileage and failure probabilities</p>
        </div>

        <button
          onClick={handleRunAiModel}
          disabled={runningModel}
          className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${runningModel ? 'animate-spin' : ''}`} />
          <span>{runningModel ? 'Computing Degradation...' : 'Run Prediction Engine'}</span>
        </button>
      </div>

      {/* Vehicle Selector Tabs */}
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-2">
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => handleSelectVehicle(v)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap border transition-all ${
              selectedVehicle?.id === v.id
                ? 'bg-white text-black font-bold border-white'
                : 'bg-[#09090B] border-white/10 text-neutral-400 hover:text-white hover:border-white/25'
            }`}
          >
            {v.manufacturer} {v.model} ({v.registrationNumber})
          </button>
        ))}
      </div>

      {/* Predictions Grid */}
      <div className="space-y-4">
        {predictions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-white/10 space-y-3">
            <Cpu className="w-10 h-10 text-neutral-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Telemetry Forecasts</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Click "Run Prediction Engine" to evaluate component wear across braking, ignition, timing belts, and fluids.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-[#09090B] border border-white/15 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      {p.predictionType || 'ML PIPELINE'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/20 bg-white/5 text-white">
                      {p.priorityLevel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">{p.componentName}</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{p.recommendation}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-black border border-white/10">
                      <span className="text-[10px] text-neutral-500 block">Due Mileage</span>
                      <strong className="text-white text-xs">{p.estimatedDueMileage?.toLocaleString()} KM</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black border border-white/10">
                      <span className="text-[10px] text-neutral-500 block">Due Date</span>
                      <strong className="text-white text-xs">{p.estimatedDueDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Confidence:</span>
                  <span className="text-white font-bold">{((p.confidenceScore || 0.92) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MaintenancePredictions;

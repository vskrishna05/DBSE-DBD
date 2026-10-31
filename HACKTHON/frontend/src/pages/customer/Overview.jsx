import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Car,
  CalendarPlus,
  Clock,
  Cpu,
  HeartPulse,
  QrCode,
  ArrowRight,
  Shield,
  ChevronRight,
  Plus
} from 'lucide-react';

const CustomerOverview = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [vRes, bRes] = await Promise.allSettled([
        api.get('/vehicles'),
        api.get('/bookings')
      ]);

      if (vRes.status === 'fulfilled' && Array.isArray(vRes.value.data)) {
        setVehicles(vRes.value.data);
        if (vRes.value.data.length > 0) {
          try {
            const pRes = await api.get(`/maintenance/vehicle/${vRes.value.data[0].id}`);
            if (Array.isArray(pRes.data)) setPredictions(pRes.data);
          } catch (e) {
            // no predictions yet
          }
        }
      }

      if (bRes.status === 'fulfilled' && Array.isArray(bRes.value.data) && bRes.value.data.length > 0) {
        const active = bRes.value.data.find(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') || bRes.value.data[0];
        setActiveBooking(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto bg-black text-white">
      
      {/* Welcome Banner - Pure Black with Crisp White Border */}
      <div className="p-8 rounded-2xl bg-[#09090B] border border-white/15 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs text-neutral-300 font-mono">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Customer Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.fullName || user?.username}!
            </h1>
            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
              Manage your personal vehicles, view predictive maintenance schedules, and book service appointments with certified technicians.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/customer/book"
              className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Service</span>
            </Link>
            <Link
              to="/customer/vehicles"
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>My Garage ({vehicles.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Thin White Line Divider */}
      <div className="h-px bg-white/10 w-full"></div>

      {/* Active Service Status Hero Card (if active) */}
      {activeBooking && (
        <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-base font-semibold text-white">
                  {activeBooking.vehicle?.manufacturer} {activeBooking.vehicle?.model}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white">
                  {activeBooking.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                Booking: {activeBooking.bookingReference} • Hub: {activeBooking.serviceCenter?.name}
              </p>
            </div>

            <Link
              to="/customer/track"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <span>View Tracking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-black border border-white/10">
              <p className="text-neutral-500 text-[11px]">Service Type</p>
              <p className="font-semibold text-white mt-1">{activeBooking.category?.name || 'Standard'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-black border border-white/10">
              <p className="text-neutral-500 text-[11px]">Appointment</p>
              <p className="font-semibold text-white mt-1">{activeBooking.bookingDate}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-black border border-white/10">
              <p className="text-neutral-500 text-[11px]">Doorstep Valet</p>
              <p className="font-semibold text-white mt-1">{activeBooking.requiresPickupDrop ? 'Requested' : 'Self Drop'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-black border border-white/10">
              <p className="text-neutral-500 text-[11px]">Odometer</p>
              <p className="font-semibold font-mono text-white mt-1">{Number(activeBooking.currentOdometer || 0).toLocaleString()} KM</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Vehicles & AI Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vehicles Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-neutral-400" />
              <span>Registered Vehicles ({vehicles.length})</span>
            </h3>
            <Link to="/customer/vehicles" className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors">
              <span>Manage</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#09090B] border border-white/10 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-neutral-400">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">No Vehicles Registered Yet</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Add your vehicle to track maintenance, access AI failure predictions, and schedule appointments.
                </p>
              </div>
              <Link
                to="/customer/vehicles"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-[#09090B] border border-white/10 hover:border-white/25 flex items-center justify-between transition-all">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-black border border-white/15 flex items-center justify-center font-bold text-xs font-mono text-white">
                      {v.manufacturer?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{v.manufacturer} {v.model}</h4>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {v.registrationNumber} • {v.fuelType} • {Number(v.currentOdometer || 0).toLocaleString()} KM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to="/customer/passport"
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white hover:text-black text-neutral-400 transition-all"
                      title="Digital Passport"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/customer/health"
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white hover:text-black text-neutral-400 transition-all"
                      title="Health Inspection"
                    >
                      <HeartPulse className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Predictive Maintenance */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neutral-400" />
              <span>AI Maintenance Forecast</span>
            </h3>
            <Link to="/customer/predictions" className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors">
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-[#09090B] border border-white/15 space-y-3">
            {predictions.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-neutral-400">
                  {vehicles.length === 0 
                    ? 'Register a vehicle to generate AI predictive maintenance forecasts.' 
                    : 'No pending maintenance alerts detected.'}
                </p>
                <Link
                  to="/customer/predictions"
                  className="inline-block px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs hover:bg-white/10 transition-all"
                >
                  Run Telemetry Diagnostic
                </Link>
              </div>
            ) : (
              predictions.slice(0, 3).map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-white">{p.componentName}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">Due: {p.estimatedDueMileage?.toLocaleString()} KM</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/20 bg-white/10 text-white">
                    {p.priorityLevel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CustomerOverview;

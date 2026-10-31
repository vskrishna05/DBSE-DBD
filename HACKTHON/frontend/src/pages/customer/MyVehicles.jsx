import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Car, Plus, QrCode, HeartPulse, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    manufacturingYear: 2023,
    registrationNumber: '',
    vin: '',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    color: '',
    currentOdometer: 15000,
    insurancePolicyNumber: '',
    insuranceExpiryDate: '2027-12-31'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      if (Array.isArray(res.data)) {
        setVehicles(res.data);
      }
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', formData);
      toast.success('Vehicle registered and Digital Passport generated');
      setShowModal(false);
      setFormData({
        manufacturer: '',
        model: '',
        manufacturingYear: 2023,
        registrationNumber: '',
        vin: '',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        color: '',
        currentOdometer: 15000,
        insurancePolicyNumber: '',
        insuranceExpiryDate: '2027-12-31'
      });
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating vehicle');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle from your garage?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle removed');
      fetchVehicles();
    } catch (err) {
      toast.error('Error removing vehicle');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto bg-black text-white">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">My Digital Garage</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage owned vehicles, registration metadata, and verified passports</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Vehicle Cards Grid / Empty State */}
      {vehicles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#09090B] border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-neutral-400">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Vehicles Registered</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              Your digital garage is currently empty. Register your vehicle to schedule service, track repairs, and access AI maintenance forecasts.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Vehicle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="p-6 rounded-2xl bg-[#09090B] border border-white/15 flex flex-col justify-between space-y-6">
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-white/20 bg-white/5 text-white">
                    {v.fuelType} • {v.transmission}
                  </span>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="text-neutral-500 hover:text-white p-1 transition-colors"
                    title="Remove Vehicle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="text-lg font-bold text-white">{v.manufacturer} {v.model}</h3>
                  <p className="text-xs text-neutral-400 font-mono tracking-wider font-semibold">{v.registrationNumber}</p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black border border-white/10">
                    <span className="text-[10px] text-neutral-500 uppercase font-mono">Odometer</span>
                    <p className="font-semibold text-white font-mono mt-0.5">{Number(v.currentOdometer || 0).toLocaleString()} KM</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black border border-white/10">
                    <span className="text-[10px] text-neutral-500 uppercase font-mono">Year</span>
                    <p className="font-semibold text-white font-mono mt-0.5">{v.manufacturingYear}</p>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-black border border-white/10 text-xs">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">VIN</span>
                  <p className="font-mono text-[11px] text-neutral-300 truncate mt-0.5">{v.vin}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <Link
                  to="/customer/passport"
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-medium hover:bg-white/10 text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Passport</span>
                </Link>
                <Link
                  to="/customer/health"
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-medium hover:bg-white/10 text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Health</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#09090B] border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Register New Vehicle</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fortuner"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Registration Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="KA-01-AB-1234"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Manufacturing Year</label>
                  <input
                    type="number"
                    required
                    value={formData.manufacturingYear}
                    onChange={(e) => setFormData({ ...formData, manufacturingYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono"
                  >
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Odometer (KM)</label>
                  <input
                    type="number"
                    required
                    value={formData.currentOdometer}
                    onChange={(e) => setFormData({ ...formData, currentOdometer: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">VIN (17 Digits)</label>
                  <input
                    type="text"
                    required
                    placeholder="MB1JTE82N00192831"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-neutral-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyVehicles;

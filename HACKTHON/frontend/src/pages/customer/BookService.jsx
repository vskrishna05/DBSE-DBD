import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CalendarPlus,
  Car,
  Wrench,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookService = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    vehicleId: '',
    categoryId: '',
    packageId: '',
    serviceCenterId: '',
    bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    bookingTimeSlot: '09:00 AM - 10:00 AM',
    reportedIssues: '',
    currentOdometer: 15000,
    requiresPickupDrop: false,
    pickupAddress: 'Indiranagar 100 Feet Road',
    pickupCity: 'Bangalore',
    pickupPincode: '560038',
    pickupContactName: 'Customer',
    pickupContactPhone: '+91 90000 00004'
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [vRes, cRes, pRes, scRes] = await Promise.allSettled([
        api.get('/vehicles'),
        api.get('/services/categories'),
        api.get('/services/packages'),
        api.get('/service-centers')
      ]);

      if (vRes.status === 'fulfilled' && Array.isArray(vRes.value.data)) {
        setVehicles(vRes.value.data);
        if (vRes.value.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            vehicleId: vRes.value.data[0].id,
            currentOdometer: vRes.value.data[0].currentOdometer || 15000
          }));
        }
      }

      const cats = (cRes.status === 'fulfilled' && (cRes.value.data?.data || cRes.value.data)) || [];
      if (Array.isArray(cats)) {
        setCategories(cats);
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
        }
      }

      const pkgs = (pRes.status === 'fulfilled' && (pRes.value.data?.data || pRes.value.data)) || [];
      if (Array.isArray(pkgs)) setPackages(pkgs);

      const scs = (scRes.status === 'fulfilled' && (scRes.value.data?.data || scRes.value.data)) || [];
      if (Array.isArray(scs)) {
        setCenters(scs);
        if (scs.length > 0) {
          setFormData(prev => ({ ...prev, serviceCenterId: scs[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error('Please register a vehicle before scheduling a service');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/bookings', formData);
      toast.success(`Booking Confirmed. Ref: ${res.data.bookingReference || 'BK-NEW'}`);
      setTimeout(() => {
        navigate('/customer/track');
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading service options...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-black text-white">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Schedule Vehicle Service</h1>
        <p className="text-xs text-neutral-400 mt-1">Select your vehicle, service category, and appointment slot</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Select Vehicle */}
        <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <Car className="w-4 h-4 text-neutral-400" />
            <span>1. Select Vehicle</span>
          </h3>

          {vehicles.length === 0 ? (
            <div className="p-6 rounded-xl bg-black border border-white/10 text-center space-y-3">
              <p className="text-xs text-neutral-400">You do not have any registered vehicles in your garage yet.</p>
              <Link
                to="/customer/vehicles"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Vehicle First</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((v) => (
                <label
                  key={v.id}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    formData.vehicleId === v.id
                      ? 'bg-white/10 border-white text-white'
                      : 'bg-black border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <div>
                    <input
                      type="radio"
                      name="vehicleId"
                      value={v.id}
                      checked={formData.vehicleId === v.id}
                      onChange={() => setFormData({ ...formData, vehicleId: v.id, currentOdometer: v.currentOdometer })}
                      className="hidden"
                    />
                    <p className="text-xs font-semibold text-white">{v.manufacturer} {v.model}</p>
                    <p className="text-[11px] font-mono text-neutral-400 mt-0.5">{v.registrationNumber} • {v.fuelType}</p>
                  </div>
                  {formData.vehicleId === v.id && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </label>
              ))}
            </div>
          )}

          {vehicles.length > 0 && (
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Current Odometer (KM)</label>
              <input
                type="number"
                value={formData.currentOdometer}
                onChange={(e) => setFormData({ ...formData, currentOdometer: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono max-w-xs focus:outline-none focus:border-white"
              />
            </div>
          )}
        </div>

        {/* Step 2: Service Category & Package */}
        <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <Wrench className="w-4 h-4 text-neutral-400" />
            <span>2. Choose Service Category</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categories.slice(0, 6).map((c) => (
              <label
                key={c.id}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.categoryId === c.id
                    ? 'bg-white/10 border-white text-white'
                    : 'bg-black border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="categoryId"
                  value={c.id}
                  checked={formData.categoryId === c.id}
                  onChange={() => setFormData({ ...formData, categoryId: c.id })}
                  className="hidden"
                />
                <p className="text-xs font-semibold text-white">{c.name}</p>
                <p className="text-[11px] text-neutral-400 mt-1 font-mono">Base Labor: ₹{c.baseLaborCost}</p>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Optional Package</label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value ? Number(e.target.value) : '' })}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white font-mono"
            >
              <option value="">Standard Diagnostics</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - ₹{pkg.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Reported Vehicle Symptoms or Requests</label>
            <textarea
              rows={2}
              placeholder="e.g. Brake squeak upon deceleration, replace engine oil"
              value={formData.reportedIssues}
              onChange={(e) => setFormData({ ...formData, reportedIssues: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
            ></textarea>
          </div>
        </div>

        {/* Step 3: Service Center & Date */}
        <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>3. Appointment Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={formData.bookingDate}
                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Time Slot</label>
              <select
                value={formData.bookingTimeSlot}
                onChange={(e) => setFormData({ ...formData, bookingTimeSlot: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-white"
              >
                <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Workshop Service Center</label>
            <select
              value={formData.serviceCenterId}
              onChange={(e) => setFormData({ ...formData, serviceCenterId: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-white"
            >
              {centers.map(sc => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || vehicles.length === 0}
          className="w-full py-3 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <span>{submitting ? 'Confirming Appointment...' : 'Confirm Service Booking'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </form>
    </div>
  );
};

export default BookService;

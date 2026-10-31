import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Truck,
  CheckCircle2,
  Clock,
  KeyRound,
  MapPin,
  CalendarPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const PickupDrop = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pickupData, setPickupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState('');
  const [otpType, setOtpType] = useState('PICKUP');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (Array.isArray(res.data)) {
        const valetBookings = res.data.filter(b => b.requiresPickupDrop);
        setBookings(valetBookings);
        if (valetBookings.length > 0) {
          setSelectedBooking(valetBookings[0]);
          loadPickup(valetBookings[0].id);
        }
      }
    } catch (err) {
      toast.error('Failed to load valet bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadPickup = async (srId) => {
    try {
      const res = await api.get(`/pickups/service/${srId}`);
      setPickupData(res.data);
    } catch (err) {
      setPickupData(null);
    }
  };

  const handleSelect = (b) => {
    setSelectedBooking(b);
    loadPickup(b.id);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await api.post(`/pickups/service/${selectedBooking.id}/verify-otp`, {
        otp: otpInput,
        otpType
      });
      toast.success(`${otpType} OTP Handover Verified`);
      setOtpInput('');
      loadPickup(selectedBooking.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid handover verification code');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading concierge telemetry...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-black text-white">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Doorstep Valet Pickup & Drop</h1>
        <p className="text-xs text-neutral-400 mt-1">Concierge driver tracking and secure dual-OTP handover verification</p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-neutral-400">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Valet Requests</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Doorstep pickup and drop can be requested when scheduling your service appointment.
          </p>
          <Link
            to="/customer/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all mt-2"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book with Valet</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selector */}
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2">
            {bookings.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelect(b)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap border transition-all ${
                  selectedBooking?.id === b.id
                    ? 'bg-white text-black font-bold border-white'
                    : 'bg-[#09090B] border-white/10 text-neutral-400 hover:text-white hover:border-white/25'
                }`}
              >
                {b.vehicle?.manufacturer} {b.vehicle?.model} ({b.bookingReference})
              </button>
            ))}
          </div>

          {pickupData ? (
            <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Valet Status</span>
                  <p className="text-base font-bold text-white mt-0.5">{pickupData.status}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Driver</span>
                  <p className="text-sm font-semibold text-white">{pickupData.driverName || 'Assigned Driver'}</p>
                </div>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="p-4 rounded-xl bg-black border border-white/10 space-y-3">
                <h4 className="text-xs font-semibold text-white">Dual-OTP Secure Handover</h4>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={otpType}
                    onChange={(e) => setOtpType(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#09090B] border border-white/15 text-white text-xs font-mono"
                  >
                    <option value="PICKUP">Pickup Handover OTP</option>
                    <option value="DROP">Drop Delivery OTP</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#09090B] border border-white/15 text-white text-xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all"
                >
                  Verify Handover Code
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#09090B] border border-white/10 text-xs text-neutral-400">
              Concierge driver allocation is pending. You will receive an SMS when driver is dispatched.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PickupDrop;

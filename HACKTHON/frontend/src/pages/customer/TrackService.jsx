import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Activity,
  CheckCircle2,
  Clock,
  Car,
  CalendarPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = [
  'BOOKING_REQUESTED',
  'BOOKING_CONFIRMED',
  'VEHICLE_RECEIVED',
  'INSPECTION_IN_PROGRESS',
  'ESTIMATE_PENDING',
  'ESTIMATE_APPROVED',
  'REPAIR_IN_PROGRESS',
  'QUALITY_CHECK',
  'READY_FOR_DELIVERY',
  'COMPLETED'
];

const TrackService = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (Array.isArray(res.data)) {
        setBookings(res.data);
        if (res.data.length > 0) {
          setSelectedBooking(res.data[0]);
          loadHistory(res.data[0].id);
        }
      }
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (id) => {
    try {
      const res = await api.get(`/services/${id}/status-history`);
      if (Array.isArray(res.data)) setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (b) => {
    setSelectedBooking(b);
    loadHistory(b.id);
  };

  const getCurrentStageIndex = (status) => {
    const idx = STAGES.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading service status...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 rounded-2xl bg-[#09090B] border border-white/10 text-center space-y-3 bg-black text-white">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-neutral-400">
          <Car className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No Active Service Bookings</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Schedule an appointment to monitor your vehicle's live stage-by-stage repair progress.
        </p>
        <Link
          to="/customer/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all mt-2"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book a Service</span>
        </Link>
      </div>
    );
  }

  const currentIdx = selectedBooking ? getCurrentStageIndex(selectedBooking.status) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 bg-black text-white">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Live Service Tracking</h1>
        <p className="text-xs text-neutral-400 mt-1">Real-time transparent repair timeline with technician logs</p>
      </div>

      {/* Booking Selector Pills */}
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

      {selectedBooking && (
        <div className="space-y-6">
          
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400">
                {selectedBooking.serviceCenter?.name || 'Workshop Hub'}
              </span>
              <h2 className="text-xl font-bold text-white">
                {selectedBooking.vehicle?.manufacturer} {selectedBooking.vehicle?.model} ({selectedBooking.vehicle?.registrationNumber})
              </h2>
              <p className="text-xs text-neutral-400">
                Category: <span className="text-white font-medium">{selectedBooking.category?.name}</span> • Odometer: {Number(selectedBooking.currentOdometer || 0).toLocaleString()} KM
              </p>
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-neutral-400">Stage Status</span>
                <p className="text-sm font-bold font-mono text-white">{selectedBooking.status?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>

          {/* Visual Timeline Stepper */}
          <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 overflow-x-auto">
            <h3 className="text-xs font-mono uppercase text-neutral-400 mb-6">Repair Progression Stepper</h3>

            <div className="flex items-center justify-between min-w-[700px] relative">
              {/* Stepper connecting line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-white/10 -z-0"></div>

              {STAGES.map((st, i) => {
                const isPassed = i <= currentIdx;
                const isCurrent = i === currentIdx;

                return (
                  <div key={st} className="flex flex-col items-center text-center relative z-10 w-24">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all ${
                        isCurrent
                          ? 'bg-white text-black font-bold ring-4 ring-white/20'
                          : isPassed
                          ? 'bg-white/20 border border-white/40 text-white'
                          : 'bg-black border border-white/15 text-neutral-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        i + 1
                      )}
                    </div>

                    <p className={`text-[10px] mt-2 font-mono leading-tight ${isCurrent ? 'text-white font-bold' : isPassed ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {st.replace(/_/g, ' ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History Feed */}
          <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-4">
            <h3 className="text-xs font-mono uppercase text-neutral-400">Inspection & Audit History</h3>

            {history.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No stage updates logged yet</p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{h.toStatus?.replace(/_/g, ' ')}</span>
                      <p className="text-neutral-400 text-[11px] mt-0.5">{h.remarks || 'Stage advanced by technician'}</p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {h.createdAt ? new Date(h.createdAt).toLocaleTimeString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default TrackService;

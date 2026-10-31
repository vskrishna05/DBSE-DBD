import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calculator,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Car
} from 'lucide-react';
import toast from 'react-hot-toast';

const CostEstimator = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
          loadEstimate(res.data[0].id);
        }
      }
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadEstimate = async (srId) => {
    try {
      const res = await api.get(`/estimates/service/${srId}`);
      setEstimate(res.data);
    } catch (err) {
      setEstimate(null);
    }
  };

  const handleSelectBooking = (b) => {
    setSelectedBooking(b);
    loadEstimate(b.id);
  };

  const handleApprove = async () => {
    if (!estimate) return;
    setActionLoading(true);
    try {
      await api.patch(`/estimates/${estimate.id}/approve`, { customerNotes });
      toast.success('Cost estimate approved. Technician will proceed with repairs.');
      loadEstimate(selectedBooking.id);
    } catch (err) {
      toast.error('Error approving estimate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!estimate) return;
    setActionLoading(true);
    try {
      await api.patch(`/estimates/${estimate.id}/reject`, { customerNotes });
      toast.success('Cost estimate rejected. Workshop advisor will contact you.');
      loadEstimate(selectedBooking.id);
    } catch (err) {
      toast.error('Error rejecting estimate');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading quotations...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-black text-white">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Service Cost Estimates</h1>
        <p className="text-xs text-neutral-400 mt-1">Review line-item spare parts quotations, technician labor, and taxes</p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-neutral-400">
            <Calculator className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Active Quotations</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Estimates are generated once your vehicle has undergone preliminary physical inspection.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Booking Selector Pills */}
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2">
            {bookings.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBooking(b)}
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

          {estimate ? (
            <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Quotation Status</span>
                  <p className="text-lg font-bold text-white mt-0.5">{estimate.status}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Total Estimate</span>
                  <p className="text-2xl font-bold font-mono text-white">₹{Number(estimate.totalEstimatedCost).toLocaleString()}</p>
                </div>
              </div>

              {/* Estimate Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Parts Subtotal:</span>
                  <span className="font-mono text-white">₹{Number(estimate.partsCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Technician Labor:</span>
                  <span className="font-mono text-white">₹{Number(estimate.laborCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>GST (18%):</span>
                  <span className="font-mono text-white">₹{Number(estimate.taxAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-3 border-t border-white/10">
                  <span>Grand Total:</span>
                  <span className="font-mono">₹{Number(estimate.totalEstimatedCost || 0).toLocaleString()}</span>
                </div>
              </div>

              {estimate.status === 'PENDING_APPROVAL' && (
                <div className="pt-4 border-t border-white/10 flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Estimate</span>
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-white/5 border border-white/15 text-neutral-300 hover:text-white rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#09090B] border border-white/10 text-xs text-neutral-400">
              No formal estimate issued yet for this service booking.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CostEstimator;

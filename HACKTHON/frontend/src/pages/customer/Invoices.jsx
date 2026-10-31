import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileText,
  Download,
  CreditCard,
  Printer,
  Shield,
  X,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModalInvoice, setPayModalInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      if (Array.isArray(res.data)) {
        setInvoices(res.data);
      }
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (inv) => {
    try {
      toast.loading('Generating official PDF invoice...', { id: 'pdf' });
      const res = await api.get(`/invoices/${inv.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MechX-Invoice-${inv.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Tax invoice PDF downloaded', { id: 'pdf' });
    } catch (err) {
      toast.error('Failed to download invoice PDF', { id: 'pdf' });
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payModalInvoice) return;
    setProcessing(true);
    try {
      await api.post(`/invoices/${payModalInvoice.id}/pay`, {
        paymentMethod,
        notes: `Customer completed payment via ${paymentMethod}`
      });
      toast.success(`Payment of ₹${payModalInvoice.grandTotal} confirmed`);
      setPayModalInvoice(null);
      fetchInvoices();
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading tax invoices...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 bg-black text-white">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Billing & Tax Invoices</h1>
        <p className="text-xs text-neutral-400 mt-1">Official GST invoices and downloadable PDF receipts</p>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-neutral-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Invoices Issued</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Invoices are automatically generated when service quotations and repairs are completed.
            </p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="p-6 rounded-2xl bg-[#09090B] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-base text-white">{inv.invoiceNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/20 bg-white/5 text-white">
                    {inv.paymentStatus}
                  </span>
                </div>

                <p className="text-xs text-neutral-300">
                  Vehicle: <span className="font-medium text-white">{inv.serviceRequest?.vehicle?.manufacturer} {inv.serviceRequest?.vehicle?.model} ({inv.serviceRequest?.vehicle?.registrationNumber})</span>
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500 font-mono">
                  <span>Issued: {new Date(inv.issuedDate).toLocaleDateString()}</span>
                  <span>Labor: ₹{inv.laborCharges}</span>
                  <span>Parts: ₹{inv.partsTotal}</span>
                  <span>GST (18%): ₹{inv.gstAmount}</span>
                </div>
              </div>

              {/* Total & Action Buttons */}
              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-neutral-500">Grand Total</span>
                  <p className="text-xl font-bold font-mono text-white">₹{Number(inv.grandTotal).toFixed(2)}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadPdf(inv)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10 transition-all"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {inv.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => setPayModalInvoice(inv)}
                      className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Now</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Payment Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#09090B] border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Settle Invoice</h3>
              <button onClick={() => setPayModalInvoice(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/10 flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-mono">{payModalInvoice.invoiceNumber}</span>
              <span className="text-lg font-bold font-mono text-white">₹{Number(payModalInvoice.grandTotal).toFixed(2)}</span>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-white"
                >
                  <option value="UPI">UPI Instant (GPay / PhonePe / QR)</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="CASH">Cash on Delivery</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-neutral-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>{processing ? 'Processing...' : 'Authorize Payment'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

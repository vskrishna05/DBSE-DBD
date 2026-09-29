import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle, ArrowUpRight, IndianRupee, X } from 'lucide-react';
import { apiInvoices, apiPayments } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerInvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiInvoices.getAll(statusFilter || undefined);
      setInvoices(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    setPaying(true);
    try {
      await apiPayments.pay(invoiceId, 'CREDIT_CARD');
      showToast('Payment confirmed and recorded in audit ledger!', 'success');
      setSelectedInvoice(null);
      loadInvoices();
    } catch (err) {
      showToast(err.friendlyMessage || 'Payment processing failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  const filters = [
    { label: 'All Invoices', value: '' },
    { label: 'Issued / Pending', value: 'ISSUED' },
    { label: 'Paid & Settled', value: 'PAID' },
    { label: 'Overdue', value: 'OVERDUE' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Invoices & Billing Statements</h1>
          <p style={{ color: '#94a3b8' }}>Review itemized invoices, statutory taxes, and settlement records</p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.35rem', borderRadius: 'var(--radius-md)' }}>
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`btn btn-sm ${statusFilter === f.value ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#38bdf8', padding: '3rem' }}>Retrieving invoice records...</div>
        ) : invoices.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Subtotal (₹)</th>
                  <th>GST Tax (₹)</th>
                  <th>Total Payable (₹)</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {inv.invoice_number}
                    </td>
                    <td>₹{parseFloat(inv.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>₹{parseFloat(inv.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{parseFloat(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="btn btn-secondary btn-sm"
                        >
                          Details
                        </button>
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handlePayInvoice(inv.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <FileText size={36} style={{ margin: '0 auto 0.75rem' }} />
            <div>No matching invoice records found.</div>
          </div>
        )}
      </div>

      {/* Invoice Breakdown Modal */}
      {selectedInvoice && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '0.35rem' }}>Official Invoice</span>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)' }}>{selectedInvoice.invoice_number}</h2>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Issue Date:</span>{' '}
                <strong>{new Date(selectedInvoice.created_at).toLocaleDateString()}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Due Date:</span>{' '}
                <strong style={{ color: '#fbbf24' }}>{new Date(selectedInvoice.due_date).toLocaleDateString()}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Status:</span>{' '}
                <span className={`badge badge-${selectedInvoice.status.toLowerCase()}`}>{selectedInvoice.status}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Settlement Date:</span>{' '}
                <strong>{selectedInvoice.paid_date ? new Date(selectedInvoice.paid_date).toLocaleDateString() : 'Pending'}</strong>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
                Itemized Line Records:
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                {selectedInvoice.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                    <span>{item.description} (x{item.quantity})</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{parseFloat(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(selectedInvoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span>Regulatory GST Tax (5%):</span>
                  <span>₹{parseFloat(selectedInvoice.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <span>Total Amount Due:</span>
                  <span style={{ color: '#0284c7' }}>₹{parseFloat(selectedInvoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setSelectedInvoice(null)} className="btn btn-outline btn-sm">
                Close
              </button>
              {selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                <button
                  onClick={() => handlePayInvoice(selectedInvoice.id)}
                  disabled={paying}
                  className="btn btn-primary btn-sm"
                >
                  {paying ? 'Processing...' : `Settle ₹${parseFloat(selectedInvoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { FileText, PlusCircle, CheckCircle2, Clock, X, IndianRupee } from 'lucide-react';
import { apiInvoices, apiCustomers } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminInvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const [form, setForm] = useState({
    customer_id: '',
    description: 'Corporate Financial Consulting & Service Fee',
    quantity: 1,
    unit_price: '150.00',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invRes, custRes] = await Promise.all([
        apiInvoices.getAll(),
        apiCustomers.getAllAdmin(),
      ]);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
      if (custRes.data.length > 0 && !form.customer_id) {
        setForm((prev) => ({ ...prev, customer_id: custRes.data[0].id.toString() }));
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!form.customer_id) {
      showToast('Select a customer first', 'error');
      return;
    }

    setIssuing(true);
    try {
      const qty = parseInt(form.quantity);
      const price = parseFloat(form.unit_price);
      await apiInvoices.create({
        customer_id: parseInt(form.customer_id),
        items: [
          {
            description: form.description,
            quantity: qty,
            unit_price: price,
            line_total: qty * price,
          }
        ]
      });
      showToast('Invoice created and issued to client account!', 'success');
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      showToast(err.friendlyMessage || 'Invoice generation failed', 'error');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Invoices & Billing Hub</h1>
          <p style={{ color: '#94a3b8' }}>Portfolio-wide itemized billing records, tax calculations, and settlement status</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={customers.length === 0}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.4rem', background: 'linear-gradient(135deg, #10b981, #2563eb)' }}
        >
          <PlusCircle size={16} /> Issue Custom Invoice
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#10b981', padding: '3rem' }}>Retrieving invoices...</div>
        ) : invoices.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer ID</th>
                  <th>Subtotal (₹)</th>
                  <th>GST Tax (₹)</th>
                  <th>Total Amount (₹)</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{inv.invoice_number}</td>
                    <td>#CUST-{inv.customer_id.toString().padStart(4, '0')}</td>
                    <td>₹{parseFloat(inv.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>₹{parseFloat(inv.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{parseFloat(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td>{inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <FileText size={40} style={{ margin: '0 auto 0.75rem' }} />
            <div>No invoices issued for this institution yet.</div>
          </div>
        )}
      </div>

      {/* Issue Custom Invoice Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Issue Client Invoice</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="form-group">
                <label className="form-label">Target Customer</label>
                <select
                  required
                  className="form-control"
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Item Description</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-control"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    required
                    className="form-control"
                    value={form.unit_price}
                    onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={issuing} className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #10b981, #2563eb)' }}>
                  {issuing ? 'Generating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

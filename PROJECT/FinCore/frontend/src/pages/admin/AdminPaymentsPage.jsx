import React, { useEffect, useState } from 'react';
import { IndianRupee, CheckCircle2 } from 'lucide-react';
import { apiPayments } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminPaymentsPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await apiPayments.getAll();
      setPayments(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch payment settlements', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Portfolio Payment Records</h1>
        <p style={{ color: '#94a3b8' }}>Real-time settlement audits, transaction receipts, and payment method breakdowns</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#10b981', padding: '3rem' }}>Querying payment transactions...</div>
        ) : payments.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Reference</th>
                  <th>Customer ID</th>
                  <th>Invoice ID</th>
                  <th>Amount (₹)</th>
                  <th>Method</th>
                  <th>Gateway Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.payment_reference}</td>
                    <td>#CUST-{p.customer_id.toString().padStart(4, '0')}</td>
                    <td>#INV-{p.invoice_id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>{p.payment_method.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge badge-${p.status === 'SUCCESS' ? 'success' : 'danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{new Date(p.payment_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <IndianRupee size={40} style={{ margin: '0 auto 0.75rem' }} />
            <div>No customer payments processed yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { IndianRupee, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { apiPayments } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerPaymentsPage() {
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
      showToast(err.friendlyMessage || 'Failed to fetch payment ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Payment Transactions Ledger</h1>
        <p style={{ color: '#94a3b8' }}>Complete history of settled transactions and payment gateway receipts</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#38bdf8', padding: '3rem' }}>Querying payment records...</div>
        ) : payments.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Reference</th>
                  <th>Invoice ID</th>
                  <th>Amount (₹)</th>
                  <th>Method</th>
                  <th>Gateway Status</th>
                  <th>Settlement Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {p.payment_reference}
                    </td>
                    <td>#INV-{p.invoice_id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>
                      ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
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
            <IndianRupee size={36} style={{ margin: '0 auto 0.75rem' }} />
            <div>No payment settlements recorded yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}

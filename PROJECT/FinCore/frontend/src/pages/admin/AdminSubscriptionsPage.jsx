import React, { useEffect, useState } from 'react';
import { Layers, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { apiSubscriptions } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminSubscriptionsPage() {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const res = await apiSubscriptions.getAllAdmin();
      setSubscriptions(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Active & Historical Subscriptions</h1>
        <p style={{ color: '#94a3b8' }}>Portfolio-wide active customer enrollments, recurring billing cycles, and status</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#10b981', padding: '3rem' }}>Querying subscription table...</div>
        ) : subscriptions.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subscription ID</th>
                  <th>Customer ID</th>
                  <th>Plan Tier</th>
                  <th>Cycle</th>
                  <th>Auto Renew</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>#SUB-{sub.id.toString().padStart(4, '0')}</td>
                    <td>#CUST-{sub.customer_id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{sub.plan?.name || `Plan #${sub.plan_id}`}</td>
                    <td>{sub.plan?.billing_cycle || 'monthly'}</td>
                    <td>{sub.auto_renew ? 'Yes' : 'No'}</td>
                    <td>
                      <span className={`badge badge-${sub.status.toLowerCase()}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                    <td>{new Date(sub.end_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Layers size={40} style={{ margin: '0 auto 0.75rem' }} />
            <div>No customer subscriptions registered yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Calendar, Check, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { apiSubscriptions } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerSubscriptionPage() {
  const { showToast } = useToast();
  const [activeSub, setActiveSub] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const [activeRes, histRes] = await Promise.all([
        apiSubscriptions.getActive(),
        apiSubscriptions.getHistory(),
      ]);
      setActiveSub(activeRes.data);
      setHistory(histRes.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load subscription status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await apiSubscriptions.cancel();
      showToast('Subscription has been cancelled.', 'info');
      setShowCancelModal(false);
      loadSubscriptions();
    } catch (err) {
      showToast(err.friendlyMessage || 'Cancellation failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#38bdf8', padding: '3rem', textAlign: 'center' }}>Loading subscription details...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>My Subscription</h1>
          <p style={{ color: '#94a3b8' }}>Manage your active banking tier, renewals, and plan benefits</p>
        </div>
        <Link to="/customer/plans" className="btn btn-primary btn-sm">
          Browse All Plans <ArrowRight size={15} />
        </Link>
      </div>

      {/* Active Subscription Card */}
      {activeSub ? (
        <div className="card" style={{ marginBottom: '2.5rem', background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.08), var(--bg-surface))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.6rem' }}>{activeSub.plan?.name}</h2>
                <span className="badge badge-active">{activeSub.status}</span>
                <span className="badge badge-info">{activeSub.plan?.code}</span>
              </div>
              <p style={{ color: '#94a3b8', maxWidth: '600px' }}>
                {activeSub.plan?.description || 'Active subscription conferring core banking perks.'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                ₹{parseFloat(activeSub.plan?.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Billed {activeSub.plan?.billing_cycle}</div>
            </div>
          </div>

          {/* Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Subscription Started</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{new Date(activeSub.start_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Renewal / Expiry Date</div>
              <div style={{ fontWeight: 600, marginTop: '2px', color: '#fbbf24' }}>{new Date(activeSub.end_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Auto-Renew</div>
              <div style={{ fontWeight: 600, marginTop: '2px', color: activeSub.auto_renew ? '#34d399' : '#fb7185' }}>
                {activeSub.auto_renew ? 'Active' : 'Disabled'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Loan Interest Discount</div>
              <div style={{ fontWeight: 700, marginTop: '2px', color: '#34d399' }}>
                {parseFloat(activeSub.plan?.interest_discount_rate || 0).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Features List */}
          {activeSub.plan?.features && activeSub.plan.features.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem' }}>
                Enrolled Tier Features:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {activeSub.plan.features.map((f) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    <Check size={16} color="#38bdf8" />
                    <span>{f.feature_label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <Link to="/customer/plans" className="btn btn-secondary btn-sm">
              Change / Upgrade Plan
            </Link>
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn btn-danger btn-sm"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', marginBottom: '2.5rem' }}>
          <Layers size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Active Plan Selected</h2>
          <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Subscribe to an institutional tier to unlock lower borrowing interest rates, automated invoice schedules, and higher transaction limits.
          </p>
          <Link to="/customer/plans" className="btn btn-primary">
            Explore Available Plans <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Subscription History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Subscription Ledger & History</h3>
        </div>
        {history.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subscription ID</th>
                  <th>Plan Tier</th>
                  <th>Billing Cycle</th>
                  <th>Tier Price (₹)</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>#SUB-{sub.id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{sub.plan?.name || `Plan #${sub.plan_id}`}</td>
                    <td>{sub.plan?.billing_cycle || 'monthly'}</td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(sub.plan?.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No prior subscription records on ledger.
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fb7185', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.25rem' }}>Cancel Subscription Confirmation</h3>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Are you sure you wish to cancel your <strong>{activeSub?.plan?.name}</strong> subscription? Your rate discount benefits will terminate at the end of the billing period.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn btn-outline btn-sm"
              >
                Keep Active
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="btn btn-danger btn-sm"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

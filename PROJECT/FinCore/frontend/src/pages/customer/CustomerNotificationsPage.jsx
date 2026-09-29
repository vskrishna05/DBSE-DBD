import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, ShieldAlert, CreditCard, Info, IndianRupee } from 'lucide-react';
import { apiNotifications } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerNotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await apiNotifications.getAll();
      setNotifications(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await apiNotifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n))
      );
    } catch (e) {
      // quiet fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiNotifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
      showToast('All notifications marked as read', 'info');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BILLING': return <CreditCard size={18} color="#38bdf8" />;
      case 'LOAN': return <IndianRupee size={18} color="#10b981" />;
      case 'SECURITY': return <ShieldAlert size={18} color="#f43f5e" />;
      default: return <Info size={18} color="#8b5cf6" />;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Security & Billing Alerts</h1>
          <p style={{ color: '#94a3b8' }}>Real-time audit alerts, billing dispatches, and account notifications</p>
        </div>
        {notifications.some((n) => n.status === 'UNREAD') && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <CheckCircle2 size={15} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#38bdf8', padding: '3rem' }}>Checking notification center...</div>
        ) : notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => n.status === 'UNREAD' && handleMarkRead(n.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: n.status === 'UNREAD' ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-surface-elevated)',
                  border: n.status === 'UNREAD' ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid var(--border-subtle)',
                  cursor: n.status === 'UNREAD' ? 'pointer' : 'default',
                  transition: 'background 150ms'
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={18} color={n.status === 'UNREAD' ? '#38bdf8' : '#64748b'} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: n.status === 'UNREAD' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {n.title}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{n.message}</p>
                </div>

                {n.status === 'UNREAD' && (
                  <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>NEW</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Bell size={36} style={{ margin: '0 auto 0.75rem' }} />
            <div>No alerts in your notification queue.</div>
          </div>
        )}
      </div>
    </div>
  );
}

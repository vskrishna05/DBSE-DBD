import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, Filter, Code2, Eye, X } from 'lucide-react';
import { apiAuditLogs } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminAuditLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [inspectMetadata, setInspectMetadata] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [entityFilter, actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (entityFilter) params.entity = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await apiAuditLogs.getAll(params);
      setLogs(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch audit trail', 'error');
    } finally {
      setLoading(false);
    }
  };

  const entities = ['', 'customers', 'plans', 'subscriptions', 'invoices', 'payments', 'loans', 'admins'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Non-Repudiation Security & Audit Trail</h1>
          <p style={{ color: '#94a3b8' }}>Immutable audit ledger recording system events, administrative modifications, and financial settlements</p>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="">All Entities</option>
            {entities.filter(Boolean).map((ent) => (
              <option key={ent} value={ent}>{ent.toUpperCase()}</option>
            ))}
          </select>

          <input
            type="text"
            className="form-control"
            placeholder="Filter action (e.g. LOGIN, PAY)..."
            style={{ width: '220px' }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#10b981', padding: '3rem' }}>Querying audit database...</div>
        ) : logs.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp (UTC)</th>
                  <th>Actor Role</th>
                  <th>Actor ID</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Entity ID</th>
                  <th>Audit Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {new Date(log.created_at).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td>
                      <span className={`badge ${log.actor_type === 'ADMIN' ? 'badge-info' : log.actor_type === 'CUSTOMER' ? 'badge-success' : 'badge-warning'}`}>
                        {log.actor_type}
                      </span>
                    </td>
                    <td>{log.actor_id ? `#${log.actor_id}` : 'SYSTEM'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</td>
                    <td><code style={{ color: '#0284c7' }}>{log.entity}</code></td>
                    <td>{log.entity_id ? `#${log.entity_id}` : '—'}</td>
                    <td>
                      {log.metadata_json ? (
                        <button
                          onClick={() => setInspectMetadata({ action: log.action, raw: log.metadata_json })}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.3rem' }}
                        >
                          <Eye size={12} /> Inspect JSON
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <ShieldAlert size={40} style={{ margin: '0 auto 0.75rem' }} />
            <div>No matching audit records found.</div>
          </div>
        )}
      </div>

      {/* Metadata Inspector Modal */}
      {inspectMetadata && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={18} color="#38bdf8" /> Audit Event Payload: {inspectMetadata.action}
              </h3>
              <button
                onClick={() => setInspectMetadata(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <pre style={{
              background: '#070913',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              color: '#34d399',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              overflowX: 'auto',
              maxHeight: '350px'
            }}>
              {JSON.stringify(JSON.parse(inspectMetadata.raw), null, 2)}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setInspectMetadata(null)} className="btn btn-outline btn-sm">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

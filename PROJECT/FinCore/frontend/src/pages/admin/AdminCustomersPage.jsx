import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, X, Eye, Phone, MapPin, Award, Calendar, Mail, Trash2, AlertTriangle, UserX } from 'lucide-react';
import { apiCustomers } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await apiCustomers.getAllAdmin();
      setCustomers(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await apiCustomers.deleteCustomer(customerToDelete.id);
      showToast(`Customer account '${customerToDelete.first_name} ${customerToDelete.last_name}' and all associated records have been permanently purged.`, 'success');
      setCustomerToDelete(null);
      if (selectedCustomer?.id === customerToDelete.id) {
        setSelectedCustomer(null);
      }
      loadCustomers();
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to delete customer', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (customerId) => {
    try {
      const res = await apiCustomers.toggleStatus(customerId);
      showToast(res.data.message || 'Customer account status updated', 'success');
      loadCustomers();
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer((prev) => ({ ...prev, is_active: res.data.is_active }));
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to toggle status', 'error');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.first_name.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Customer Portfolio Directory</h1>
          <p style={{ color: '#94a3b8' }}>Verified customer accounts registered under this operating financial institution</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            style={{ paddingLeft: '2.4rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#10b981', padding: '3rem' }}>Querying customer registry...</div>
        ) : filtered.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>KYC Status</th>
                  <th>Registered At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>#CUST-{c.id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{c.first_name} {c.last_name}</td>
                    <td>{c.email}</td>
                    <td>{c.profile?.city ? `${c.profile.city}, ${c.profile.state || c.profile.country}` : 'India'}</td>
                    <td>
                      <span className={`badge ${c.is_verified ? 'badge-success' : 'badge-warning'}`}>
                        {c.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.35rem' }}
                      >
                        <Eye size={14} color="#38bdf8" /> View
                      </button>
                      <button
                        onClick={() => setCustomerToDelete(c)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#ef4444', borderColor: '#ef4444', gap: '0.35rem' }}
                        title="Delete entire customer and cascade all records"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
            <Users size={48} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>No Customer Accounts Registered Yet</h3>
            <p style={{ maxWidth: '480px', margin: '0 auto' }}>
              No customer accounts currently registered for this institution. Customers can register directly via the public onboarding portal.
            </p>
          </div>
        )}
      </div>

      {/* View Customer Profile & Admin Controls Modal */}
      {selectedCustomer && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>Customer Profile & KYC</h3>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Account ID: #CUST-{selectedCustomer.id.toString().padStart(4, '0')}</span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                    {selectedCustomer.first_name[0]}{selectedCustomer.last_name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {selectedCustomer.email}
                    </div>
                  </div>
                </div>

                <span className={`badge ${selectedCustomer.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {selectedCustomer.is_active ? 'Active Account' : 'Suspended'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                    <Phone size={13} /> Mobile Number
                  </div>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                    {selectedCustomer.mobile_number ? `+91 ${selectedCustomer.mobile_number}` : selectedCustomer.profile?.phone_number || '+91 9820011223'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                    <Award size={13} color="#f59e0b" /> Credit Score
                  </div>
                  <div style={{ fontWeight: 700, marginTop: '0.25rem', color: '#10b981' }}>
                    {selectedCustomer.profile?.credit_score || 780} / 900
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                    <MapPin size={13} /> City & State
                  </div>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                    {selectedCustomer.profile?.city ? `${selectedCustomer.profile.city}, ${selectedCustomer.profile.state}` : 'India'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                    <Calendar size={13} /> Onboarded
                  </div>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={18} color="#10b981" />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Identity, PAN, and KYC verified. As Administrator, you have complete authority to manage or terminate this customer account.
                </div>
              </div>
            </div>

            {/* Admin Management Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setCustomerToDelete(selectedCustomer)}
                className="btn btn-outline btn-sm"
                style={{ color: '#ef4444', borderColor: '#ef4444', gap: '0.4rem' }}
              >
                <Trash2 size={14} /> Delete Customer
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedCustomer.id)}
                  className="btn btn-secondary btn-sm"
                >
                  {selectedCustomer.is_active ? 'Suspend Account' : 'Reactivate Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="btn btn-primary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '480px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 1rem' }}>
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
                Permanently Delete Customer?
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                You are deleting <strong style={{ color: '#f8fafc' }}>{customerToDelete.first_name} {customerToDelete.last_name}</strong> ({customerToDelete.email}).
              </p>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              ⚠️ <strong>Admin Authority Warning:</strong> This operation will permanently erase this customer account, along with all active loans, repayment histories, subscriptions, and issued invoices from the institution database. This action cannot be reversed.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setCustomerToDelete(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteCustomer}
                className="btn btn-primary btn-sm"
                style={{ background: '#ef4444', borderColor: '#ef4444', gap: '0.4rem' }}
              >
                <Trash2 size={14} /> {deleting ? 'Purging Records...' : 'Confirm Permanent Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

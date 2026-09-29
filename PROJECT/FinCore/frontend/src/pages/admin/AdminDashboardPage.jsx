import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Layers,
  IndianRupee,
  TrendingDown,
  FileText,
  BarChart3,
  Building,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { apiAnalytics } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await apiAnalytics.getAdminSummary();
      setData(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch admin portfolio analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#10b981', padding: '3rem', textAlign: 'center' }}>Aggregating tenant financial analytics...</div>;
  }

  const {
    company_name,
    total_customers,
    active_subscriptions,
    total_revenue,
    pending_invoices_count,
    pending_invoices_amount,
    active_loans_count,
    total_loan_outstanding,
    total_interest_accrued,
    monthly_revenue_trend,
    recent_transactions
  } = data || {};

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>{company_name} Analytics</h1>
          <p style={{ color: '#94a3b8' }}>Real-time subscription billing, loan exposure, and regulatory audit overview</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/plans" className="btn btn-secondary btn-sm">
            <PlusCircle size={15} /> Create Plan
          </Link>
          <Link to="/admin/loans" className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #10b981, #2563eb)' }}>
            <TrendingDown size={15} /> Sanction Loan
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-glow': 'rgba(16, 185, 129, 0.2)' }}>
          <span className="stat-label">Total Portfolio Customers</span>
          <div className="stat-value" style={{ color: '#34d399' }}>{total_customers}</div>
          <span className="stat-subtext">Active enrolled clients</span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(56, 189, 248, 0.2)' }}>
          <span className="stat-label">Active Subscriptions</span>
          <div className="stat-value" style={{ color: '#38bdf8' }}>{active_subscriptions}</div>
          <span className="stat-subtext">Recurring billing tiers</span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(16, 185, 129, 0.2)' }}>
          <span className="stat-label">Settled Revenue</span>
          <div className="stat-value" style={{ color: '#34d399' }}>
            ₹{parseFloat(total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-subtext">Cumulative payments received</span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(245, 158, 11, 0.2)' }}>
          <span className="stat-label">Pending Invoices</span>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            ₹{parseFloat(pending_invoices_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-subtext">{pending_invoices_count} invoices awaiting settlement</span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(139, 92, 246, 0.2)' }}>
          <span className="stat-label">Loan Capital Outstanding</span>
          <div className="stat-value" style={{ color: '#c084fc' }}>
            ₹{parseFloat(total_loan_outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-subtext">{active_loans_count} active credit accounts</span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(56, 189, 248, 0.2)' }}>
          <span className="stat-label">Interest Accrued</span>
          <div className="stat-value" style={{ color: '#38bdf8' }}>
            ₹{parseFloat(total_interest_accrued || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-subtext">Amortized interest generated</span>
        </div>
      </div>

      {/* Analytics Chart & Exposure Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Revenue Collection (₹)</h3>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_revenue_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131b31', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="revenue" name="Revenue Collected (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operations Strip */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Operational Hub</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link
              to="/admin/customers"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={18} color="#0284c7" />
                <div>
                  <div style={{ fontWeight: 600 }}>Customer Directory</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage accounts and verify documents</div>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/admin/plans"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Layers size={18} color="#10b981" />
                <div>
                  <div style={{ fontWeight: 600 }}>Plan Configuration</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Create pricing tiers & rate discounts</div>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/admin/invoices"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={18} color="#f59e0b" />
                <div>
                  <div style={{ fontWeight: 600 }}>Invoices & Billing Hub</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Issue custom itemized statements</div>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Settlements Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Settled Transactions</h3>
          <Link to="/admin/payments" style={{ fontSize: '0.85rem' }}>All Payments</Link>
        </div>

        {recent_transactions && recent_transactions.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Ref</th>
                  <th>Customer ID</th>
                  <th>Invoice ID</th>
                  <th>Amount (₹)</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recent_transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{tx.payment_reference}</td>
                    <td>#CUST-{tx.customer_id.toString().padStart(4, '0')}</td>
                    <td>#INV-{tx.invoice_id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>{tx.payment_method}</td>
                    <td><span className="badge badge-success">{tx.status}</span></td>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
            No transaction records processed yet.
          </div>
        )}
      </div>
    </div>
  );
}

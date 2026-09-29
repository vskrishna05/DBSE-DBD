import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  IndianRupee,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Building2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { apiAnalytics, apiPayments } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerDashboardPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await apiAnalytics.getCustomerSummary();
      setSummary(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    setPayingInvoiceId(invoiceId);
    try {
      await apiPayments.pay(invoiceId, 'CREDIT_CARD');
      showToast('Payment settled successfully! Invoice marked as PAID.', 'success');
      loadDashboard();
    } catch (err) {
      showToast(err.friendlyMessage || 'Payment processing failed', 'error');
    } finally {
      setPayingInvoiceId(null);
    }
  };

  if (loading) {
    return <div style={{ color: '#38bdf8', padding: '3rem', textAlign: 'center' }}>Loading your financial portfolio...</div>;
  }

  const { customer, subscription, total_outstanding, next_payment_due, loan, recent_invoices, recent_payments, monthly_trends } = summary || {};

  return (
    <div>
      {/* Welcome & Overview Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>
            Welcome back, {customer?.full_name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            <Building2 size={16} color="#38bdf8" />
            <span>Customer of <strong>{customer?.company_name}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/customer/plans" className="btn btn-secondary btn-sm">
            <CreditCard size={15} /> Browse Plans
          </Link>
          <Link to="/customer/invoices" className="btn btn-primary btn-sm">
            <FileText size={15} /> View Invoices
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-glow': 'rgba(56, 189, 248, 0.2)' }}>
          <span className="stat-label">Active SaaS Tier</span>
          <div className="stat-value" style={{ color: '#38bdf8' }}>
            {subscription ? subscription.name : 'No Active Plan'}
          </div>
          <span className="stat-subtext">
            {subscription ? `₹${parseFloat(subscription.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / ${subscription.billing_cycle}` : 'Select a subscription plan'}
          </span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(244, 63, 94, 0.2)' }}>
          <span className="stat-label">Total Outstanding</span>
          <div className="stat-value" style={{ color: total_outstanding > 0 ? '#fb7185' : '#34d399' }}>
            ₹{total_outstanding ? parseFloat(total_outstanding).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="stat-subtext">
            {total_outstanding > 0 ? 'Pending invoice settlements' : 'All accounts settled'}
          </span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(245, 158, 11, 0.2)' }}>
          <span className="stat-label">Upcoming Payment</span>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {next_payment_due ? `₹${parseFloat(next_payment_due.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
          </div>
          <span className="stat-subtext">
            {next_payment_due ? `Due: ${new Date(next_payment_due.due_date).toLocaleDateString()}` : 'No upcoming deadlines'}
          </span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(139, 92, 246, 0.2)' }}>
          <span className="stat-label">Active Loan Balance</span>
          <div className="stat-value" style={{ color: '#c084fc' }}>
            {loan && loan.status === 'ACTIVE'
              ? `₹${parseFloat(loan.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : loan && loan.status === 'PENDING'
              ? 'Pending Review'
              : '₹0.00'}
          </div>
          <span className="stat-subtext">
            {loan && loan.status === 'ACTIVE'
              ? `Rate: ${loan.effective_interest_rate.toFixed(2)}% APR`
              : loan && loan.status === 'PENDING'
              ? `₹${parseFloat(loan.principal_amount).toLocaleString('en-IN')} pending bank verification`
              : 'No active borrowings'}
          </span>
        </div>
      </div>

      {/* Grid: Charts & Loan Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Monthly Billing & Paid Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Invoicing vs Settlement</h3>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131b31', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="billed" name="Total Invoiced (₹)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Total Settled (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Loan & Subscription Perk Banner */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h3 className="card-title">Credit & Loan Facilities</h3>
            <Link to="/customer/loans" style={{ fontSize: '0.85rem' }}>View Ledger</Link>
          </div>

          {loan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account: {loan.loan_account_number}</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{parseFloat(loan.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                {loan.status === 'PENDING' ? (
                  <span className="badge badge-warning" style={{ fontWeight: 700 }}>
                    Pending for Verification
                  </span>
                ) : (
                  <span className="badge badge-active">{loan.status}</span>
                )}
              </div>

              {/* Repayment Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <span>Repaid: ₹{parseFloat(loan.total_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span>Sanctioned: ₹{parseFloat(loan.principal_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                      width: `${Math.min(100, (loan.total_paid / loan.principal_amount) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {subscription && subscription.interest_discount_rate > 0 && (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399', fontSize: '0.85rem' }}>
                  <Zap size={18} />
                  <span>
                    Your <strong>{subscription.name}</strong> grants a <strong>{subscription.interest_discount_rate.toFixed(2)}%</strong> interest discount!
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <Link to="/customer/loans" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  Make Repayment <ArrowRight size={14} />
                </Link>
                <Link to="/customer/loans" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Apply for Loan <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', margin: 'auto 0' }}>
              <TrendingDown size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <div>No active loans on file.</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem', marginBottom: '1rem' }}>
                Sanctioned and issued directly with your subscription discount.
              </div>
              <Link to="/customer/loans" className="btn btn-primary btn-sm">
                Apply for Loan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Invoices</h3>
          <Link to="/customer/invoices" style={{ fontSize: '0.85rem' }}>View All Invoices</Link>
        </div>

        {recent_invoices && recent_invoices.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Total Amount (₹)</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent_invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{inv.invoice_number}</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(inv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td>
                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' ? (
                        <button
                          onClick={() => handlePayInvoice(inv.id)}
                          disabled={payingInvoiceId === inv.id}
                          className="btn btn-primary btn-sm"
                        >
                          {payingInvoiceId === inv.id ? 'Processing...' : 'Pay Now'}
                        </button>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={15} /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No invoices generated yet.
          </div>
        )}
      </div>
    </div>
  );
}

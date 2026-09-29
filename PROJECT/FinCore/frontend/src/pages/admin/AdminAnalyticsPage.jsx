import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, IndianRupee, Layers, Users, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { apiAnalytics } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await apiAnalytics.getAdminSummary();
      setData(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to aggregate analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#10b981', padding: '3rem', textAlign: 'center' }}>Compiling institution financial reports...</div>;
  }

  const {
    company_name,
    total_customers,
    active_subscriptions,
    total_revenue,
    pending_invoices_amount,
    total_loan_outstanding,
    total_interest_accrued,
    monthly_revenue_trend
  } = data || {};

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Financial Analytics & Portfolio Health</h1>
        <p style={{ color: '#94a3b8' }}>Live institutional metrics for {company_name} powered by MySQL 8.0 views</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-glow': 'rgba(16, 185, 129, 0.2)' }}>
          <span className="stat-label">Total Cash Collected</span>
          <div className="stat-value" style={{ color: '#34d399' }}>
            ₹{parseFloat(total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-subtext">Net realized SaaS revenues</span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(56, 189, 248, 0.2)' }}>
          <span className="stat-label">Pending Receivables</span>
          <div className="stat-value" style={{ color: '#38bdf8' }}>
            ₹{parseFloat(pending_invoices_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-subtext">Issued invoices awaiting payment</span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(139, 92, 246, 0.2)' }}>
          <span className="stat-label">Active Capital Deployed</span>
          <div className="stat-value" style={{ color: '#c084fc' }}>
            ₹{parseFloat(total_loan_outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-subtext">Outstanding loan principal balance</span>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(245, 158, 11, 0.2)' }}>
          <span className="stat-label">Total Accrued Interest</span>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            ₹{parseFloat(total_interest_accrued || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-subtext">Yield on credit facilities</span>
        </div>
      </div>

      {/* Primary Chart */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Rolling Monthly Inflow (₹)</h3>
        </div>
        <div style={{ height: 320, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly_revenue_trend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#131b31', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="revenue" name="Total Inflow (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Database Performance Explanation */}
      <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
          <ShieldCheck size={18} /> High-Throughput SQL Optimization & Indexing
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
          These aggregations leverage database views <code style={{ color: '#38bdf8' }}>view_company_revenue_analytics</code> and composite indexes on <code style={{ color: '#38bdf8' }}>(customer_id, status)</code>. This ensures high-throughput performance across millions of transactions without full-table scans.
        </p>
      </div>
    </div>
  );
}

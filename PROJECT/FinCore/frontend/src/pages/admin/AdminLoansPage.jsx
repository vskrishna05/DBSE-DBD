import React, { useEffect, useState } from 'react';
import { TrendingDown, CheckCircle2, IndianRupee, X, AlertCircle, Clock, FileText, ShieldCheck, Sliders } from 'lucide-react';
import { apiLoans, apiCustomers } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminLoansPage() {
  const { showToast } = useToast();
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [limits, setLimits] = useState({ min_loan_amount: 25000, max_loan_amount: 2500000, company_name: '' });
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [limitsForm, setLimitsForm] = useState({ min_loan_amount: '25000', max_loan_amount: '2500000' });
  const [savingLimits, setSavingLimits] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loanRes, custRes, limitsRes] = await Promise.all([
        apiLoans.getAll(),
        apiCustomers.getAllAdmin(),
        apiLoans.getLimits().catch(() => ({ data: null })),
      ]);
      setLoans(loanRes.data);
      setCustomers(custRes.data);
      if (limitsRes?.data) {
        setLimits({
          min_loan_amount: parseFloat(limitsRes.data.min_loan_amount),
          max_loan_amount: parseFloat(limitsRes.data.max_loan_amount),
          company_name: limitsRes.data.company_name
        });
        setLimitsForm({
          min_loan_amount: limitsRes.data.min_loan_amount.toString(),
          max_loan_amount: limitsRes.data.max_loan_amount.toString()
        });
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch loans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLimits = async (e) => {
    e.preventDefault();
    setSavingLimits(true);
    try {
      const res = await apiLoans.updateLimits({
        min_loan_amount: parseFloat(limitsForm.min_loan_amount),
        max_loan_amount: parseFloat(limitsForm.max_loan_amount)
      });
      setLimits({
        min_loan_amount: parseFloat(res.data.min_loan_amount),
        max_loan_amount: parseFloat(res.data.max_loan_amount),
        company_name: res.data.company_name
      });
      showToast(`Institution loan ceiling updated: Up to ₹${parseFloat(res.data.max_loan_amount).toLocaleString('en-IN')}`, 'success');
      setShowLimitsModal(false);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to update loan limits', 'error');
    } finally {
      setSavingLimits(false);
    }
  };

  const handleConfirmLoan = async (loanId, loanAcc) => {
    setProcessingId(loanId);
    try {
      await apiLoans.confirm(loanId);
      showToast(`Loan facility ${loanAcc} confirmed, verified, and sanctioned! Funds disbursed.`, 'success');
      loadData();
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to confirm loan', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectLoan = async (loanId, loanAcc) => {
    if (!window.confirm(`Are you sure you want to reject loan application ${loanAcc}?`)) return;
    setProcessingId(loanId);
    try {
      await apiLoans.reject(loanId, 'Documentation criteria not fulfilled');
      showToast(`Loan application ${loanAcc} rejected.`, 'info');
      loadData();
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to reject loan', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getCustomerName = (customerId) => {
    const cust = customers.find((c) => c.id === customerId);
    return cust ? `${cust.first_name} ${cust.last_name}` : `#CUST-${customerId.toString().padStart(4, '0')}`;
  };

  const pendingLoans = loans.filter((l) => l.status === 'PENDING');
  const activeLoans = loans.filter((l) => l.status !== 'PENDING');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Loan Facilities & Verification Desk</h1>
          <p style={{ color: '#94a3b8' }}>Review customer loan applications, verify documentation, confirm sanctions, and manage credit lines.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowLimitsModal(true)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          >
            <Sliders size={16} /> Configure Loan Limits (₹{limits.min_loan_amount.toLocaleString('en-IN')} - ₹{limits.max_loan_amount.toLocaleString('en-IN')})
          </button>
          <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
            {pendingLoans.length} Applications Pending
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
            {activeLoans.length} Active Facilities
          </span>
        </div>
      </div>

      {/* PENDING LOAN APPLICATIONS SECTION */}
      {pendingLoans.length > 0 && (
        <div className="card" style={{ marginBottom: '2.5rem', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.5rem', borderRadius: '50%', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f59e0b' }}>
                Pending Customer Loan Applications ({pendingLoans.length})
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Submitted by customers with attached verification documents awaiting administrator sanction.
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Customer Name</th>
                  <th>Requested Amount (₹)</th>
                  <th>Tenure</th>
                  <th>Effective Rate</th>
                  <th>Purpose & Attached Docs</th>
                  <th>Applied On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLoans.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                      {l.loan_account_number}
                    </td>
                    <td style={{ fontWeight: 600 }}>{getCustomerName(l.customer_id)}</td>
                    <td style={{ fontWeight: 700, fontSize: '1rem', color: '#10b981' }}>
                      ₹{parseFloat(l.principal_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>{l.term_months} Months</td>
                    <td style={{ color: '#38bdf8', fontWeight: 700 }}>
                      {parseFloat(l.effective_interest_rate).toFixed(2)}% APR
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={14} color="#38bdf8" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.purpose || 'Working Capital'}
                        </span>
                      </div>
                    </td>
                    <td>{new Date(l.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleConfirmLoan(l.id, l.loan_account_number)}
                          disabled={processingId === l.id}
                          className="btn btn-primary btn-sm"
                          style={{ background: '#10b981', borderColor: '#10b981', gap: '0.35rem' }}
                        >
                          <CheckCircle2 size={14} /> Confirm & Disburse
                        </button>
                        <button
                          onClick={() => handleRejectLoan(l.id, l.loan_account_number)}
                          disabled={processingId === l.id}
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: '#f43f5e', color: '#f43f5e', gap: '0.35rem' }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVE & HISTORICAL PORTFOLIOS */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Sanctioned Borrowing Facilities</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active loans undergoing repayment installments and interest amortization</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#10b981', padding: '3rem' }}>Querying loan records...</div>
        ) : activeLoans.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Customer Name</th>
                  <th>Sanctioned Principal (₹)</th>
                  <th>Effective Rate</th>
                  <th>Current Balance (₹)</th>
                  <th>Total Repaid (₹)</th>
                  <th>Status</th>
                  <th>Disbursal Date</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{l.loan_account_number}</td>
                    <td>{getCustomerName(l.customer_id)}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{parseFloat(l.principal_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: '#38bdf8', fontWeight: 700 }}>
                      {parseFloat(l.effective_interest_rate).toFixed(2)}%
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{parseFloat(l.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>
                      ₹{parseFloat(l.total_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge badge-${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>{l.disbursed_at ? new Date(l.disbursed_at).toLocaleDateString() : new Date(l.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <TrendingDown size={40} style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No active credit facilities yet.</div>
            <div style={{ fontSize: '0.85rem' }}>Customer loan applications will appear above for administrator confirmation.</div>
          </div>
        )}
      </div>

      {/* Modal to configure institution borrowing limits */}
      {showLimitsModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="#0284c7" />
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Configure Institution Loan Limits</h3>
              </div>
              <button
                onClick={() => setShowLimitsModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Set the minimum and maximum borrowing amounts that customers can request from <strong>{limits.company_name || 'your FinTech Bank'}</strong>.
            </p>

            <form onSubmit={handleSaveLimits}>
              <div className="form-group">
                <label className="form-label">Minimum Loan Amount (Floor in ₹) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  className="form-control"
                  value={limitsForm.min_loan_amount}
                  onChange={(e) => setLimitsForm({ ...limitsForm, min_loan_amount: e.target.value })}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                  Default is ₹25,000. Customers cannot apply below this amount.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Maximum Loan Ceiling (Limit in ₹) *</label>
                <input
                  type="number"
                  min="50000"
                  step="50000"
                  required
                  className="form-control"
                  value={limitsForm.max_loan_amount}
                  onChange={(e) => setLimitsForm({ ...limitsForm, max_loan_amount: e.target.value })}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                  Default is ₹25,00,000 (25 Lakhs). Set higher or lower based on your institution's risk capacity.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[500000, 1000000, 2500000, 5000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLimitsForm({ ...limitsForm, max_loan_amount: amt.toString() })}
                    style={{
                      background: parseFloat(limitsForm.max_loan_amount) === amt ? 'var(--accent-blue)' : 'var(--bg-surface-elevated)',
                      color: parseFloat(limitsForm.max_loan_amount) === amt ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.3rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Set Max: ₹{amt >= 100000 ? `${amt / 100000} Lakhs` : amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowLimitsModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLimits}
                  className="btn btn-primary btn-sm"
                >
                  {savingLimits ? 'Saving...' : 'Save Borrowing Limits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

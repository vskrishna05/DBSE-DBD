import React, { useEffect, useState } from 'react';
import { TrendingDown, Zap, IndianRupee, Calendar, ArrowRight, CheckCircle2, X, AlertCircle, PlusCircle, Clock, Upload, FileText } from 'lucide-react';
import { apiLoans, apiSubscriptions } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerLoansPage() {
  const { showToast } = useToast();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Repayment Modal
  const [repayLoanTarget, setRepayLoanTarget] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [submittingRepay, setSubmittingRepay] = useState(false);

  // Apply for Loan Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submittingApply, setSubmittingApply] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [limits, setLimits] = useState({ min_loan_amount: 25000, max_loan_amount: 2500000, company_name: '' });
  const [loanForm, setLoanForm] = useState({
    principal_amount: '500000',
    term_months: 24,
    purpose: 'Working Capital & Inventory Procurement',
    base_interest_rate: 11.50,
  });

  useEffect(() => {
    loadLoans();
    loadActiveSubscription();
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      const res = await apiLoans.getLimits();
      setLimits({
        min_loan_amount: parseFloat(res.data.min_loan_amount),
        max_loan_amount: parseFloat(res.data.max_loan_amount),
        company_name: res.data.company_name
      });
    } catch (e) {
      // defaults to 25k to 25L
    }
  };

  const loadLoans = async () => {
    try {
      const res = await apiLoans.getAll();
      setLoans(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to retrieve loan accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSubscription = async () => {
    try {
      const res = await apiSubscriptions.getActive();
      if (res.data?.plan) {
        setActivePlan(res.data.plan);
      }
    } catch (e) {
      // quiet
    }
  };

  const handleExecuteRepayment = async (e) => {
    e.preventDefault();
    if (!repayLoanTarget || !repayAmount) return;

    setSubmittingRepay(true);
    try {
      const res = await apiLoans.repay(repayLoanTarget.id, parseFloat(repayAmount));
      showToast(
        `Repayment of ₹${parseFloat(res.data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} recorded! (Principal: ₹${parseFloat(res.data.principal_component).toFixed(2)}, Interest: ₹${parseFloat(res.data.interest_component).toFixed(2)})`,
        'success'
      );
      setRepayLoanTarget(null);
      setRepayAmount('');
      loadLoans();
    } catch (err) {
      showToast(err.friendlyMessage || 'Repayment submission failed', 'error');
    } finally {
      setSubmittingRepay(false);
    }
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    const principal = parseFloat(loanForm.principal_amount);
    if (!principal || principal < limits.min_loan_amount || principal > limits.max_loan_amount) {
      showToast(`Requested loan amount must be between ₹${limits.min_loan_amount.toLocaleString('en-IN')} and ₹${limits.max_loan_amount.toLocaleString('en-IN')}`, 'error');
      return;
    }

    setSubmittingApply(true);
    try {
      const res = await apiLoans.apply({
        principal_amount: principal,
        term_months: parseInt(loanForm.term_months),
        purpose: loanForm.purpose,
        base_interest_rate: parseFloat(loanForm.base_interest_rate),
        document_name: uploadedFile ? uploadedFile.name : 'Financial_Statement_ITR.pdf',
      });

      showToast(`Loan application ${res.data.loan_account_number} for ₹${principal.toLocaleString('en-IN')} submitted! Status: Pending for Verification by Bank Administrator.`, 'info');
      setShowApplyModal(false);
      setUploadedFile(null);
      setLoanForm({
        principal_amount: '500000',
        term_months: 24,
        purpose: 'Working Capital & Inventory Procurement',
        base_interest_rate: 11.50,
      });
      loadLoans();
    } catch (err) {
      showToast(err.friendlyMessage || 'Loan application failed. Please try again.', 'error');
    } finally {
      setSubmittingApply(false);
    }
  };

  const discountRate = activePlan ? parseFloat(activePlan.interest_discount_rate || 0) : 0;
  const effectiveRate = Math.max(0, parseFloat(loanForm.base_interest_rate) - discountRate);
  const monthlyRate = (effectiveRate / 100) / 12;
  const numMonths = parseInt(loanForm.term_months) || 12;
  const pVal = parseFloat(loanForm.principal_amount) || 0;
  const estimatedEmi = monthlyRate > 0
    ? (pVal * monthlyRate * Math.pow(1 + monthlyRate, numMonths)) / (Math.pow(1 + monthlyRate, numMonths) - 1)
    : pVal / numMonths;

  return (
    <div>
      {/* Header with Apply for Loan CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Loan Facilities & Repayment Ledger</h1>
          <p style={{ color: '#94a3b8' }}>
            Real-time tracking of sanctioned borrowing facilities, plan-discounted interest rates, and installment ledger.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          <PlusCircle size={18} /> Apply for New Loan
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#38bdf8', padding: '3rem' }}>Fetching loan facilities...</div>
      ) : loans.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {loans.map((loan) => (
            <div key={loan.id} className="card" style={{ background: 'var(--bg-surface)' }}>
              {/* Loan Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)' }}>{loan.loan_account_number}</h2>
                    {loan.status === 'PENDING' ? (
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b', fontWeight: 700 }}>
                        Pending for Verification
                      </span>
                    ) : (
                      <span className={`badge badge-${loan.status.toLowerCase()}`}>{loan.status}</span>
                    )}
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {loan.status === 'PENDING'
                      ? `Application Date: ${new Date(loan.created_at).toLocaleDateString()} | Term: ${loan.term_months} Months | Purpose: ${loan.purpose || 'Working Capital'}`
                      : `Disbursed: ${loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : new Date(loan.created_at).toLocaleDateString()} | Term: ${loan.term_months} Months | Purpose: ${loan.purpose || 'Working Capital'}`}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    ₹{parseFloat(loan.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Current Outstanding Principal</div>
                </div>
              </div>

              {/* Financial Metrics Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Sanctioned Principal</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '2px' }}>
                    ₹{parseFloat(loan.principal_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Base Rate vs Plan Discount</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>
                    {parseFloat(loan.base_interest_rate).toFixed(2)}% - <span style={{ color: '#34d399' }}>{parseFloat(loan.discount_rate).toFixed(2)}%</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Effective Rate (APR)</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#38bdf8', marginTop: '2px' }}>
                    {parseFloat(loan.effective_interest_rate).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cumulative Repaid</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#34d399', marginTop: '2px' }}>
                    ₹{parseFloat(loan.total_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Repayments Progress */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  <span>Repaid: ₹{(parseFloat(loan.total_paid)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span>Balance: ₹{(parseFloat(loan.current_balance)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                      width: `${Math.min(100, (parseFloat(loan.total_paid) / parseFloat(loan.principal_amount)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Repayment History Ledger */}
              {loan.repayments && loan.repayments.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.65rem' }}>
                    Recent Repayment Receipts:
                  </div>
                  <div className="table-container">
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Total Paid (₹)</th>
                          <th>Interest Component (₹)</th>
                          <th>Principal Applied (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loan.repayments.map((r) => (
                          <tr key={r.id}>
                            <td>{new Date(r.repayment_date).toLocaleString()}</td>
                            <td style={{ fontWeight: 700, color: '#34d399' }}>₹{parseFloat(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td>₹{parseFloat(r.interest_component).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td>₹{parseFloat(r.principal_component).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Loan Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {loan.status === 'PENDING' ? (
                  <div style={{ padding: '0.6rem 1.15rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', color: '#f59e0b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} /> Awaiting bank admin verification and confirmation before disbursal
                  </div>
                ) : loan.status === 'ACTIVE' ? (
                  <button
                    onClick={() => {
                      setRepayLoanTarget(loan);
                      setRepayAmount('');
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <IndianRupee size={15} /> Make Repayment Installment
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <TrendingDown size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Active Borrowing Facilities</h2>
          <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Your account currently has no active loans. You can apply for an instant commercial or working capital loan facility based on your subscription tier.
          </p>
          <button
            onClick={() => setShowApplyModal(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={16} /> Apply for Loan Now
          </button>
        </div>
      )}

      {/* Apply for Loan Modal */}
      {showApplyModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={22} color="#38bdf8" />
                <h3 style={{ fontSize: '1.3rem' }}>Apply for Loan Facility</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Direct self-service application with instant subscription concession interest discount.
            </p>

            <form onSubmit={handleApplyLoan}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Principal Borrowing Amount (₹) *</label>
                  <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>
                    Allowed: ₹{limits.min_loan_amount.toLocaleString('en-IN')} - ₹{limits.max_loan_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  min={limits.min_loan_amount}
                  max={limits.max_loan_amount}
                  required
                  className="form-control"
                  placeholder={`Enter any amount between ₹${limits.min_loan_amount.toLocaleString('en-IN')} and ₹${limits.max_loan_amount.toLocaleString('en-IN')}`}
                  value={loanForm.principal_amount}
                  onChange={(e) => setLoanForm({ ...loanForm, principal_amount: e.target.value })}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {[25000, 50000, 100000, 500000, 1000000, 2500000].filter(amt => amt <= limits.max_loan_amount && amt >= limits.min_loan_amount).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setLoanForm({ ...loanForm, principal_amount: amt.toString() })}
                      style={{
                        background: parseFloat(loanForm.principal_amount) === amt ? 'var(--accent-blue)' : 'var(--bg-surface-elevated)',
                        color: parseFloat(loanForm.principal_amount) === amt ? '#ffffff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {amt >= 100000 ? `₹${amt / 100000} Lakh${amt > 100000 ? 's' : ''}` : `₹${amt.toLocaleString('en-IN')}`}
                    </button>
                  ))}
                </div>
              </div>


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tenure (Months) *</label>
                  <select
                    className="form-control"
                    value={loanForm.term_months}
                    onChange={(e) => setLoanForm({ ...loanForm, term_months: parseInt(e.target.value) })}
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.25"
                    className="form-control"
                    value={loanForm.base_interest_rate}
                    onChange={(e) => setLoanForm({ ...loanForm, base_interest_rate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Borrowing Purpose *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Working Capital, Shop Inventory, Machinery"
                  value={loanForm.purpose}
                  onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={15} color="#38bdf8" /> Verification Documents (Bank Statement / ITR / Salary Slip / KYC) *
                </label>
                <input
                  type="file"
                  required
                  className="form-control"
                  style={{ padding: '0.5rem' }}
                  onChange={(e) => setUploadedFile(e.target.files[0])}
                />
                {uploadedFile && (
                  <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} /> Attached for Bank Review: <strong>{uploadedFile.name}</strong>
                  </div>
                )}
                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                  Upload valid bank statements or income proof for bank administrator verification.
                </small>
              </div>

              {/* Concession Summary Box */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#94a3b8' }}>Base Rate:</span>
                  <span>{parseFloat(loanForm.base_interest_rate).toFixed(2)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#94a3b8' }}>Subscription Tier Discount:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>- {discountRate.toFixed(2)}% APR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Effective Borrowing Rate:</span>
                  <span style={{ fontWeight: 800, color: '#38bdf8' }}>{effectiveRate.toFixed(2)}% APR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginTop: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>Estimated Monthly EMI:</span>
                  <span style={{ fontWeight: 800, color: '#10b981' }}>₹{Math.round(estimatedEmi).toLocaleString('en-IN')}/mo</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.4rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.4rem' }}>
                  🗓️ Installment Timeline: Due on the 5th of each month for {numMonths} continuous installments.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApply}
                  className="btn btn-primary btn-sm"
                >
                  {submittingApply ? 'Submitting Application...' : 'Submit Application for Bank Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {repayLoanTarget && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Submit Loan Repayment</h3>
              <button
                onClick={() => setRepayLoanTarget(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Repaying Loan: <strong style={{ color: 'var(--text-primary)' }}>{repayLoanTarget.loan_account_number}</strong>. Outstanding principal balance is{' '}
              <strong style={{ color: '#0284c7' }}>₹{parseFloat(repayLoanTarget.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>.
            </p>

            <form onSubmit={handleExecuteRepayment}>
              <div className="form-group">
                <label className="form-label">Repayment Installment Amount (₹) *</label>
                <input
                  type="number"
                  step="1.00"
                  min="100.00"
                  required
                  className="form-control"
                  placeholder="e.g. 25000"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                />
                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  Repayment automatically satisfies unbilled interest first, and reduces remaining principal balance.
                </small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRepayLoanTarget(null)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRepay}
                  className="btn btn-primary btn-sm"
                >
                  {submittingRepay ? 'Processing Repayment...' : 'Confirm Repayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

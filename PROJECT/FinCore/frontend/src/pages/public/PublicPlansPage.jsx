import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { apiCompanies, apiPlans } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Check, Building2, Zap, ArrowRight } from 'lucide-react';

export default function PublicPlansPage() {
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const compRes = await apiCompanies.getPublic();
      setCompanies(compRes.data);
      if (compRes.data.length > 0) {
        setSelectedCompany(compRes.data[0].id.toString());
      }
      const planRes = await apiPlans.getPublic();
      setPlans(planRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = selectedCompany
    ? plans.filter((p) => p.finance_company_id === parseInt(selectedCompany))
    : plans;

  const handleSelectPlan = (plan) => {
    if (isAuthenticated && isCustomer) {
      navigate(`/customer/subscribe?planId=${plan.id}`);
    } else {
      navigate(`/customer/register?companyId=${plan.finance_company_id}&planId=${plan.id}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem', width: '100%', flex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Transparent SaaS Banking Plans</h1>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto' }}>
            Choose your financial partner and subscription tier. Enjoy reduced loan interest rates, automated billing, and premium fintech capabilities.
          </p>

          {/* Company Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCompany(c.id.toString())}
                className={`btn ${selectedCompany === c.id.toString() ? 'btn-primary' : 'btn-secondary'}`}
                style={{ gap: '0.5rem' }}
              >
                <Building2 size={16} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#38bdf8', padding: '4rem' }}>Loading subscription tiers...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.4rem' }}>{plan.name}</h3>
                  <span className="badge badge-info">{plan.code}</span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#38bdf8' }}>
                    ₹{parseFloat(plan.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}> / {plan.billing_cycle}</span>
                </div>

                {parseFloat(plan.interest_discount_rate) > 0 && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Zap size={16} />
                    <span>Includes {parseFloat(plan.interest_discount_rate).toFixed(2)}% Loan Interest Discount</span>
                  </div>
                )}

                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {plan.description || 'Enterprise grade financial subscription plan.'}
                </p>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '2rem', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Included Plan Features:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {plan.features?.map((f) => (
                      <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                        <Check size={16} color="#38bdf8" />
                        <span>{f.feature_label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  Select & Subscribe <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

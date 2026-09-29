import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building2,
  FileCheck2,
  Lock,
  ArrowRight,
  Database,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { apiCompanies, apiPlans } from '../../api/client';

export default function LandingPage() {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    apiCompanies.getPublic().then((res) => setCompanies(res.data)).catch(() => {});
    apiPlans.getPublic().then((res) => setPlans(res.data)).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.12), transparent 60%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '9999px', padding: '0.4rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#38bdf8' }}>
            <Database size={15} /> Enterprise Multi-Tenant Banking Infrastructure
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Smart Finance. <br />
            <span style={{ background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Simplified Billing.
            </span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
            A high-performance Subscription & Billing SaaS platform engineered for banking, microfinance, and fintech organizations. Multi-tenant isolation, automated invoicing, dynamic interest discounts, and full ACID transaction compliance.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/customer/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Open Customer Account <ArrowRight size={18} />
            </Link>
            <Link to="/institution/register" className="btn btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderColor: '#10b981', color: '#10b981' }}>
              Register Institution
            </Link>
            <Link to="/plans" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              View SaaS Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Live Finance Companies Marquee / Directory */}
      <section style={{ padding: '2rem', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '1.25rem', fontWeight: 600 }}>
            Powered by Participating Multi-Tenant Financial Institutions
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {companies.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <Building2 size={18} color="#38bdf8" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</span>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>Comprehensive Core Banking Features</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Every component is directly mapped to database relationships, automated calculation engines, and audit standards.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1.25rem' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Dynamic SaaS Subscriptions</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Multi-tiered subscriptions with monthly, quarterly, and annual billing cycles. Automated renewal tracking, invoice triggers, and benefit inheritance.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.25rem' }}>
              <FileCheck2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Automated Itemized Invoicing</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Deterministic Decimal monetary calculations, regulatory tax inclusion, formatted invoice sequences, and PDF-ready financial statements.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '1.25rem' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Loan & Interest Engine</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Dynamic interest rate calculation linking active subscription tiers to lower loan rates. Repayment distribution strictly servicing interest before principal.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '1.25rem' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>ACID Payment Transactions</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Atomic settlement committing payment logs, marking invoices as paid, and renewing subscriptions inside an isolated InnoDB transaction.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Non-Repudiation Audit Trail</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Every sensitive event (login, registration, invoice settlement, loan disbursal) is permanently recorded with actor, action, timestamp, and JSON metadata.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1.25rem' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Multi-Tenant Architecture</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Rigorous foreign key enforcement isolating customers, plans, invoices, and loans per finance company. Cross-tenant privacy guaranteed.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="brand-text" style={{ fontSize: '1.2rem' }}>FINCORE</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Subscription & Billing SaaS for Banking and Fintech Companies</div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <Link to="/about">Architecture</Link>
            <Link to="/plans">Plans</Link>
            <Link to="/institution/register">Register FinTech Bank</Link>
            <Link to="/admin/login">Admin Console</Link>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            FinCore Enterprise Financial Platform (MySQL 8.0 & FastAPI)
          </div>
        </div>
      </footer>
    </div>
  );
}

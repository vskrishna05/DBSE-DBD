import React from 'react';
import Navbar from '../../components/Navbar';
import { Database, ShieldCheck, CheckCircle2, Server, Key, FileCode } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 2rem', width: '100%', flex: 1 }}>
        <div style={{ marginBottom: '3rem' }}>
          <div className="badge badge-info" style={{ marginBottom: '1rem' }}>Enterprise Architecture & Systems Engineering</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>FinCore System Architecture & Database Design</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
            FinCore is engineered for high-availability multi-tenant subscription management, authoritative financial ledger precision, automated GST billing, and non-repudiation audit trails.
          </p>
        </div>

        {/* 6 Engineering Pillars Highlights */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            Core Engineering & Architectural Pillars
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Database size={18} /> Relational Modeling & Schema Design
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                Full conceptual and logical design modeling normalized entities including small finance banks, customers, plans, invoices, and loans.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} /> Normalization & Data Integrity
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                Elimination of insertion, update, and deletion anomalies. Strict foreign keys isolating tenant customer profiles, features, and line items.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: 700, marginBottom: '0.5rem' }}>
                <FileCode size={18} /> Analytical Reporting & SQL Views
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                Materialized and dynamic SQL views for live revenue aggregation (<code style={{ color: '#38bdf8' }}>view_customer_financial_summary</code>, <code style={{ color: '#38bdf8' }}>view_company_revenue_analytics</code>).
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Server size={18} /> Transaction Management & ACID
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                Atomic checkout transactions with row-level locks updating payments, invoices, and subscriptions within an isolated unit of work.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Key size={18} /> Indexing & Security
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                B-Tree indexes on composite query keys, Bcrypt salted password hashing, and parameterized ORM queries to eliminate injection vulnerabilities.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem' }}>
                <ShieldCheck size={18} /> Multi-Tenant SaaS & Auditing
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                Decoupled FastAPI backend and React frontend with non-repudiation audit logging and role-based access control.
              </p>
            </div>
          </div>
        </section>

        {/* ACID Workflow Explanation */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            ACID Billing & Payment Execution Workflow
          </h2>
          <div className="card" style={{ background: 'var(--bg-secondary)', padding: '2rem' }}>
            <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
              <li>
                <strong>1. Atomicity:</strong> Payment initiation creates a payment log, transitions invoice status from <code className="badge badge-warning">ISSUED</code> to <code className="badge badge-success">PAID</code>, and extends active subscription dates inside a single MySQL transaction block. Any failure triggers a clean rollback.
              </li>
              <li>
                <strong>2. Consistency:</strong> Database foreign keys strictly enforce that invoice payments link only to existing invoices and active customer accounts.
              </li>
              <li>
                <strong>3. Isolation:</strong> InnoDB execution operates at <code style={{ color: '#38bdf8' }}>READ COMMITTED</code> isolation level with row locks on pending invoices to eliminate double-payment race conditions.
              </li>
              <li>
                <strong>4. Durability:</strong> MySQL write-ahead transaction logs (redo log) ensure committed settlements survive system reboots or network disconnects.
              </li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}

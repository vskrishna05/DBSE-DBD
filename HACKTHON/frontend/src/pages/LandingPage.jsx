import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Wrench,
  Shield,
  Cpu,
  QrCode,
  Clock,
  ArrowRight,
  Activity,
  Droplet,
  Disc,
  BatteryCharging,
  CircleDot,
  Wind,
  Zap,
  ShieldAlert,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
  const [sliderKm, setSliderKm] = useState(38000);

  const getSimulatedHealth = (km) => {
    if (km > 50000) return { score: 68, risk: 'EVALUATE', label: 'Recommended General Servicing Required' };
    if (km > 35000) return { score: 82, risk: 'ATTENTION', label: 'Brake Pads & Fluid Replacement Due' };
    return { score: 95, risk: 'NOMINAL', label: 'Optimal Operational Parameters' };
  };

  const health = getSimulatedHealth(sliderKm);

  const categories = [
    { title: 'Periodic Servicing', icon: Wrench, desc: '60-point mechanical inspection, fluid renewals, filter replacements' },
    { title: 'Engine Diagnostics', icon: Activity, desc: 'OBD-II computer diagnostics, spark ignition, compression testing' },
    { title: 'Synthetic Oil Change', icon: Droplet, desc: 'Premium synthetic drain & OEM filter cartridge replacement' },
    { title: 'Brake Overhaul', icon: Disc, desc: 'Ceramic friction pads, disc skimming, and brake fluid flush' },
    { title: 'Battery Testing', icon: BatteryCharging, desc: 'Digital CCA conductance testing, terminal cleaning & replacement' },
    { title: 'Wheel Alignment', icon: CircleDot, desc: 'Computerized laser toe/camber alignment and dynamic balancing' },
    { title: 'Climate & AC Service', icon: Wind, desc: 'Refrigerant top-up, condenser coil decontamination, cabin filter' },
    { title: 'Electrical & EV Powertrain', icon: Zap, desc: 'High-voltage inverter checks, harness diagnostics, battery tests' },
    { title: 'Bodywork & Detailing', icon: ShieldAlert, desc: 'Computerized paint booth matching, dent pulling, ceramic coating' },
  ];

  const steps = [
    { num: '01', title: 'Register Vehicle', desc: 'Add registration plate to automatically bind your digital vehicle passport.' },
    { num: '02', title: 'Schedule Service', desc: 'Select workshop appointment slot or request doorstep concierge pickup.' },
    { num: '03', title: 'Track Live Progress', desc: 'Inspect technician notes, approve estimates, and follow live repair stages.' },
    { num: '04', title: 'Digital Passport', desc: 'Receive your vehicle with official invoice and verified digital service stamp.' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 border-b border-white/10">
        
        {/* Subtle geometric line pattern in background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs text-neutral-300 font-mono">
                <span>Enterprise Automotive Management</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight font-sans">
                Predictive Vehicle Care. <br />
                <span className="text-neutral-400 font-light">
                  Zero Unexpected Failures.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl font-normal">
                Connect directly with certified technicians, monitor repairs through live stage tracking, receive machine learning component degradation forecasts, and maintain an immutable Digital Vehicle Passport.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all text-center flex items-center justify-center gap-2 group shadow-sm"
                >
                  <span>Book Service</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#ai-maintenance"
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-medium text-sm hover:bg-white/10 transition-all text-center"
                >
                  Explore AI Engine
                </a>
              </div>

              {/* Minimalist Trust Features */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs font-mono text-neutral-400">
                <div>
                  <div className="text-white font-bold text-base font-sans">100%</div>
                  <div>OEM Genuine Parts</div>
                </div>
                <div>
                  <div className="text-white font-bold text-base font-sans">Real-Time</div>
                  <div>Stage Tracking</div>
                </div>
                <div>
                  <div className="text-white font-bold text-base font-sans">Digital</div>
                  <div>QR Passport</div>
                </div>
              </div>
            </div>

            {/* Right Card: Interactive AI Maintenance Preview */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
                      Predictive Maintenance
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/15 text-white">
                    Random Forest ML
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Vehicle Odometer:</span>
                    <span className="font-mono text-white font-bold">{sliderKm.toLocaleString()} KM</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="75000"
                    step="1000"
                    value={sliderKm}
                    onChange={(e) => setSliderKm(Number(e.target.value))}
                    className="w-full accent-white bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>5,000 KM</span>
                    <span>40,000 KM</span>
                    <span>75,000 KM</span>
                  </div>
                </div>

                {/* Health Metric Box */}
                <div className="p-4 rounded-xl bg-black border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Estimated Health Score:</span>
                    <span className="text-xl font-bold font-mono text-white">{health.score}/100</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-full transition-all duration-300" style={{ width: `${health.score}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-neutral-400">Priority Status:</span>
                    <span className="font-mono text-white text-[11px] px-2 py-0.5 rounded border border-white/20 bg-white/5">
                      {health.risk}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-mono pt-1 border-t border-white/5">
                    {health.label}
                  </p>
                </div>

                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white hover:text-black border border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Connect Vehicle OBD Telemetry</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-400">Precision Workshop Floor</span>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Comprehensive Service Catalog
            </h2>
            <p className="text-xs text-neutral-400">
              Factory-grade maintenance procedures performed by trained technicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#09090B] border border-white/10 hover:border-white/30 transition-all space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-black border border-white/15 flex items-center justify-center text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* How it Works / Workflow Steps */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-400">Operational Lifecycle</span>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              How MechX Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#09090B] border border-white/10 relative">
                <span className="text-xs font-mono font-bold text-neutral-500 block mb-3">
                  {s.num}
                </span>
                <h4 className="text-sm font-semibold text-white mb-2">{s.title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Passport Banner */}
      <section id="digital-passport" className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#09090B] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-neutral-400">
                <QrCode className="w-4 h-4 text-white" />
                <span>Verified Blockchain-Style Ledger</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Digital Vehicle Passport
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Protect resale value with an immutable, cryptographically signed service log. Every service record, parts replacement, and health score is timestamped and verifiable via permanent QR code.
              </p>
            </div>

            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all shrink-0"
            >
              Access Digital Passport
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

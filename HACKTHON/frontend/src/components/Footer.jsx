import React from 'react';
import { Wrench, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black pt-12 pb-8 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                MechX
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Enterprise vehicle service management platform connecting car owners with certified technicians through machine learning diagnostics and verified digital passports.
            </p>
            <div className="flex items-center space-x-2 text-xs text-neutral-300">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>100% Genuine OEM Spare Parts</span>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px] font-mono">Service Solutions</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>Periodic General Maintenance</li>
              <li>Engine Diagnostics & Tuning</li>
              <li>Brake Overhaul & Inspection</li>
              <li>Battery Health Assessment</li>
              <li>HVAC & Climate Service</li>
            </ul>
          </div>

          {/* Innovation Modules */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px] font-mono">Platform Features</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>Random Forest Predictive Engine</li>
              <li>Digital QR Vehicle Passport</li>
              <li>Problem Identification Wizard</li>
              <li>Smart Mechanic Dispatch Engine</li>
              <li>Stage-by-Stage Repair Timeline</li>
            </ul>
          </div>

          {/* Hubs & Support */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px] font-mono">Primary Hub</h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <div>
                <p className="font-medium text-white">MechX Prime Workshop</p>
                <p className="text-neutral-500">100 Feet Road, Indiranagar, Bangalore</p>
              </div>
              <div className="pt-2 text-neutral-400 font-mono">
                Support: +91 80 2000 3000
              </div>
            </div>
          </div>

        </div>

        {/* Crisp White Line Divider */}
        <div className="h-px bg-white/10 w-full mb-6"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 MechX Platform Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Menu, X, ArrowRight, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin';
      case 'SERVICE_CENTER_MANAGER': return '/manager';
      case 'MECHANIC': return '/mechanic';
      default: return '/customer';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                MechX
              </span>
              <span className="block text-[9px] tracking-widest uppercase font-mono text-neutral-400">
                Automotive Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-medium">
            <a href="#services" className="text-neutral-400 hover:text-white transition-colors">Services</a>
            <a href="#ai-maintenance" className="text-neutral-400 hover:text-white transition-colors">AI Maintenance</a>
            <a href="#digital-passport" className="text-neutral-400 hover:text-white transition-colors">Digital Passport</a>
            <a href="#centers" className="text-neutral-400 hover:text-white transition-colors">Service Hubs</a>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardPath()}
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-neutral-300 hover:text-white font-medium text-xs transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-1.5"
                >
                  Access Console
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 text-neutral-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs text-neutral-400 hover:text-white">Services</a>
          <a href="#ai-maintenance" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs text-neutral-400 hover:text-white">AI Maintenance</a>
          <a href="#digital-passport" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs text-neutral-400 hover:text-white">Digital Passport</a>
          <a href="#centers" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs text-neutral-400 hover:text-white">Service Hubs</a>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link to="/login" className="w-full py-2 text-center text-xs text-black bg-white font-semibold rounded-xl">
              Access Console
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

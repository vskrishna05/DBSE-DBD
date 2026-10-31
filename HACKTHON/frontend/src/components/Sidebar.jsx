import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  CalendarPlus,
  Clock,
  Activity,
  Cpu,
  HeartPulse,
  QrCode,
  Calculator,
  Truck,
  FileText,
  LogOut,
  Wrench,
  Users,
  Package,
  UserCheck,
  Stethoscope
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'ADMIN':
        return [
          { name: 'Analytics & KPIs', path: '/admin', icon: LayoutDashboard },
          { name: 'Customer Directory', path: '/admin/customers', icon: Users },
          { name: 'Mechanic Workforces', path: '/admin/mechanics', icon: UserCheck },
          { name: 'All Bookings', path: '/admin/bookings', icon: Clock },
          { name: 'Spare Parts Inventory', path: '/admin/inventory', icon: Package },
          { name: 'Invoices & Revenue', path: '/admin/invoices', icon: FileText },
          { name: 'Service Centers', path: '/admin/centers', icon: Wrench },
        ];

      case 'SERVICE_CENTER_MANAGER':
        return [
          { name: 'Workshop Overview', path: '/manager', icon: LayoutDashboard },
          { name: 'Appointments', path: '/manager/appointments', icon: Clock },
          { name: 'Smart Mechanic Assign', path: '/manager/assignments', icon: UserCheck },
          { name: 'Cost Estimates', path: '/manager/estimates', icon: Calculator },
          { name: 'Spare Parts Inventory', path: '/manager/inventory', icon: Package },
          { name: 'Invoices & Billing', path: '/manager/invoices', icon: FileText },
        ];

      case 'MECHANIC':
        return [
          { name: 'Assigned Jobs', path: '/mechanic', icon: Wrench },
          { name: 'Live Repair Tracker', path: '/mechanic/tracking', icon: Activity },
          { name: 'Record Health Inspection', path: '/mechanic/health-check', icon: HeartPulse },
          { name: 'Record Parts Used', path: '/mechanic/parts-used', icon: Package },
        ];

      case 'CUSTOMER':
      default:
        return [
          { name: 'Overview', path: '/customer', icon: LayoutDashboard },
          { name: 'My Garage', path: '/customer/vehicles', icon: Car },
          { name: 'Book a Service', path: '/customer/book', icon: CalendarPlus },
          { name: 'My Bookings', path: '/customer/bookings', icon: Clock },
          { name: 'Live Service Tracker', path: '/customer/track', icon: Activity },
          { name: 'AI Maintenance', path: '/customer/predictions', icon: Cpu, badge: 'ML' },
          { name: 'Vehicle Health Score', path: '/customer/health', icon: HeartPulse },
          { name: 'Digital Passport', path: '/customer/passport', icon: QrCode },
          { name: 'Cost Estimator', path: '/customer/estimates', icon: Calculator },
          { name: 'Problem Diagnosis', path: '/customer/diagnosis', icon: Stethoscope },
          { name: 'Doorstep Pickup & Drop', path: '/customer/pickup', icon: Truck },
          { name: 'Invoices & Payments', path: '/customer/invoices', icon: FileText },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-black border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 py-6 px-4 select-none">
      <div>
        {/* Brand Header with White Line Divider */}
        <div className="px-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                MechX
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                {user?.role?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Crisp White Accent Line */}
        <div className="h-px bg-white/10 mx-2 mb-6"></div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/customer' || item.path === '/admin' || item.path === '/manager' || item.path === '/mechanic'}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150
                  ${isActive 
                    ? 'bg-white/10 text-white border border-white/20 font-semibold' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-white/15 text-white border border-white/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Section */}
      <div className="pt-4 border-t border-white/10">
        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 mb-3">
          <p className="text-xs font-semibold text-white truncate">{user?.fullName || user?.username}</p>
          <p className="text-[10px] text-neutral-400 truncate font-mono mt-0.5">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium border border-white/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

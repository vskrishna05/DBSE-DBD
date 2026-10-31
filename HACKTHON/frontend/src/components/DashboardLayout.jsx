import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Shield } from 'lucide-react';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      // ignore silently if not logged in
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Minimalist Topbar with Fine White Border Line */}
        <header className="h-14 bg-black border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
            <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-mono">
              MechX Platform Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 hover:text-white transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-3 w-80 bg-[#09090B] rounded-2xl border border-white/15 shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="text-xs font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-neutral-400 hover:text-white transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-neutral-500 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className={`p-2.5 rounded-xl text-xs border ${n.isRead ? 'bg-white/[0.02] border-transparent' : 'bg-white/5 border-white/15'}`}>
                          <p className="font-semibold text-white mb-0.5">{n.title}</p>
                          <p className="text-neutral-400 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Badge */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-white/5 border border-white/15">
              <Shield className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-xs font-medium text-white font-mono">
                {user?.role?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-8 bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

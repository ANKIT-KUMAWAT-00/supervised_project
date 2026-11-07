import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Box, BookOpen, Sparkles,
  BookmarkCheck, Bot, LineChart, Cpu, Wifi, Settings,
  Database, AlertTriangle, ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  portal: 'student' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ portal }) => {
  const studentNav = [
    { to: '/student', label: 'DASHBOARD', icon: LayoutDashboard, exact: true },
    { to: '/student/occupancy', label: 'OCCUPANCY INTEL', icon: Activity },
    { to: '/student/library-map', label: '3D DIGITAL TWIN', icon: Box },
    { to: '/student/reservations', label: 'SEAT BOOKINGS', icon: BookmarkCheck },
    { to: '/student/books', label: 'RESOURCE CATALOG', icon: BookOpen },
    { to: '/student/recommendations', label: 'AI STUDY ZONES', icon: Sparkles },
    { to: '/student/assistant', label: 'AI ASSISTANT', icon: Bot },
  ];

  const adminNav = [
    { to: '/admin', label: 'COMMAND CENTER', icon: LayoutDashboard, exact: true },
    { to: '/admin/occupancy', label: 'FLOOR MANAGEMENT', icon: Activity },
    { to: '/admin/analytics', label: 'DEEP ANALYTICS', icon: LineChart },
    { to: '/admin/predictions', label: 'AI FORECASTING', icon: Database },
    { to: '/admin/ml-lab', label: '3D ML LABORATORY', icon: Cpu },
    { to: '/admin/resources', label: 'BOOK DEMAND & SHORTAGES', icon: BookOpen },
    { to: '/admin/sensors', label: 'IOT SENSOR NETWORK', icon: Wifi },
    { to: '/admin/settings', label: 'CAMPUS POLICIES', icon: Settings },
  ];

  const navItems = portal === 'student' ? studentNav : adminNav;

  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r border-cyan/15 bg-midnight/90 backdrop-blur-xl flex flex-col justify-between py-6 px-4">
      <div>
        <div className="px-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan shadow-cyan-glow" />
            <span className="text-xs font-mono font-bold tracking-wider text-softwhite">
              {portal === 'student' ? 'STUDENT PORTAL' : 'ADMIN COMMAND HQ'}
            </span>
          </div>
          <p className="text-[10px] font-mono text-subtlegrey mt-1">
            Real-time Autonomous Matrix
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-cyan-glow font-bold'
                      : 'text-subtlegrey hover:text-softwhite hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Card */}
      <div className="p-3.5 rounded-xl bg-navy/60 border border-cyan/10 text-xs font-mono text-subtlegrey">
        <div className="flex items-center justify-between text-[11px] text-ice mb-1">
          <span>AI ACCURACY (R²)</span>
          <span className="text-cyan font-bold">0.9533</span>
        </div>
        <div className="w-full bg-navy rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan to-violet h-full w-[95%]" />
        </div>
        <p className="text-[10px] text-subtlegrey mt-2">
          Model: XGBoost Ensemble (120 Seats)
        </p>
      </div>
    </aside>
  );
};

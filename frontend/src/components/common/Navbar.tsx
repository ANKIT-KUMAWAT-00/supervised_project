import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { NotificationBell } from './NotificationBell';
import {
  Compass, Box, Activity, LogOut, User as UserIcon,
  ShieldAlert, Bot, Sparkles, Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isStudent, isAdmin } = useAuth();
  const { isConnected } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan/15 bg-midnight/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/40 group-hover:border-cyan group-hover:shadow-cyan-glow transition-all">
            <span className="font-display font-black text-xl text-cyan group-hover:text-ice transition-colors">
              Λ
            </span>
            <div className="absolute inset-0 rounded-xl border border-cyan/30 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg tracking-wider text-softwhite">
                LIBR<span className="text-cyan">Λ</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/30">
                v1.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-subtlegrey tracking-tight hidden sm:block">
              Quantum Resource Intelligence
            </p>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/student/library-map"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              isCurrent('/student/library-map')
                ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-cyan-glow'
                : 'text-subtlegrey hover:text-softwhite hover:bg-white/5'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            3D DIGITAL TWIN
          </Link>

          <Link
            to="/student/occupancy"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              isCurrent('/student/occupancy')
                ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-cyan-glow'
                : 'text-subtlegrey hover:text-softwhite hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            LIVE OCCUPANCY
          </Link>

          <Link
            to="/student/assistant"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              isCurrent('/student/assistant')
                ? 'bg-violet/15 text-violet border border-violet/40 shadow-violet-glow'
                : 'text-subtlegrey hover:text-softwhite hover:bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI ASSISTANT
          </Link>

          {isAdmin && (
            <Link
              to="/admin/ml-lab"
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                isCurrent('/admin/ml-lab')
                  ? 'bg-cyan/20 text-cyan border border-cyan/40'
                  : 'text-subtlegrey hover:text-cyan hover:bg-cyan/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              3D ML LAB
            </Link>
          )}
        </nav>

        {/* Right Section: Telemetry Pulse, Notifications, Auth */}
        <div className="flex items-center gap-3">
          {/* Live Telemetry Node Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-navy/80 border border-white/5 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
              }`}
            />
            <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {isConnected ? 'STREAM ONLINE (120 SEATS)' : 'STREAM DISCONNECTED'}
            </span>
          </div>

          <NotificationBell />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={isAdmin ? '/admin' : '/student'}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy/80 border border-cyan/20 hover:border-cyan/50 text-xs font-mono text-softwhite transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan/20 text-cyan flex items-center justify-center font-bold">
                  {user.full_name[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="leading-tight font-medium truncate max-w-[120px]">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] text-cyan capitalize">{user.role}</div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-navy/60 border border-white/10 hover:border-rose-500/40 text-subtlegrey hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium text-softwhite hover:text-cyan border border-white/10 hover:border-cyan/40 transition-all"
              >
                LOG IN
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all"
              >
                ENTER LIBRΛ
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

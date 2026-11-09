import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Shield, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      login(data.access_token, data.user);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoRole: 'student' | 'admin') => {
    if (demoRole === 'student') {
      setEmail('student@librava.ai');
      setPassword('StudentPass2026!');
    } else {
      setEmail('admin@librava.ai');
      setPassword('AdminPass2026!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 hologram-grid opacity-20 pointer-events-none" />

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-cyan/30 shadow-cyan-glow relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/40 text-cyan flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-black text-2xl">Λ</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-softwhite">
            Access LIBR<span className="text-cyan">Λ</span> Terminal
          </h2>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Sign in to your university intelligence profile
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-subtlegrey mb-1.5 uppercase">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cyan absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm text-softwhite font-mono focus:outline-none focus:ring-1 focus:ring-cyan transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-subtlegrey mb-1.5 uppercase">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm text-softwhite font-mono focus:outline-none focus:ring-1 focus:ring-cyan transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Fill */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <span className="block text-[11px] font-mono text-subtlegrey uppercase mb-2 text-center">
            One-Click Demo Credentials:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="py-2 px-3 rounded-lg text-xs font-mono bg-navy/60 hover:bg-cyan/15 border border-cyan/20 text-cyan transition-all text-center"
            >
              Student Alex
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="py-2 px-3 rounded-lg text-xs font-mono bg-navy/60 hover:bg-violet/15 border border-violet/30 text-violet transition-all text-center"
            >
              Admin Elena
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs font-mono text-subtlegrey">
          Don't have an access key?{' '}
          <Link to="/register" className="text-cyan hover:underline">
            Register Student Terminal
          </Link>
        </div>
      </div>
    </div>
  );
};

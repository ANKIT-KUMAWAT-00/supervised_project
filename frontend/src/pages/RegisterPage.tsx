import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { ArrowRight, UserPlus, Mail, Lock, User, GraduationCap } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [noisePref, setNoisePref] = useState('quiet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register({
        email,
        password,
        full_name: fullName,
        role: 'student',
        student_id_number: studentId || `STU-${Math.floor(Math.random() * 8999 + 1000)}`,
        department,
        preferred_noise_level: noisePref,
      });
      login(data.access_token, data.user);
      navigate('/student');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative py-12">
      <div className="absolute inset-0 hologram-grid opacity-20 pointer-events-none" />

      <div className="glass-panel w-full max-w-lg p-8 rounded-2xl border border-cyan/30 shadow-cyan-glow relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/40 text-cyan flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-softwhite">
            Register Student Profile
          </h2>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Initialize your profile for autonomous library space allocation
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
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-cyan absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Cole"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm text-softwhite font-mono focus:outline-none"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm text-softwhite font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-subtlegrey mb-1.5 uppercase">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="MIT-2026-XXXX"
                className="w-full px-3 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm text-softwhite font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-subtlegrey mb-1.5 uppercase">
                Preferred Noise
              </label>
              <select
                value={noisePref}
                onChange={(e) => setNoisePref(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm text-softwhite font-mono focus:outline-none"
              >
                <option value="silent">Strict Silent</option>
                <option value="quiet">Quiet Study</option>
                <option value="collaborative">Collaborative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-subtlegrey mb-1.5 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm text-softwhite font-mono focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? 'REGISTERING...' : 'CREATE ACCOUNT & ENTER'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-mono text-subtlegrey">
          Already registered?{' '}
          <Link to="/login" className="text-cyan hover:underline">
            Log in to existing terminal
          </Link>
        </div>
      </div>
    </div>
  );
};

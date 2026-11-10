import React, { useState } from 'react';
import { Settings, Save, Shield, Calendar, Bell, Sliders, Check } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [criticalThreshold, setCriticalThreshold] = useState<number>(80);
  const [maxBookingDuration, setMaxBookingDuration] = useState<number>(4);
  const [autoExpiryMins, setAutoExpiryMins] = useState<number>(15);
  const [activeExamMultiplier, setActiveExamMultiplier] = useState<number>(1.65);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      <div>
        <span className="text-xs font-mono uppercase text-cyan tracking-wider">
          CAMPUS CONFIGURATION & GOVERNANCE
        </span>
        <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
          Operational Thresholds & Policies
        </h1>
        <p className="text-xs font-mono text-subtlegrey mt-1">
          Configure real-time capacity alert limits, academic calendar surges, and reservation quotas
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Capacity Alert Thresholds */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan/15 space-y-4">
          <div className="flex items-center gap-2 text-cyan font-mono text-xs uppercase font-bold">
            <Sliders className="w-4 h-4" />
            <span>Capacity & Alarm Thresholds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-subtlegrey mb-1.5">
                CRITICAL OCCUPANCY TRIGGER (%):
              </label>
              <input
                type="number"
                min="50"
                max="95"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm font-mono text-softwhite focus:outline-none"
              />
              <span className="text-[11px] text-subtlegrey mt-1 block">
                Dispatches alert notification to students and activates overflow study rooms.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-subtlegrey mb-1.5">
                MAX BOOKING DURATION (HOURS):
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={maxBookingDuration}
                onChange={(e) => setMaxBookingDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-sm font-mono text-softwhite focus:outline-none"
              />
              <span className="text-[11px] text-subtlegrey mt-1 block">
                Maximum duration allowed for an individual student reservation.
              </span>
            </div>
          </div>
        </div>

        {/* Academic Calendar Surge Weights */}
        <div className="glass-panel p-6 rounded-2xl border border-violet/20 space-y-4">
          <div className="flex items-center gap-2 text-violet font-mono text-xs uppercase font-bold">
            <Calendar className="w-4 h-4" />
            <span>Academic Exam Multiplier for AI Forecasting</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-subtlegrey mb-1.5">
                EXAM PERIOD FOOTFALL MULTIPLIER:
              </label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="2.5"
                value={activeExamMultiplier}
                onChange={(e) => setActiveExamMultiplier(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-violet text-sm font-mono text-softwhite focus:outline-none"
              />
              <span className="text-[11px] text-subtlegrey mt-1 block">
                Currently 1.65x (+65% surge during Fall Midterms).
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-subtlegrey mb-1.5">
                RESERVATION NO-SHOW AUTO-RELEASE (MINUTES):
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={autoExpiryMins}
                onChange={(e) => setAutoExpiryMins(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/80 border border-white/10 focus:border-violet text-sm font-mono text-softwhite focus:outline-none"
              />
              <span className="text-[11px] text-subtlegrey mt-1 block">
                Unchecked-in reservations are returned to the available pool.
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-mono text-xs font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            SAVE POLICIES
          </button>
          {saved && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" /> Settings successfully synchronized to database!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

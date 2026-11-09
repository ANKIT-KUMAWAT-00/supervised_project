import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingScene3D } from '../components/3d/LandingScene3D';
import { occupancyApi, predictionsApi } from '../services/api';
import { OccupancySummary, OccupancyForecast } from '../types';
import {
  Compass, ArrowRight, ShieldCheck, Cpu, Box,
  Sparkles, Activity, BookOpen, ChevronRight, Zap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [occupancy, setOccupancy] = useState<OccupancySummary | null>(null);
  const [forecast, setForecast] = useState<OccupancyForecast | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const occ = await occupancyApi.getCurrent();
        setOccupancy(occ);
        const fc = await predictionsApi.getForecast();
        setForecast(fc);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen bg-midnight text-softwhite overflow-hidden">
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 hologram-grid opacity-30 pointer-events-none" />

      {/* Hero Section with Central 3D Canvas */}
      <section className="relative w-full h-[90vh] flex items-center justify-center">
        {/* Central 3D Scene */}
        <div className="absolute inset-0 z-0">
          <LandingScene3D />
        </div>

        {/* Foreground Cinematic Overlay Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
          <div className="max-w-2xl pointer-events-auto">
            {/* System Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/80 border border-cyan/30 text-cyan text-xs font-mono mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE INTELLIGENCE BEHIND EVERY STUDY SPACE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-none text-softwhite">
              SMART LIBRARY <br />
              <span className="cyan-gradient-text">DIGITAL TWIN</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-subtlegrey font-sans leading-relaxed max-w-xl">
              Experience university library management elevated to an autonomous scientific command center. 120 live synchronized seats, XGBoost occupancy forecasting, and intelligent study space allocation.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/student/library-map"
                className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow-lg transition-all flex items-center gap-2 group"
              >
                <Box className="w-4 h-4" />
                EXPLORE 3D DIGITAL TWIN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider glass-panel border border-cyan/30 text-softwhite hover:text-cyan hover:border-cyan transition-all flex items-center gap-2"
              >
                STUDENT & STAFF LOGIN
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Real-Time Occupancy HUD Overlay (Bottom Left) */}
        {occupancy && (
          <div className="absolute bottom-6 left-6 z-20 hidden md:block glass-panel p-4 rounded-2xl border border-cyan/20 max-w-sm backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between text-xs font-mono text-cyan mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
                LIVE CAMPUS TELEMETRY
              </span>
              <span className="text-softwhite">{occupancy.total_capacity} TOTAL SEATS</span>
            </div>
            <div className="text-3xl font-display font-bold text-softwhite">
              {occupancy.occupancy_percentage}%{' '}
              <span className="text-sm font-mono font-normal text-subtlegrey">Occupied</span>
            </div>
            <div className="mt-2 text-xs font-mono text-emerald-400">
              ✓ {occupancy.available_seats} seats ready for immediate reservation
            </div>
          </div>
        )}

        {/* Floating ML Forecast HUD Overlay (Bottom Right) */}
        {forecast && (
          <div className="absolute bottom-6 right-6 z-20 hidden md:block glass-panel p-4 rounded-2xl border border-violet/30 max-w-sm backdrop-blur-xl text-right animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-end gap-1.5 text-xs font-mono text-violet mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI OCCUPANCY FORECAST</span>
            </div>
            <div className="text-2xl font-display font-bold text-softwhite">
              {forecast.predictions[1]?.predicted_occupancy || 84} Seats (1h)
            </div>
            <div className="mt-1 text-xs font-mono text-subtlegrey">
              Confidence Band: [{forecast.predictions[1]?.confidence_interval[0]} -{' '}
              {forecast.predictions[1]?.confidence_interval[1]}] seats
            </div>
          </div>
        )}
      </section>

      {/* Feature Grid Architecture Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan">
            AUTONOMOUS CAMPUS MATRIX
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-softwhite mt-2">
            Engineered for Precision & Spatial Flow
          </h2>
          <p className="mt-3 text-subtlegrey text-sm font-sans">
            LIBRΛ bridges real-time IoT hardware telemetry with predictive machine learning algorithms to eliminate seat search times and optimize academic resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan/20 hover:border-cyan/50 transition-all hover:shadow-cyan-glow group">
            <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-softwhite">
              3D Digital Twin University Library
            </h3>
            <p className="mt-2 text-xs text-subtlegrey leading-relaxed">
              Fully interactive spatial model of 4 library floors. Click any seat to inspect power outlets, monitors, noise ratings, and reserve with instant double-booking prevention.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-violet/20 hover:border-violet/50 transition-all hover:shadow-violet-glow group">
            <div className="w-12 h-12 rounded-xl bg-violet/10 border border-violet/30 text-violet flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-softwhite">
              AI Multi-Horizon Forecaster
            </h3>
            <p className="mt-2 text-xs text-subtlegrey leading-relaxed">
              Trained on 12-month calendar and footfall data. Evaluates XGBoost, Random Forest, and Linear Regression with real-time 30m, 1h, 3h, 6h, and 24h crowd forecasts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-softwhite">
              Hardware-Agnostic IoT Ingestion
            </h3>
            <p className="mt-2 text-xs text-subtlegrey leading-relaxed">
              Production-ready ingestion API for ESP32, IR people counters, PIR motion sensors, and RFID turnstiles. Real-time WebSocket event synchronization.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

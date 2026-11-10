import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, occupancyApi, predictionsApi, booksApi, mlLabApi } from '../../services/api';
import { OccupancySummary, OccupancyForecast, MLTelemetry } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { HourlyDemandChart } from '../../components/charts/HourlyDemandChart';
import { ModelComparisonChart } from '../../components/charts/ModelComparisonChart';
import {
  ShieldCheck, Activity, Users, BookOpen, Cpu,
  Sparkles, ArrowRight, Download, Wifi, Layers, AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<OccupancySummary | null>(null);
  const [forecast, setForecast] = useState<OccupancyForecast | null>(null);
  const [bookDemand, setBookDemand] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<MLTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [sum, occ, fc, bd, tel] = await Promise.all([
          analyticsApi.getSummary(),
          occupancyApi.getCurrent(),
          predictionsApi.getForecast(),
          booksApi.getDemandForecast(),
          mlLabApi.getTelemetry(),
        ]);
        setSummary(sum);
        setOccupancy(occ);
        setForecast(fc);
        setBookDemand(bd);
        setTelemetry(tel);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-cyan/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CENTRAL LIBRARY INTELLIGENCE COMMAND HQ</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-softwhite">
            System Operations Matrix
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Autonomous multi-floor monitoring, sensor mesh ingestion, and ML demand arbitration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/ml-lab"
            className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            OPEN 3D ML LAB
          </Link>
          <a
            href={analyticsApi.downloadCsvUrl}
            className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold glass-panel border border-white/10 hover:border-cyan text-softwhite transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan" />
            EXPORT CSV REPORT
          </a>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      {occupancy && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="DAILY VISITOR COUNT"
            value={summary.total_visitors_today}
            subtitle="Campus turnstile & RFID entrances"
            icon={<Users className="w-5 h-5" />}
            trend={{ value: "+14.2% vs last week", isPositive: true }}
            accentColor="cyan"
          />
          <StatCard
            title="CURRENT OCCUPANCY"
            value={`${occupancy.occupancy_percentage}%`}
            subtitle={`${occupancy.occupied_seats} of ${occupancy.total_capacity} seats`}
            icon={<Activity className="w-5 h-5" />}
            accentColor="rose"
          />
          <StatCard
            title="PREDICTED SHORTAGES"
            value={bookDemand?.critical_shortage_count || 3}
            subtitle="High-demand titles with ≤1 copy"
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="amber"
          />
          <StatCard
            title="CHAMPION MODEL ACCURACY"
            value="R² 0.9533"
            subtitle="XGBoost 50-Tree Regressor (v1.2)"
            icon={<Cpu className="w-5 h-5" />}
            trend={{ value: "MAE: 12.69 seats", isPositive: true }}
            accentColor="emerald"
          />
        </div>
      )}

      {/* Two-Column Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual vs Predicted Ground Truth */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono uppercase text-cyan">VALIDATION TELEMETRY</span>
              <h2 className="font-display font-bold text-lg text-softwhite">
                Actual vs Predicted Model Divergence
              </h2>
            </div>
            <Link to="/admin/predictions" className="text-xs font-mono text-cyan hover:underline">
              Residuals →
            </Link>
          </div>
          {telemetry?.actual_vs_predicted && (
            <ModelComparisonChart data={telemetry.actual_vs_predicted.slice(-30)} />
          )}
        </div>

        {/* Floor Utilization Comparison */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono uppercase text-violet">ARCHITECTURAL ALLOCATION</span>
              <h2 className="font-display font-bold text-lg text-softwhite">
                Floor-Wise Capacity Utilization
              </h2>
            </div>
            <Link to="/admin/occupancy" className="text-xs font-mono text-violet hover:underline">
              Manage Floors →
            </Link>
          </div>

          <div className="space-y-4">
            {occupancy?.floors.map((fl) => (
              <div key={fl.floor_id} className="p-3.5 rounded-xl bg-navy/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-softwhite">
                    Level {fl.floor_number}: {fl.name}
                  </span>
                  <span className="text-cyan font-bold">{fl.occupancy_percentage}%</span>
                </div>
                <div className="w-full bg-navy rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan to-violet"
                    style={{ width: `${fl.occupancy_percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-subtlegrey">
                  <span>In Use: {fl.occupied} seats</span>
                  <span>Available: {fl.available} seats</span>
                  <span>Noise: {fl.noise_level_tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Demand & Acquisition Recommendations Card */}
      {bookDemand && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="font-display font-bold text-lg text-softwhite">
                  High-Demand Book Titles & Resource Shortage Predictions
                </h2>
                <p className="text-xs font-mono text-subtlegrey">
                  Recommended acquisition orders calculated from student borrowing velocity & exam countdown
                </p>
              </div>
            </div>
            <Link
              to="/admin/resources"
              className="text-xs font-mono text-cyan hover:underline flex items-center gap-1"
            >
              Full Acquisition Analysis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bookDemand.items.slice(0, 3).map((item: any) => (
              <div
                key={item.book_id}
                className="p-4 rounded-xl bg-navy/60 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan uppercase">{item.category}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      item.shortage_risk === 'HIGH'
                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {item.shortage_risk} RISK
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm text-softwhite line-clamp-1">
                  {item.title}
                </h3>
                <div className="text-xs font-mono text-subtlegrey">
                  Copies on Shelf: <strong className="text-rose-400">{item.available_copies}</strong> of {item.total_copies}
                </div>
                <div className="text-xs font-mono text-emerald-400 pt-1 border-t border-white/5">
                  ★ Recommended Acquisition: +{item.recommended_acquisition} copies
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

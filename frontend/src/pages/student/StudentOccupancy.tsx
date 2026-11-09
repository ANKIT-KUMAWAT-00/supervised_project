import React, { useEffect, useState } from 'react';
import { occupancyApi, predictionsApi } from '../../services/api';
import { OccupancySummary, OccupancyForecast } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { HourlyDemandChart } from '../../components/charts/HourlyDemandChart';
import { Activity, Clock, ShieldCheck, Zap, Layers, AlertCircle } from 'lucide-react';

export const StudentOccupancy: React.FC = () => {
  const [occupancy, setOccupancy] = useState<OccupancySummary | null>(null);
  const [forecast, setForecast] = useState<OccupancyForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const [occ, fc] = await Promise.all([
          occupancyApi.getCurrent(),
          predictionsApi.getForecast(),
        ]);
        setOccupancy(occ);
        setForecast(fc);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOccupancy();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase text-cyan tracking-wider">
          REAL-TIME SPATIAL ANALYTICS
        </span>
        <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
          Occupancy Intelligence & Capacity Breakdown
        </h1>
        <p className="text-xs font-mono text-subtlegrey mt-1">
          Live sensor telemetry combined with XGBoost ensemble forecasting across 4 architectural levels
        </p>
      </div>

      {/* Overview Stat Cards */}
      {occupancy && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="TOTAL SYSTEM OCCUPANCY"
            value={`${occupancy.occupancy_percentage}%`}
            subtitle={`${occupancy.occupied_seats} / ${occupancy.total_capacity} Active Seats`}
            icon={<Activity className="w-5 h-5" />}
            accentColor="cyan"
          />
          <StatCard
            title="FREE CAPACITY"
            value={occupancy.available_seats}
            subtitle="Seats unreserved"
            accentColor="emerald"
          />
          <StatCard
            title="CAMPUS STATUS"
            value={occupancy.current_status}
            subtitle="Calculated density metric"
            accentColor="violet"
          />
          <StatCard
            title="FORECAST 1-HOUR"
            value={`${forecast?.predictions[1]?.predicted_occupancy || 84} Seats`}
            subtitle={`${forecast?.predictions[1]?.predicted_percentage || 70}% predicted`}
            accentColor="amber"
          />
        </div>
      )}

      {/* Floor-by-Floor Live Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-mono uppercase text-cyan">MULTI-LEVEL STATUS</span>
            <h2 className="text-lg font-display font-bold text-softwhite">
              Floor Utilization & Atmosphere Ratings
            </h2>
          </div>
          <span className="text-xs font-mono text-subtlegrey">
            Updated via IoT Doorways & Pressure Pads
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {occupancy?.floors.map((fl) => (
            <div
              key={fl.floor_id}
              className="p-4 rounded-xl bg-navy/60 border border-white/5 hover:border-cyan/30 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan">LEVEL {fl.floor_number}</span>
                  <h3 className="font-display font-bold text-base text-softwhite">
                    {fl.name}
                  </h3>
                </div>
                <StatusBadge status={fl.occupancy_percentage >= 80 ? 'critical' : fl.occupancy_percentage >= 50 ? 'moderate' : 'available'} />
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-mono text-subtlegrey mb-1">
                  <span>Occupancy: {fl.occupied} / {fl.capacity} seats</span>
                  <span className="text-softwhite font-bold">{fl.occupancy_percentage}%</span>
                </div>
                <div className="w-full bg-navy rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-500 ${
                      fl.occupancy_percentage >= 80
                        ? 'bg-rose-500'
                        : fl.occupancy_percentage >= 50
                        ? 'bg-cyan'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${fl.occupancy_percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-subtlegrey pt-2 border-t border-white/5">
                <span>Noise: <strong className="text-ice capitalize">{fl.noise_level_tag}</strong></span>
                <span>Available: <strong className="text-emerald-400">{fl.available} seats</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Multi-Horizon Predictive Timeline */}
      {forecast && (
        <div className="glass-panel p-6 rounded-2xl border border-violet/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono uppercase text-violet">XGBOOST ML ENGINE</span>
              <h2 className="text-lg font-display font-bold text-softwhite">
                Multi-Horizon Occupancy Forecast (Next 24 Hours)
              </h2>
            </div>
            <span className="text-xs font-mono text-subtlegrey">
              Model: {forecast.champion_model}
            </span>
          </div>

          {/* Forecast Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {forecast.predictions.map((p) => (
              <div
                key={p.horizon}
                className="p-3.5 rounded-xl bg-navy/60 border border-violet/30 text-center"
              >
                <div className="text-[10px] font-mono uppercase text-subtlegrey">{p.horizon}</div>
                <div className="text-xl font-display font-bold text-softwhite mt-1">
                  {p.predicted_occupancy} <span className="text-xs font-mono text-subtlegrey">seats</span>
                </div>
                <div className="text-xs font-mono text-cyan mt-0.5">
                  {p.predicted_percentage}%
                </div>
                <div className="text-[10px] font-mono text-subtlegrey mt-1">
                  [{p.confidence_interval[0]} - {p.confidence_interval[1]}]
                </div>
              </div>
            ))}
          </div>

          {/* 24-Hour Forecast Curve */}
          <HourlyDemandChart data={forecast.hourly_24h_curve} isForecast={true} />
        </div>
      )}
    </div>
  );
};

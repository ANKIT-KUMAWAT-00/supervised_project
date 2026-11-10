import React, { useEffect, useState } from 'react';
import { predictionsApi, mlLabApi } from '../../services/api';
import { OccupancyForecast, MLTelemetry } from '../../types';
import { HourlyDemandChart } from '../../components/charts/HourlyDemandChart';
import { ModelComparisonChart } from '../../components/charts/ModelComparisonChart';
import { Cpu, Database, TrendingUp, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminPredictions: React.FC = () => {
  const [forecast, setForecast] = useState<OccupancyForecast | null>(null);
  const [telemetry, setTelemetry] = useState<MLTelemetry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async () => {
    try {
      const [fc, tel] = await Promise.all([
        predictionsApi.getForecast(),
        mlLabApi.getTelemetry(),
      ]);
      setForecast(fc);
      setTelemetry(tel);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan tracking-wider">
            MACHINE LEARNING INFERENCE RADAR
          </span>
          <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
            Predictive Occupancy Engine & Horizons
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Real-time multi-horizon forecasts with confidence boundaries and algorithm benchmarking
          </p>
        </div>

        <button
          onClick={fetchForecast}
          className="p-2.5 rounded-xl glass-panel text-subtlegrey hover:text-cyan border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Model Benchmark Card */}
      {telemetry?.models && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(telemetry.models).map(([key, m]: [string, any]) => {
            const isChamp = key === telemetry.champion_model;
            return (
              <div
                key={key}
                className={`p-5 rounded-2xl glass-panel border transition-all ${
                  isChamp
                    ? 'border-cyan/50 shadow-cyan-glow bg-gradient-to-br from-navy/90 to-cyan/10'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-subtlegrey uppercase">{key.replace('_', ' ')}</span>
                  {isChamp && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan text-midnight">
                      CHAMPION MODEL
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-lg text-softwhite">{m.name}</h3>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 rounded-lg bg-navy/60 border border-white/5">
                    <span className="text-[10px] text-subtlegrey block">MAE</span>
                    <strong className="text-softwhite text-sm">{m.mae}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-navy/60 border border-white/5">
                    <span className="text-[10px] text-subtlegrey block">RMSE</span>
                    <strong className="text-softwhite text-sm">{m.rmse}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-navy/60 border border-white/5">
                    <span className="text-[10px] text-subtlegrey block">R²</span>
                    <strong className="text-emerald-400 text-sm">{m.r2}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Horizon Cards */}
      {forecast && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
          <h2 className="font-display font-bold text-lg text-softwhite mb-4">
            Multi-Horizon Confidence Intervals
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {forecast.predictions.map((p) => (
              <div
                key={p.horizon}
                className="p-4 rounded-xl bg-navy/60 border border-cyan/20 text-center space-y-1"
              >
                <div className="text-[10px] font-mono uppercase text-cyan">{p.horizon}</div>
                <div className="text-2xl font-display font-bold text-softwhite">
                  {p.predicted_occupancy} <span className="text-xs font-mono text-subtlegrey">seats</span>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  {p.predicted_percentage}% Crowd
                </div>
                <div className="text-[10px] font-mono text-subtlegrey">
                  [{p.confidence_interval[0]} - {p.confidence_interval[1]} seats]
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24-Hour Forecast Curve */}
      {forecast && (
        <div className="glass-panel p-6 rounded-2xl border border-violet/20">
          <h2 className="font-display font-bold text-lg text-softwhite mb-4">
            24-Hour Forward Occupancy Projection
          </h2>
          <HourlyDemandChart data={forecast.hourly_24h_curve} isForecast={true} />
        </div>
      )}
    </div>
  );
};

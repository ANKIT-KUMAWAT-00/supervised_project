import React, { useEffect, useState } from 'react';
import { analyticsApi, occupancyApi } from '../../services/api';
import { OccupancyHeatmap } from '../../components/charts/OccupancyHeatmap';
import { HourlyDemandChart } from '../../components/charts/HourlyDemandChart';
import { ModelComparisonChart } from '../../components/charts/ModelComparisonChart';
import { Download, LineChart, Layers, Calendar, Filter, RefreshCw } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [errorAnalysis, setErrorAnalysis] = useState<any>(null);
  const [hourlyTrend, setHourlyTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [sum, err, trend] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getErrorAnalysis(),
        occupancyApi.getHourlyTrend(),
      ]);
      setSummary(sum);
      setErrorAnalysis(err);
      setHourlyTrend(trend);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan tracking-wider">
            CAMPUS DATA WAREHOUSE & ANALYTICS
          </span>
          <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
            Historical Occupancy & Error Distributions
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Aggregated time-series observations, heatmaps, and residual error analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={analyticsApi.downloadCsvUrl}
            className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD CSV DATASET
          </a>
          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl glass-panel text-subtlegrey hover:text-cyan border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Heatmap Section */}
      {summary?.heatmap && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono uppercase text-cyan">TEMPORAL DENSITY MATRIX</span>
              <h2 className="font-display font-bold text-lg text-softwhite">
                7-Day Hourly Occupancy Heatmap (08:00 — 20:00)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-subtlegrey">
              <span className="w-2.5 h-2.5 rounded bg-navy/60 border border-white/10" /> Low
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/50" /> Med
              <span className="w-2.5 h-2.5 rounded bg-amber-500/70" /> High
              <span className="w-2.5 h-2.5 rounded bg-rose-500/80" /> Peak
            </div>
          </div>
          <OccupancyHeatmap data={summary.heatmap} />
        </div>
      )}

      {/* Weekly Patterns & Daily Averages */}
      {summary?.weekly_patterns && (
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          {summary.weekly_patterns.map((wp: any) => (
            <div
              key={wp.day}
              className="p-4 glass-panel rounded-xl border border-cyan/15 text-center space-y-1"
            >
              <div className="text-xs font-mono text-subtlegrey font-bold">{wp.day}</div>
              <div className="text-2xl font-display font-bold text-softwhite">
                {wp.avg_occupancy}%
              </div>
              <div className="text-[10px] font-mono text-cyan">Peak: {wp.peak_hour}</div>
              <div className="text-[10px] font-mono text-subtlegrey">
                Index: {wp.traffic_index}x
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Divergence & Error Analysis */}
      {errorAnalysis?.actual_vs_predicted && (
        <div className="glass-panel p-6 rounded-2xl border border-violet/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono uppercase text-violet">
                RESIDUAL ERROR & VALIDATION CURVES
              </span>
              <h2 className="font-display font-bold text-lg text-softwhite">
                Multi-Model Actual vs Predicted Divergence
              </h2>
            </div>
            <div className="text-xs font-mono text-subtlegrey">
              Champion Model:{' '}
              <strong className="text-cyan uppercase">{errorAnalysis.champion}</strong>
            </div>
          </div>
          <ModelComparisonChart data={errorAnalysis.actual_vs_predicted} />
        </div>
      )}
    </div>
  );
};

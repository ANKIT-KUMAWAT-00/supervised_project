import React, { useEffect, useState } from 'react';
import { booksApi } from '../../services/api';
import { BookOpen, AlertTriangle, Sparkles, TrendingUp, ShoppingCart, RefreshCw } from 'lucide-react';

export const AdminResources: React.FC = () => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDemand = async () => {
    try {
      const data = await booksApi.getDemandForecast();
      setForecastData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemand();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan tracking-wider">
            RESOURCE ACQUISITION INTELLIGENCE
          </span>
          <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
            Book Demand Forecasting & Stock Replenishment
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Automated shortage risk detection and recommended acquisition quantities
          </p>
        </div>

        <button
          onClick={fetchDemand}
          className="p-2.5 rounded-xl glass-panel text-subtlegrey hover:text-cyan border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Stats */}
      {forecastData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-cyan/20">
            <span className="text-xs font-mono text-subtlegrey">TOTAL TITLES ANALYZED</span>
            <div className="text-3xl font-display font-bold text-softwhite mt-1">
              {forecastData.total_books_analyzed}
            </div>
            <div className="text-xs font-mono text-cyan mt-1">100% catalog coverage</div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-rose-500/30">
            <span className="text-xs font-mono text-rose-400">CRITICAL SHORTAGES</span>
            <div className="text-3xl font-display font-bold text-rose-400 mt-1">
              {forecastData.critical_shortage_count}
            </div>
            <div className="text-xs font-mono text-subtlegrey mt-1">≤1 copy available</div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-emerald-500/20">
            <span className="text-xs font-mono text-emerald-400">RECOMMENDED ORDERS</span>
            <div className="text-3xl font-display font-bold text-emerald-400 mt-1">
              +{forecastData.total_recommended_acquisitions}
            </div>
            <div className="text-xs font-mono text-subtlegrey mt-1">Copies suggested</div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-violet/20">
            <span className="text-xs font-mono text-violet">MODEL ACCURACY (R²)</span>
            <div className="text-3xl font-display font-bold text-violet mt-1">
              {forecastData.r2}
            </div>
            <div className="text-xs font-mono text-subtlegrey mt-1">MAE: {forecastData.mae}</div>
          </div>
        </div>
      )}

      {/* Resource Inventory & Shortage Forecast Table */}
      {forecastData?.items && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-softwhite">
              Resource Shortage Predictions & Recommended Acquisitions
            </h2>
            <span className="text-xs font-mono text-subtlegrey">
              Model: Random Forest Regressor
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] uppercase text-subtlegrey border-b border-white/10">
                <tr>
                  <th className="pb-3">Title & Subject</th>
                  <th className="pb-3">Copies On Shelf</th>
                  <th className="pb-3">AI Demand Score</th>
                  <th className="pb-3">Borrow Frequency</th>
                  <th className="pb-3">Shortage Risk</th>
                  <th className="pb-3">Recommended Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {forecastData.items.map((b: any) => (
                  <tr key={b.book_id} className="hover:bg-white/5">
                    <td className="py-3">
                      <div className="font-bold text-softwhite text-sm">{b.title}</div>
                      <div className="text-xs text-subtlegrey font-sans">
                        {b.author} • <span className="text-cyan">{b.category}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <strong
                        className={
                          b.available_copies <= 1 ? 'text-rose-400' : 'text-emerald-400'
                        }
                      >
                        {b.available_copies}
                      </strong>{' '}
                      / {b.total_copies}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-ice font-bold">
                          {Math.round(b.predicted_demand_score * 100)}%
                        </span>
                        <div className="w-16 bg-navy rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan h-full"
                            style={{ width: `${b.predicted_demand_score * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-subtlegrey">
                      {b.borrow_frequency_per_month} / mo
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          b.shortage_risk === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : b.shortage_risk === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {b.shortage_risk}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400">
                      {b.recommended_acquisition > 0 ? (
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="w-3.5 h-3.5" /> +{b.recommended_acquisition} copies
                        </span>
                      ) : (
                        <span className="text-subtlegrey">Sufficient</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

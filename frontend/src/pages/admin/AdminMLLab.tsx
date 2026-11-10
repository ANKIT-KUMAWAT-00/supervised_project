import React, { useEffect, useState } from 'react';
import { mlLabApi } from '../../services/api';
import { MLTelemetry } from '../../types';
import { ML3DLab } from '../../components/3d/ML3DLab';
import { Cpu, RefreshCw, Layers, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdminMLLab: React.FC = () => {
  const [telemetry, setTelemetry] = useState<MLTelemetry | null>(null);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      const data = await mlLabApi.getTelemetry();
      setTelemetry(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setStatusMessage('Initiating cross-validated training on 6,200+ samples...');
    try {
      const res = await mlLabApi.triggerRetraining();
      setTelemetry(res.telemetry);
      setStatusMessage(`Retraining succeeded! Deployed ${res.champion_model} in ${res.duration_seconds}s.`);
    } catch (e) {
      setStatusMessage('Retraining error occurred.');
    } finally {
      setIsRetraining(false);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan tracking-wider">
            INTERACTIVE 3D MACHINE LEARNING LABORATORY
          </span>
          <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
            Algorithmic Forest & Regression Manifold
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Live 3D decision trees, fitted regression plane through point clouds, and real-time training telemetry
          </p>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* 3D Machine Learning Lab Viewport */}
      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-cyan/30 shadow-cyan-glow relative">
        <ML3DLab
          telemetry={telemetry}
          onRetrain={handleRetrain}
          isRetraining={isRetraining}
        />
      </div>

      {/* Feature Importance & Model Comparisons Table */}
      {telemetry && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Weights */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
            <h2 className="font-display font-bold text-lg text-softwhite mb-4">
              XGBoost / Random Forest Feature Importances
            </h2>
            <div className="space-y-2.5">
              {Object.entries(
                telemetry.models?.xgboost?.feature_importances ||
                telemetry.models?.random_forest?.feature_importances ||
                {}
              )
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 8)
                .map(([feat, imp]: [string, any]) => (
                  <div key={feat} className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-subtlegrey">{feat}</span>
                      <span className="text-cyan font-bold">{Math.round(imp * 100)}%</span>
                    </div>
                    <div className="w-full bg-navy rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan h-full" style={{ width: `${imp * 100}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Sequential Boosting Stages */}
          <div className="glass-panel p-6 rounded-2xl border border-violet/20">
            <h2 className="font-display font-bold text-lg text-softwhite mb-4">
              Sequential Boosting Iterations (XGBoost)
            </h2>
            <div className="space-y-3">
              {telemetry.xgboost_stages?.map((stage) => (
                <div
                  key={stage.stage}
                  className="p-3 rounded-xl bg-navy/60 border border-violet/30 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="text-violet font-bold">STAGE {stage.stage + 1}:</span>{' '}
                    <span className="text-softwhite">{stage.tree_summary}</span>
                  </div>
                  <span className="text-cyan">η = {stage.weight_scale}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

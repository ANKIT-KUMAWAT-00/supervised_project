import React, { useEffect, useState } from 'react';
import { sensorsApi } from '../../services/api';
import { SensorDevice } from '../../types';
import { useWebSocket } from '../../context/WebSocketContext';
import {
  Wifi, Activity, Battery, Radio, Play, RefreshCw,
  ShieldCheck, AlertCircle, Terminal, Check
} from 'lucide-react';

export const AdminSensors: React.FC = () => {
  const [sensors, setSensors] = useState<SensorDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pulsing, setPulsing] = useState<boolean>(false);
  const [lastPulseData, setLastPulseData] = useState<any>(null);

  const { lastMessage } = useWebSocket();

  const fetchSensors = async () => {
    try {
      const data = await sensorsApi.list();
      setSensors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  // Sync sensor telemetry pulses from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'SENSOR_PULSE') {
      setLastPulseData(lastMessage.data);
      // update sensor list heartbeat
      setSensors((prev) =>
        prev.map((s) =>
          s.device_code === lastMessage.data.device_code
            ? { ...s, last_heartbeat: new Date().toISOString(), battery_level: lastMessage.data.battery_level }
            : s
        )
      );
    }
  }, [lastMessage]);

  const handleSimulatePulse = async () => {
    setPulsing(true);
    try {
      const res = await sensorsApi.simulatePulse();
      setLastPulseData(res.data);
    } catch (e) {
      alert('Error triggering pulse');
    } finally {
      setPulsing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan tracking-wider">
            CAMPUS IOT TELEMETRY & EDGE NODES
          </span>
          <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
            Hardware Network & Sensor Ingestion
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Edge nodes, doorway IR beam counters, PIR motion detectors, and pressure mats
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulatePulse}
            disabled={pulsing}
            className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center gap-2"
          >
            <Play className={`w-3.5 h-3.5 ${pulsing ? 'animate-spin' : ''}`} />
            {pulsing ? 'TRANSMITTING...' : 'INJECT SENSOR PULSE'}
          </button>
          <button
            onClick={fetchSensors}
            className="p-2.5 rounded-xl glass-panel text-subtlegrey hover:text-cyan border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Telemetry Pulse Alert if recent */}
      {lastPulseData && (
        <div className="p-4 rounded-2xl glass-panel border border-cyan/40 bg-gradient-to-r from-navy/90 to-cyan/10 flex items-center justify-between text-xs font-mono text-softwhite animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping" />
            <div>
              <strong className="text-cyan">{lastPulseData.device_code}</strong> on Level{' '}
              {lastPulseData.floor_id} emitted{' '}
              <strong className="text-emerald-400 uppercase">
                {lastPulseData.event_type}
              </strong>{' '}
              (Count Δ: {lastPulseData.count_change})
            </div>
          </div>
          <span className="text-subtlegrey">
            Battery: {lastPulseData.battery_level}%
          </span>
        </div>
      )}

      {/* Sensors Status Table */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
        <h2 className="font-display font-bold text-lg text-softwhite mb-4">
          Active Hardware Sensor Register
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] uppercase text-subtlegrey border-b border-white/10">
              <tr>
                <th className="pb-3">Device Code</th>
                <th className="pb-3">Sensor Type</th>
                <th className="pb-3">Floor / Zone</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Battery</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sensors.map((s) => (
                <tr key={s.id} className="hover:bg-white/5">
                  <td className="py-3 font-bold text-softwhite">{s.device_code}</td>
                  <td className="py-3 text-cyan uppercase">{s.sensor_type.replace('_', ' ')}</td>
                  <td className="py-3 text-subtlegrey">
                    Level {s.floor_number} • {s.section_name}
                  </td>
                  <td className="py-3 text-subtlegrey">{s.ip_address}</td>
                  <td className="py-3">
                    <span
                      className={
                        s.battery_level < 25 ? 'text-rose-400 font-bold' : 'text-emerald-400'
                      }
                    >
                      {s.battery_level}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        s.status === 'online'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 text-subtlegrey">
                    {new Date(s.last_heartbeat).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hardware Ingestion API Docs Snippet */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 font-mono text-xs">
        <div className="flex items-center gap-2 mb-2 text-cyan">
          <Terminal className="w-4 h-4" />
          <span className="font-bold uppercase">ESP32 / Edge Gateway Ingestion Endpoint</span>
        </div>
        <p className="text-subtlegrey mb-3">
          Deploy hardware sensors to send anonymous JSON telemetry packets via HTTP POST to the backend API:
        </p>
        <pre className="p-4 rounded-xl bg-midnight border border-white/5 text-ice overflow-x-auto text-[11px]">
{`curl -X POST http://librava-host:8000/api/sensors/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_code": "IOT-GATE-001",
    "event_type": "entry",
    "count_delta": 1,
    "raw_payload": "{\\"ir_break_ms\\": 140, \\"direction\\": \\"inbound\\"}"
  }'`}
        </pre>
      </div>
    </div>
  );
};

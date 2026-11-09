import React, { useEffect, useState } from 'react';
import { reservationsApi } from '../../services/api';
import { Reservation } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BookmarkCheck, Check, LogOut, X, Clock, MapPin,
  QrCode, AlertCircle, RefreshCw
} from 'lucide-react';

export const StudentReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchReservations = async () => {
    try {
      const data = await reservationsApi.getMyReservations();
      setReservations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCheckIn = async (id: number) => {
    setActionLoading(id);
    try {
      await reservationsApi.checkIn(id);
      await fetchReservations();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Check-in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (id: number) => {
    setActionLoading(id);
    try {
      await reservationsApi.checkOut(id);
      await fetchReservations();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Check-out failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to release this seat reservation?')) return;
    setActionLoading(id);
    try {
      await reservationsApi.cancel(id);
      await fetchReservations();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Cancellation failed');
    } finally {
      setActionLoading(null);
    }
  };

  const activeReservations = reservations.filter((r) => r.status === 'active');
  const pastReservations = reservations.filter((r) => r.status !== 'active');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-cyan tracking-wider">
            RESERVATION MANAGEMENT
          </span>
          <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
            My Study Space Bookings
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Enforced with double-booking prevention, automated check-ins, and space release
          </p>
        </div>
        <button
          onClick={fetchReservations}
          className="p-2 rounded-xl glass-panel text-subtlegrey hover:text-cyan border border-white/10"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Active Booking Hero Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan/30 shadow-cyan-glow">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping" />
          <h2 className="font-display font-bold text-lg text-softwhite">
            Current Active Reservation
          </h2>
        </div>

        {activeReservations.length === 0 ? (
          <div className="text-center py-8 text-subtlegrey text-xs font-mono">
            No active reservations. You can reserve a seat directly via the 3D Digital Twin!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeReservations.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-xl bg-navy/80 border border-cyan/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan">LEVEL {r.floor_number}</span>
                    <h3 className="font-display font-bold text-xl text-softwhite">
                      Seat {r.seat_number}
                    </h3>
                  </div>
                  <StatusBadge status={r.check_in_time ? 'occupied' : 'reserved'} />
                </div>

                <div className="space-y-1.5 text-xs font-mono text-subtlegrey">
                  <div className="flex justify-between">
                    <span>Section:</span>
                    <span className="text-ice">{r.section_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Booking Window:</span>
                    <span className="text-softwhite">
                      {new Date(r.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —{' '}
                      {new Date(r.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Access Code:</span>
                    <span className="text-cyan font-bold tracking-wider">{r.reservation_code}</span>
                  </div>
                  {r.check_in_time && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Checked In At:</span>
                      <span>{new Date(r.check_in_time).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* Check-In / Check-Out / Cancel Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  {!r.check_in_time ? (
                    <button
                      onClick={() => handleCheckIn(r.id)}
                      disabled={actionLoading === r.id}
                      className="flex-1 py-2 rounded-xl text-xs font-mono font-bold bg-cyan text-midnight hover:bg-ice transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {actionLoading === r.id ? 'VERIFYING...' : 'CHECK IN NOW'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckOut(r.id)}
                      disabled={actionLoading === r.id}
                      className="flex-1 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 text-midnight hover:bg-emerald-400 transition-all flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {actionLoading === r.id ? 'PROCESSING...' : 'COMPLETE & RELEASE'}
                    </button>
                  )}

                  <button
                    onClick={() => handleCancel(r.id)}
                    disabled={actionLoading === r.id}
                    className="p-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Cancel Reservation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Reservations Table */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
        <h2 className="font-display font-bold text-lg text-softwhite mb-4">
          Reservation History & Audit Log
        </h2>

        {pastReservations.length === 0 ? (
          <div className="text-center py-6 text-subtlegrey text-xs font-mono">
            No historical completed bookings recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] uppercase text-subtlegrey border-b border-white/10">
                <tr>
                  <th className="pb-3">Seat</th>
                  <th className="pb-3">Floor / Section</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pastReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5">
                    <td className="py-3 font-bold text-softwhite">{r.seat_number}</td>
                    <td className="py-3 text-subtlegrey">
                      L{r.floor_number} • {r.section_name}
                    </td>
                    <td className="py-3 text-cyan">{r.reservation_code}</td>
                    <td className="py-3 text-subtlegrey">
                      {new Date(r.start_time).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                          r.status === 'completed'
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                            : 'text-subtlegrey bg-slate-500/10'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Seat } from '../../types';
import { reservationsApi } from '../../services/api';
import { StatusBadge } from './StatusBadge';
import { X, Check, Zap, Monitor, Compass, ShieldCheck, Clock, BookmarkCheck } from 'lucide-react';

interface SeatBookingModalProps {
  seat: Seat | null;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const SeatBookingModal: React.FC<SeatBookingModalProps> = ({
  seat,
  onClose,
  onBookingSuccess,
}) => {
  const [duration, setDuration] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);

  if (!seat) return null;

  const handleBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationsApi.create(seat.id, duration);
      setConfirmedCode(res.reservation_code);
      onBookingSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to book seat. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-cyan/40 shadow-cyan-glow relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-subtlegrey hover:text-softwhite hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedCode ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-softwhite">
              Reservation Confirmed!
            </h3>
            <p className="text-xs font-mono text-subtlegrey mt-1">
              Seat {seat.seat_number} has been allocated to your account.
            </p>
            <div className="my-6 p-4 rounded-xl bg-navy/80 border border-cyan/30 text-center">
              <div className="text-[10px] font-mono uppercase text-cyan tracking-wider">
                ACCESS CODE
              </div>
              <div className="text-2xl font-mono font-bold text-softwhite tracking-widest mt-1">
                {confirmedCode}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan text-midnight hover:bg-ice transition-all"
            >
              DONE
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan">
                  3D DIGITAL TWIN INSPECTOR
                </span>
                <h3 className="font-display font-bold text-xl text-softwhite mt-0.5">
                  Seat {seat.seat_number}
                </h3>
              </div>
              <StatusBadge status={seat.status} />
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-navy/60 border border-white/5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-subtlegrey">Section:</span>
                <span className="text-ice">{seat.section_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtlegrey">Floor Level:</span>
                <span className="text-ice">{seat.floor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtlegrey">3D Coordinates:</span>
                <span className="text-subtlegrey">
                  X: {seat.x_pos.toFixed(1)} | Y: {seat.y_pos.toFixed(1)} | Z: {seat.z_pos.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-cyan text-[11px]">
                {seat.has_power_outlet && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> AC Outlet
                  </span>
                )}
                {seat.has_monitor && (
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5" /> 4K Monitor
                  </span>
                )}
                {seat.near_window && (
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" /> Window Pod
                  </span>
                )}
              </div>
            </div>

            {seat.status === 'available' ? (
              <div className="mt-5">
                <label className="block text-xs font-mono text-subtlegrey mb-2">
                  SELECT RESERVATION DURATION:
                </label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 3, 4].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDuration(hrs)}
                      className={`py-2 rounded-xl text-xs font-mono font-medium border transition-all ${
                        duration === hrs
                          ? 'bg-cyan text-midnight border-cyan font-bold shadow-cyan-glow'
                          : 'bg-navy/50 text-softwhite border-white/10 hover:border-cyan/30'
                      }`}
                    >
                      {hrs} hr{hrs > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {loading ? 'SECURING SEAT TRANSACTION...' : 'CONFIRM SEAT RESERVATION'}
                </button>
              </div>
            ) : (
              <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
                This seat is currently <strong>{seat.status}</strong> and cannot be reserved at this moment. You can view alternative study zones from the recommendations tab.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

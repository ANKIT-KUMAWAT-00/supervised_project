import React, { useEffect, useState } from 'react';
import { libraryApi } from '../../services/api';
import { LibraryFloor, LibrarySection, Seat } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Layers, Activity, Edit3, Check, RefreshCw, AlertTriangle } from 'lucide-react';

export const AdminOccupancy: React.FC = () => {
  const [floors, setFloors] = useState<LibraryFloor[]>([]);
  const [sections, setSections] = useState<LibrarySection[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFloorData = async () => {
    try {
      const [fData, sData, stData] = await Promise.all([
        libraryApi.getFloors(),
        libraryApi.getSections(),
        libraryApi.getSeats(),
      ]);
      setFloors(fData);
      setSections(sData);
      setSeats(stData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorData();
  }, []);

  const handleStatusChange = async (seatId: number, newStatus: string) => {
    try {
      await libraryApi.updateSeatStatus(seatId, newStatus);
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: newStatus as any } : s))
      );
    } catch (e) {
      alert('Failed to update seat status');
    }
  };

  const displayedSeats = selectedFloor !== null
    ? seats.filter((s) => s.floor_id === selectedFloor)
    : seats;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan tracking-wider">
            FLOOR-BY-FLOOR OCCUPANCY MANAGEMENT
          </span>
          <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
            Zone Capacity & Seat Override Terminal
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Live seat statuses sync directly to the 3D Digital Twin and Mobile Terminals
          </p>
        </div>

        <button
          onClick={fetchFloorData}
          className="p-2.5 rounded-xl glass-panel text-subtlegrey hover:text-cyan border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Floor Filter Tabs */}
      <div className="glass-panel p-2 rounded-2xl border border-cyan/20 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedFloor(null)}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            selectedFloor === null
              ? 'bg-cyan text-midnight shadow-cyan-glow'
              : 'text-subtlegrey hover:text-softwhite'
          }`}
        >
          ALL FLOORS (120 SEATS)
        </button>
        {floors.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFloor(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedFloor === f.id
                ? 'bg-cyan text-midnight shadow-cyan-glow'
                : 'text-subtlegrey hover:text-softwhite'
            }`}
          >
            LEVEL {f.floor_number} ({f.current_occupancy}/{f.total_capacity} OCCUPIED)
          </button>
        ))}
      </div>

      {/* Seats Management Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan/15">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-softwhite">
            Individual Seat Node Matrix
          </h2>
          <span className="text-xs font-mono text-subtlegrey">
            Click status to override node state in real time
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayedSeats.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-xl bg-navy/60 border border-white/5 hover:border-cyan/30 transition-all space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-softwhite">{s.seat_number}</span>
                <span className="text-[10px] text-subtlegrey">L{s.floor_id - 1}</span>
              </div>

              <div className="text-[11px] text-subtlegrey truncate">
                {s.section_name}
              </div>

              {/* Status Selector Dropdown */}
              <select
                value={s.status}
                onChange={(e) => handleStatusChange(s.id, e.target.value)}
                className={`w-full py-1 px-2 rounded-lg text-[11px] font-mono font-bold border focus:outline-none transition-all ${
                  s.status === 'available'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : s.status === 'occupied'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : s.status === 'reserved'
                    ? 'bg-cyan-500/10 text-cyan border-cyan/40'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                <option value="available" className="bg-midnight text-emerald-400">Available</option>
                <option value="occupied" className="bg-midnight text-rose-400">Occupied</option>
                <option value="reserved" className="bg-midnight text-cyan">Reserved</option>
                <option value="maintenance" className="bg-midnight text-amber-400">Maintenance</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

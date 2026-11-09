import React, { useEffect, useState, useMemo } from 'react';
import { libraryApi } from '../../services/api';
import { Seat, LibraryFloor, LibrarySection } from '../../types';
import { LibraryDigitalTwin } from '../../components/3d/LibraryDigitalTwin';
import { SeatBookingModal } from '../../components/common/SeatBookingModal';
import { useWebSocket } from '../../context/WebSocketContext';
import {
  Layers, Filter, Flame, Compass, Search,
  CheckCircle2, RefreshCw, BookmarkCheck
} from 'lucide-react';

export const StudentLibraryMap: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [floors, setFloors] = useState<LibraryFloor[]>([]);
  const [sections, setSections] = useState<LibrarySection[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [heatmapMode, setHeatmapMode] = useState<boolean>(false);
  const [inspectingSeat, setInspectingSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { lastMessage } = useWebSocket();

  const fetchLibraryData = async () => {
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
    fetchLibraryData();
  }, []);

  // Listen to live WebSocket events for real-time seat changes!
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type === 'SEAT_STATUS_UPDATED') {
      const updated = lastMessage.data;
      setSeats((prevSeats) =>
        prevSeats.map((s) => (s.id === updated.seat_id ? { ...s, status: updated.new_status } : s))
      );
    } else if (lastMessage.type === 'SENSOR_PULSE' && lastMessage.data?.toggled_seat) {
      const toggled = lastMessage.data.toggled_seat;
      setSeats((prevSeats) =>
        prevSeats.map((s) => (s.id === toggled.seat_id ? { ...s, status: toggled.new_status } : s))
      );
    }
  }, [lastMessage]);

  // Filtered seats for finding free seats
  const filteredSeats = useMemo(() => {
    return seats.filter((s) => {
      if (selectedFloorId !== null && s.floor_id !== selectedFloorId) return false;
      if (selectedSectionId !== null && s.section_id !== selectedSectionId) return false;
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
      return true;
    });
  }, [seats, selectedFloorId, selectedSectionId, selectedStatus]);

  // Auto-find next available seat
  const handleFindAvailable = () => {
    const available = filteredSeats.find((s) => s.status === 'available');
    if (available) {
      setInspectingSeat(available);
    } else {
      alert('No seats currently available matching current filters.');
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] flex flex-col overflow-hidden rounded-2xl border border-cyan/20">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Floor Filter Tabs */}
        <div className="glass-panel p-1.5 rounded-xl border border-cyan/30 flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => {
              setSelectedFloorId(null);
              setSelectedSectionId(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedFloorId === null
                ? 'bg-cyan text-midnight font-bold shadow-cyan-glow'
                : 'text-subtlegrey hover:text-softwhite'
            }`}
          >
            ALL FLOORS
          </button>
          {floors.map((fl) => (
            <button
              key={fl.id}
              onClick={() => {
                setSelectedFloorId(fl.id);
                setSelectedSectionId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedFloorId === fl.id
                  ? 'bg-cyan text-midnight font-bold shadow-cyan-glow'
                  : 'text-subtlegrey hover:text-softwhite'
              }`}
            >
              L{fl.floor_number} ({fl.name.split(':')[1]?.trim() || fl.name})
            </button>
          ))}
        </div>

        {/* Action Controls: Heatmap, Quick Find, Refresh */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg ${
              heatmapMode
                ? 'bg-rose-500 text-white shadow-rose-500/50'
                : 'glass-panel text-softwhite hover:text-cyan border border-white/10'
            }`}
          >
            <Flame className="w-4 h-4" />
            {heatmapMode ? 'HEATMAP ACTIVE' : 'TOGGLE HEATMAP'}
          </button>

          <button
            onClick={handleFindAvailable}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 text-midnight hover:bg-emerald-400 hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <BookmarkCheck className="w-4 h-4" />
            FIND AVAILABLE SEAT
          </button>

          <button
            onClick={fetchLibraryData}
            className="p-2 rounded-xl glass-panel text-subtlegrey hover:text-cyan border border-white/10"
            title="Refresh Digital Twin Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Digital Twin Canvas */}
      <div className="flex-1 w-full h-full relative">
        <LibraryDigitalTwin
          seats={filteredSeats}
          floors={floors}
          sections={sections}
          selectedFloorId={selectedFloorId}
          selectedSectionId={selectedSectionId}
          heatmapMode={heatmapMode}
          onSelectSeat={(seat) => setInspectingSeat(seat)}
        />
      </div>

      {/* Seat Booking Modal */}
      {inspectingSeat && (
        <SeatBookingModal
          seat={inspectingSeat}
          onClose={() => setInspectingSeat(null)}
          onBookingSuccess={() => {
            fetchLibraryData();
          }}
        />
      )}
    </div>
  );
};

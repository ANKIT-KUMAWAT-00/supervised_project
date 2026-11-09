import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Seat, LibraryFloor, LibrarySection } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { LibraryFloorArchitecture } from './LibraryArchitecture3D';
import { ErgonomicChair3D } from './ErgonomicChair3D';
import {
  Compass, Eye, Maximize2, Layers, Flame,
  Search, BookmarkCheck, ArrowRight, UserCheck, Shield
} from 'lucide-react';

interface LibraryDigitalTwinProps {
  seats: Seat[];
  floors: LibraryFloor[];
  sections: LibrarySection[];
  onSelectSeat?: (seat: Seat) => void;
  selectedFloorId?: number | null;
  selectedSectionId?: number | null;
  heatmapMode?: boolean;
}

export type CameraViewMode = 'orbit' | 'isometric' | 'topdown' | 'walkthrough' | 'exploded';

// Camera controller component for smooth camera flight and mode switching
const CameraRig: React.FC<{
  viewMode: CameraViewMode;
  targetPosition: THREE.Vector3 | null;
  selectedFloorId: number | null;
}> = ({ viewMode, targetPosition, selectedFloorId }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (viewMode === 'topdown') {
      camera.position.set(0, 48, 0.1);
      camera.lookAt(0, 0, 0);
    } else if (viewMode === 'isometric') {
      camera.position.set(30, 26, 30);
      camera.lookAt(0, 8, 0);
    } else if (viewMode === 'walkthrough') {
      const targetY = selectedFloorId ? (selectedFloorId - 1) * 6 + 1.6 : 1.6;
      camera.position.set(0, targetY, 10);
      camera.lookAt(0, targetY, 0);
    } else if (viewMode === 'exploded') {
      camera.position.set(34, 30, 36);
      camera.lookAt(0, 16, 0);
    } else if (targetPosition) {
      // Focus smoothly near selected seat
      camera.position.set(targetPosition.x + 4, targetPosition.y + 3, targetPosition.z + 4);
      camera.lookAt(targetPosition.x, targetPosition.y + 0.8, targetPosition.z);
    }
  }, [viewMode, targetPosition, selectedFloorId, camera]);

  return null;
};

// Spatially integrated Occupancy Heatmap overlay for each floor
const FloorHeatmapOverlay: React.FC<{ floorY: number; occupancyRate: number }> = ({
  floorY,
  occupancyRate,
}) => {
  // Density color
  const heatColor = useMemo(() => {
    if (occupancyRate >= 0.8) return '#EF4444'; // Red
    if (occupancyRate >= 0.6) return '#F59E0B'; // Orange
    if (occupancyRate >= 0.35) return '#EAB308'; // Yellow
    return '#10B981'; // Green
  }, [occupancyRate]);

  return (
    <mesh position={[0, floorY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[34, 24]} />
      <meshBasicMaterial
        color={heatColor}
        transparent
        opacity={0.32}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export const LibraryDigitalTwin: React.FC<LibraryDigitalTwinProps> = ({
  seats,
  floors,
  sections,
  onSelectSeat,
  selectedFloorId = null,
  selectedSectionId = null,
  heatmapMode = false,
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [viewMode, setViewMode] = useState<CameraViewMode>('orbit');
  const controlsRef = useRef<any>(null);

  // Filter seats based on active floor & section selections
  const visibleSeats = useMemo(() => {
    return seats.filter((seat) => {
      if (selectedFloorId !== null && seat.floor_id !== selectedFloorId) return false;
      if (selectedSectionId !== null && seat.section_id !== selectedSectionId) return false;
      return true;
    });
  }, [seats, selectedFloorId, selectedSectionId]);

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    if (onSelectSeat) onSelectSeat(seat);
  };

  // Find nearest available seat
  const handleFindAvailable = () => {
    const available = visibleSeats.find((s) => s.status === 'available');
    if (available) {
      handleSeatClick(available);
    }
  };

  const selectedSeatPos = useMemo(() => {
    if (!selectedSeat) return null;
    return new THREE.Vector3(selectedSeat.x_pos, selectedSeat.y_pos, selectedSeat.z_pos);
  }, [selectedSeat]);

  return (
    <div className="w-full h-full relative bg-midnight select-none overflow-hidden">
      {/* 3D Canvas Viewport */}
      <Canvas
        camera={{ position: [26, 20, 28], fov: 42 }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#070B18']} />

        {/* Photorealistic Architectural Lighting */}
        <ambientLight intensity={0.85} color="#EAF4FF" />
        <directionalLight
          position={[30, 50, 30]}
          intensity={2.2}
          color="#FFF8E7" // Warm sunbeam through skylight
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={10}
          shadow-camera-far={120}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        {/* Sky/Atmosphere Ambient Reflection */}
        <directionalLight position={[-25, 20, -25]} intensity={1.1} color="#00E5FF" />
        <pointLight position={[0, 15, 0]} intensity={1.4} color="#80F0FF" distance={40} />

        {/* Camera Rig controller */}
        <CameraRig
          viewMode={viewMode}
          targetPosition={selectedSeatPos}
          selectedFloorId={selectedFloorId}
        />

        {/* Architectural Multi-Tier Library Floors */}
        {floors.map((fl) => {
          if (selectedFloorId !== null && fl.id !== selectedFloorId) return null;
          // In exploded view, separate floors along Y
          const floorY = viewMode === 'exploded' ? fl.floor_number * 10.0 : fl.floor_number * 6.0;

          // Calculate floor occupancy rate
          const fSeats = seats.filter((s) => s.floor_id === fl.id);
          const fOcc = fSeats.filter((s) => s.status === 'occupied').length;
          const occRate = fSeats.length > 0 ? fOcc / fSeats.length : 0.2;

          return (
            <group key={fl.id}>
              <LibraryFloorArchitecture
                floorNumber={fl.floor_number}
                floorY={floorY}
              />
              {/* Spatially Integrated Heatmap Overlay */}
              {heatmapMode && (
                <FloorHeatmapOverlay floorY={floorY} occupancyRate={occRate} />
              )}
            </group>
          );
        })}

        {/* 120 Interactive Ergonomic Chairs with Seated Real Human Characters */}
        {visibleSeats.map((seat) => {
          // Adjust seat Y in exploded view
          const yPos =
            viewMode === 'exploded'
              ? (seat.floor_id - 1) * 10.0 + 0.4
              : seat.y_pos;
          const adjustedSeat = { ...seat, y_pos: yPos };

          return (
            <ErgonomicChair3D
              key={seat.id}
              seat={adjustedSeat}
              isSelected={selectedSeat?.id === seat.id}
              isHovered={hoveredSeat?.id === seat.id}
              heatmapMode={heatmapMode}
              onHover={setHoveredSeat}
              onClick={handleSeatClick}
            />
          );
        })}

        {/* Smooth Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={6}
          maxDistance={75}
        />
      </Canvas>

      {/* ================= FLOATING SPATIAL HUD CONTROLS ================= */}
      {/* Top Left: Perspective & Camera Mode Switcher */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="glass-panel p-1.5 rounded-xl border border-cyan/30 shadow-cyan-glow flex items-center gap-1 pointer-events-auto">
          {[
            { id: 'orbit', label: 'ORBIT VIEW' },
            { id: 'isometric', label: 'ISOMETRIC' },
            { id: 'exploded', label: 'EXPLODED LAYERS' },
            { id: 'topdown', label: "BIRD'S-EYE" },
            { id: 'walkthrough', label: 'WALKTHROUGH' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as CameraViewMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                viewMode === mode.id
                  ? 'bg-cyan text-midnight font-bold shadow-cyan-glow'
                  : 'text-subtlegrey hover:text-softwhite'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Status Counter Badge */}
        <div className="glass-panel px-3.5 py-2 rounded-xl border border-cyan/20 pointer-events-auto flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-subtlegrey">Free:</span>
            <strong className="text-emerald-400">
              {visibleSeats.filter((s) => s.status === 'available').length}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-subtlegrey">Occupied Students:</span>
            <strong className="text-rose-400">
              {visibleSeats.filter((s) => s.status === 'occupied').length}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan" />
            <span className="text-subtlegrey">Reserved:</span>
            <strong className="text-cyan">
              {visibleSeats.filter((s) => s.status === 'reserved').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Top Right: One-Click Available Finder & Heatmap Mode */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={handleFindAvailable}
          className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 text-midnight hover:bg-emerald-400 hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          <BookmarkCheck className="w-4 h-4" />
          AUTO-TARGET FREE SEAT
        </button>

        <button
          onClick={() => {
            if (controlsRef.current) controlsRef.current.reset();
            setViewMode('orbit');
            setSelectedSeat(null);
          }}
          className="p-2 rounded-xl glass-panel text-subtlegrey hover:text-cyan border border-white/10"
          title="Reset Camera"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Center Spatial Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 glass-panel px-5 py-2 rounded-full border border-cyan/20 flex items-center gap-6 text-xs font-mono shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-glow" />
          <span className="text-softwhite">Available Chair</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-glow" />
          <span className="text-softwhite">Seated Human Student</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan shadow-cyan-glow" />
          <span className="text-softwhite">Reserved Space</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-glow" />
          <span className="text-softwhite">Maintenance</span>
        </div>
      </div>

      {/* Selected / Hovered Seat Quick HUD Tooltip */}
      {(hoveredSeat || selectedSeat) && (
        <div className="absolute top-20 right-4 z-20 glass-panel p-5 rounded-2xl border border-cyan/40 shadow-cyan-glow w-80 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan">
                SPATIAL NODE
              </span>
              <h3 className="font-display font-bold text-lg text-softwhite">
                {(hoveredSeat || selectedSeat)?.seat_number}
              </h3>
            </div>
            <StatusBadge status={(hoveredSeat || selectedSeat)?.status || 'available'} />
          </div>

          <div className="space-y-1.5 text-xs font-mono text-subtlegrey">
            <div>
              Section:{' '}
              <span className="text-ice font-semibold">
                {(hoveredSeat || selectedSeat)?.section_name}
              </span>
            </div>
            <div>
              Floor:{' '}
              <span className="text-ice">
                {(hoveredSeat || selectedSeat)?.floor_name}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-cyan">
              {(hoveredSeat || selectedSeat)?.has_power_outlet && (
                <span>⚡ AC Power</span>
              )}
              {(hoveredSeat || selectedSeat)?.has_monitor && (
                <span>🖥️ Dual 4K</span>
              )}
              {(hoveredSeat || selectedSeat)?.near_window && (
                <span>🪟 Window</span>
              )}
            </div>
          </div>

          {/* If occupied, show student activity */}
          {(hoveredSeat || selectedSeat)?.status === 'occupied' && (
            <div className="mt-3 p-2.5 rounded-xl bg-navy/80 border border-white/10 text-xs font-mono text-softwhite flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Occupied by scholar (Active study session in progress)
              </span>
            </div>
          )}

          {(hoveredSeat || selectedSeat)?.status === 'available' && (
            <button
              onClick={() => onSelectSeat && onSelectSeat(hoveredSeat || selectedSeat!)}
              className="w-full mt-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan text-midnight hover:bg-ice transition-all flex items-center justify-center gap-1.5"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              RESERVE THIS STUDY SEAT
            </button>
          )}
        </div>
      )}
    </div>
  );
};

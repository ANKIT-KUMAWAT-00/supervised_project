import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Seat } from '../../types';
import { HumanCharacter3D } from './HumanCharacter3D';

interface ErgonomicChair3DProps {
  seat: Seat;
  isSelected: boolean;
  isHovered: boolean;
  heatmapMode: boolean;
  onHover: (seat: Seat | null) => void;
  onClick: (seat: Seat) => void;
}

export const ErgonomicChair3D: React.FC<ErgonomicChair3DProps> = ({
  seat,
  isSelected,
  isHovered,
  heatmapMode,
  onHover,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle floating selection pulse
  useFrame((state) => {
    if (groupRef.current && isSelected) {
      groupRef.current.position.y = seat.y_pos + Math.sin(state.clock.getElapsedTime() * 4) * 0.04;
    } else if (groupRef.current) {
      groupRef.current.position.y = seat.y_pos;
    }
  });

  const isOccupied = seat.status === 'occupied';

  // Subtle status glow colors
  const statusColor = heatmapMode
    ? isOccupied
      ? '#EF4444'
      : '#10B981'
    : seat.status === 'available'
    ? '#10B981'
    : seat.status === 'reserved'
    ? '#00E5FF'
    : seat.status === 'maintenance'
    ? '#F59E0B'
    : '#EF4444';

  return (
    <group
      ref={groupRef}
      position={[seat.x_pos, seat.y_pos, seat.z_pos]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(seat);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(seat);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* ================= 1. ERGONOMIC CHAIR ASSEMBLY ================= */}
      {/* Five-Star Caster Base */}
      <group position={[0, 0.05, 0]}>
        {/* Central hub */}
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* 5 Spoke Legs with Casters */}
        {[0, 72, 144, 216, 288].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const legLen = 0.28;
          const lx = Math.sin(rad) * legLen;
          const lz = Math.cos(rad) * legLen;
          return (
            <group key={idx}>
              <mesh position={[lx / 2, 0, lz / 2]} rotation={[0, -rad, 0]} castShadow>
                <boxGeometry args={[0.04, 0.03, legLen]} />
                <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Wheel Caster */}
              <mesh position={[lx, -0.02, lz]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#0F172A" roughness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Chrome Pneumatic Gas Lift Cylinder */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.035, 0.32, 16]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Under-Seat Mechanism Housing */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.22, 0.06, 0.22]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Contoured Padded Seat Cushion */}
      <mesh position={[0, 0.43, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.08, 0.48]} />
        <meshStandardMaterial
          color={isSelected || isHovered ? '#1E293B' : '#0F172A'}
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* Ergonomic Curved Lumbar Mesh Backrest */}
      <group position={[0, 0.72, -0.22]} rotation={[-0.12, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.44, 0.54, 0.05]} />
          <meshStandardMaterial
            color={isSelected ? '#00E5FF' : isHovered ? '#38BDF8' : '#1E293B'}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
        {/* Outer Frame Bezel */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.44, 0.54, 0.05)]} />
          <lineBasicMaterial
            color={isHovered || isSelected ? '#00E5FF' : '#475569'}
            linewidth={1.5}
          />
        </lineSegments>
      </group>

      {/* Ergonomic Adjustable Armrests */}
      {[-0.24, 0.24].map((ax, aIdx) => (
        <group key={`arm-${aIdx}`} position={[ax, 0.55, 0]}>
          {/* Armrest Vertical Upright */}
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.18, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Armrest Soft Pad */}
          <mesh position={[0, 0.03, 0.04]} castShadow>
            <boxGeometry args={[0.07, 0.025, 0.24]} />
            <meshStandardMaterial color="#0F172A" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ================= 2. REAL HUMAN STUDENT CHARACTER ================= */}
      {/* MANDATORY: If occupied, render a living, breathing seated student! */}
      {isOccupied && (
        <HumanCharacter3D
          seatId={seat.id}
          isHovered={isHovered}
        />
      )}

      {/* ================= 3. SUBTLE STATUS HOLOGRAM BEACON ================= */}
      {/* Subtle floor status ring indicator */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.42, 32]} />
        <meshBasicMaterial
          color={statusColor}
          transparent
          opacity={isSelected ? 0.95 : isHovered ? 0.75 : isOccupied ? 0.2 : 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D Seat ID Tag Plaque for Easy Navigation */}
      <group position={[0, 1.15, -0.25]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.34, 0.1]} />
          <meshBasicMaterial color="#070B18" transparent opacity={0.7} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.34, 0.1)]} />
          <lineBasicMaterial color={statusColor} transparent opacity={0.6} />
        </lineSegments>
      </group>
    </group>
  );
};

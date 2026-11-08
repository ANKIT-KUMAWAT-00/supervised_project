import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface FloorArchitectureProps {
  floorNumber: number;
  floorY: number;
  isIsolated?: boolean;
}

export const LibraryFloorArchitecture: React.FC<FloorArchitectureProps> = ({
  floorNumber,
  floorY,
}) => {
  // Building dimensions
  const width = 36;
  const depth = 26;
  const floorThickness = 0.4;
  const wallHeight = 4.2;

  // Book spine color variations for realistic shelves
  const bookColors = ['#DC2626', '#2563EB', '#059669', '#7C3AED', '#D97706', '#0284C7', '#475569', '#1E293B', '#F59E0B'];

  return (
    <group position={[0, floorY, 0]}>
      {/* ================= 1. REALISTIC FLOOR PLATE ================= */}
      {/* Parquetry Hardwood Oak / Polished Architectural Stone Floor */}
      <mesh position={[0, -floorThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[width, floorThickness, depth]} />
        <meshStandardMaterial
          color={floorNumber === 1 || floorNumber === 3 ? '#1E293B' : '#0F172A'}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>

      {/* Decorative inlaid architectural border bands */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width - 0.8, depth - 0.8]} />
        <meshStandardMaterial
          color={floorNumber === 0 ? '#18233C' : floorNumber === 2 ? '#131C31' : '#152037'}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Acoustic Ceiling with Recessed Warm LED Panel Arrays */}
      <mesh position={[0, wallHeight, 0]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color="#0B1120" roughness={0.7} />
      </mesh>

      {/* Suspended Linear LED Architectural Luminaires */}
      {[-10, 0, 10].map((lx) =>
        [-6, 6].map((lz) => (
          <group key={`light-${lx}-${lz}`} position={[lx, wallHeight - 0.5, lz]}>
            {/* Fixture Body */}
            <mesh>
              <boxGeometry args={[6.0, 0.08, 0.25]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Luminous Diffuser */}
            <mesh position={[0, -0.05, 0]}>
              <boxGeometry args={[5.8, 0.03, 0.22]} />
              <meshBasicMaterial color="#EAF4FF" />
            </mesh>
            {/* Soft Warm/Daylight Downlight */}
            <pointLight position={[0, -0.8, 0]} intensity={1.5} distance={10} color="#EAF4FF" />
          </group>
        ))
      )}

      {/* ================= 2. PERIMETER WALLS & GLASS FACADE ================= */}
      {/* Back Wall (Architectural Acoustic Paneling with Accent Wood Slats) */}
      <group position={[0, wallHeight / 2, -depth / 2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, wallHeight, 0.4]} />
          <meshStandardMaterial color="#0B132B" roughness={0.6} />
        </mesh>
        {/* Wall Accent Plaque */}
        <mesh position={[0, 0.4, 0.22]}>
          <boxGeometry args={[12, 0.8, 0.04]} />
          <meshStandardMaterial color="#1E293B" metalness={0.5} roughness={0.4} />
        </mesh>
        <Text
          position={[0, 0.4, 0.26]}
          fontSize={0.34}
          color="#80F0FF"
          anchorX="center"
          anchorY="middle"
        >
          {floorNumber === 0
            ? 'LEVEL 0 — NEXUS GRAND ATRIUM & COLLABORATIVE COMMONS'
            : floorNumber === 1
            ? 'LEVEL 1 — SILENT STACKS & DEEP FOCUS ARCHIVES'
            : floorNumber === 2
            ? 'LEVEL 2 — CYBERNETIC COMPUTE & ARTIFICIAL INTELLIGENCE LAB'
            : 'LEVEL 3 — SPECIAL COLLECTIONS & DISSERTATION LOFTS'}
        </Text>
      </group>

      {/* Front Glass Curtain Facade (Floor-to-Ceiling Windows with Muted Mullions) */}
      <group position={[0, wallHeight / 2, depth / 2]}>
        {/* Transparent Architectural Glass Panes */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width, wallHeight, 0.08]} />
          <meshPhysicalMaterial
            color="#00E5FF"
            transparent
            opacity={0.12}
            roughness={0.05}
            transmission={0.88}
            ior={1.52}
            thickness={0.2}
          />
        </mesh>
        {/* Window Mullions / Metallic Frames */}
        {[-14, -7, 0, 7, 14].map((mx) => (
          <mesh key={`mullion-${mx}`} position={[mx, 0, 0]}>
            <boxGeometry args={[0.15, wallHeight, 0.16]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Left Wall (Bookshelf Wall / Acoustic Baffles) */}
      <mesh position={[-width / 2, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, wallHeight, depth]} />
        <meshStandardMaterial color="#0B132B" roughness={0.6} />
      </mesh>

      {/* Right Wall (Glass & Concrete Hybrid with Emergency Exit) */}
      <group position={[width / 2, wallHeight / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, wallHeight, depth]} />
          <meshStandardMaterial color="#0B132B" roughness={0.6} />
        </mesh>
        {/* Emergency Exit Sign */}
        <group position={[-0.22, 1.2, 4]}>
          <mesh>
            <boxGeometry args={[0.04, 0.3, 0.8]} />
            <meshStandardMaterial color="#059669" emissive="#059669" emissiveIntensity={0.8} />
          </mesh>
          <Text
            position={[-0.03, 0, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            fontSize={0.12}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            EXIT →
          </Text>
        </group>
      </group>

      {/* ================= 3. ARCHITECTURAL BOOKSHELVES ================= */}
      {/* 4 Large Modular Bookshelves on the Left Perimeter */}
      {[-7, 0, 7].map((sz, sIdx) => (
        <group key={`shelf-${sIdx}`} position={[-width / 2 + 1.6, 1.4, sz]}>
          {/* Bookshelf Outer Oak/Graphite Frame */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 2.7, 5.0]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.3} />
          </mesh>

          {/* Shelf Dividers */}
          {[-0.8, -0.25, 0.3, 0.85].map((sy, lIdx) => (
            <mesh key={`shelf-div-${lIdx}`} position={[0.05, sy, 0]}>
              <boxGeometry args={[0.7, 0.05, 4.8]} />
              <meshStandardMaterial color="#334155" roughness={0.4} />
            </mesh>
          ))}

          {/* Rows of Detailed Colorful 3D Books */}
          {[-0.6, -0.05, 0.5, 1.05].map((tierY, tIdx) => (
            <group key={`tier-${tIdx}`} position={[0.05, tierY, 0]}>
              {Array.from({ length: 18 }).map((_, bIdx) => {
                const bWidth = 0.22;
                const bHeight = 0.38 + ((bIdx * 7) % 5) * 0.02;
                const bDepth = 0.08 + ((bIdx * 3) % 4) * 0.015;
                const bColor = bookColors[(sIdx * 4 + tIdx * 3 + bIdx) % bookColors.length];
                const zPos = -2.2 + bIdx * 0.25;
                return (
                  <mesh key={`book-${bIdx}`} position={[0, bHeight / 2, zPos]} castShadow>
                    <boxGeometry args={[bWidth, bHeight, bDepth]} />
                    <meshStandardMaterial
                      color={bColor}
                      roughness={0.4}
                      metalness={0.1}
                    />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
      ))}

      {/* ================= 4. STUDY DESKS & PRIVACY SCREENS ================= */}
      {/* Realistic Oak & Steel Desks under Seat Clusters */}
      {[-8, 0, 8].map((tx) =>
        [-4, 4].map((tz) => (
          <group key={`arch-table-${tx}-${tz}`} position={[tx, 0, tz]}>
            {/* Oak Hardwood Tabletop */}
            <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
              <boxGeometry args={[6.8, 0.06, 2.4]} />
              <meshStandardMaterial
                color="#78350F" // Warm rich oak
                roughness={0.35}
                metalness={0.05}
              />
            </mesh>

            {/* Central Frosted Glass Privacy / Cable Partition */}
            <mesh position={[0, 0.95, 0]}>
              <boxGeometry args={[6.4, 0.4, 0.04]} />
              <meshPhysicalMaterial
                color="#00E5FF"
                transparent
                opacity={0.35}
                roughness={0.2}
                transmission={0.6}
              />
            </mesh>

            {/* Inlaid Brushed Metal Cable Trough & AC Power Grommets */}
            <mesh position={[0, 0.751, 0]}>
              <boxGeometry args={[5.8, 0.005, 0.12]} />
              <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Brushed Stainless Steel Leg Frames */}
            {[-3.1, 3.1].map((lx) => (
              <mesh key={`leg-frame-${lx}`} position={[lx, 0.36, 0]} castShadow>
                <boxGeometry args={[0.08, 0.72, 2.2]} />
                <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))
      )}

      {/* ================= 5. ARCHITECTURAL INDOOR GREENERY ================= */}
      {/* Modern Ficus & Monstera Plants in Ceramic Planters */}
      {[
        [-15, 0, -10],
        [-15, 0, 10],
        [15, 0, -10],
        [15, 0, 10],
        [0, 0, -10],
      ].map(([px, py, pz], pIdx) => (
        <group key={`plant-${pIdx}`} position={[px, 0, pz]}>
          {/* Ceramic Cylindrical Planter Pot */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.35, 0.9, 24]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Soil Layer */}
          <mesh position={[0, 0.88, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
            <meshStandardMaterial color="#292524" roughness={0.9} />
          </mesh>
          {/* Lush Ficus / Architectural Foliage */}
          {[-0.2, 0, 0.2].map((fx, i) =>
            [-0.2, 0, 0.2].map((fz, j) => (
              <mesh
                key={`leaf-${i}-${j}`}
                position={[fx, 1.25 + ((i + j) % 2) * 0.25, fz]}
                rotation={[0.2 * i, 0.5 * (i + j), 0.2 * j]}
                castShadow
              >
                <sphereGeometry args={[0.26, 10, 10]} />
                <meshStandardMaterial color="#059669" roughness={0.6} />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* ================= 6. CENTRAL ATRIUM OPENING & GLASS BALUSTRADE ================= */}
      {/* Level 0 Reception Desk */}
      {floorNumber === 0 && (
        <group position={[0, 0, 9.5]}>
          {/* Curved Reception Island */}
          <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[3.2, 3.2, 1.1, 32, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Reception Counter Top */}
          <mesh position={[0, 1.12, 0]}>
            <cylinderGeometry args={[3.3, 3.3, 0.06, 32, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.2} />
          </mesh>
          {/* Check-in Terminal Display */}
          <mesh position={[0, 1.35, -0.6]}>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshBasicMaterial color="#EAF4FF" />
          </mesh>
          <Text
            position={[0, 1.8, -0.6]}
            fontSize={0.22}
            color="#00E5FF"
            anchorX="center"
          >
            LIBRΛ AUTONOMOUS ACCESS & RFID GATES
          </Text>
        </group>
      )}

      {/* Central Modern Staircase Connecting to Upper Floors */}
      <group position={[12, 0, 0]}>
        {/* Staircase Steps */}
        {Array.from({ length: 12 }).map((_, stepIdx) => {
          const stepY = (stepIdx / 12) * wallHeight;
          const stepZ = -3.0 + (stepIdx / 12) * 6.0;
          return (
            <mesh key={`step-${stepIdx}`} position={[0, stepY, stepZ]} castShadow>
              <boxGeometry args={[2.0, 0.15, 0.55]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
            </mesh>
          );
        })}
        {/* Glass Railing */}
        <mesh position={[-1.02, wallHeight / 2, 0]}>
          <boxGeometry args={[0.04, 1.0, 6.5]} />
          <meshPhysicalMaterial
            color="#00E5FF"
            transparent
            opacity={0.25}
            roughness={0.1}
            transmission={0.8}
          />
        </mesh>
      </group>
    </group>
  );
};

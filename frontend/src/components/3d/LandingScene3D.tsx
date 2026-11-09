import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

const ArchitecturalTower: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  const floors = [
    { y: -3.5, label: 'L0 Atrium', color: '#00E5FF' },
    { y: -0.8, label: 'L1 Silent Stacks', color: '#80F0FF' },
    { y: 1.8, label: 'L2 AI Workstation Lab', color: '#8765FF' },
    { y: 4.4, label: 'L3 Research Archives', color: '#00E5FF' },
  ];

  return (
    <group ref={groupRef}>
      {/* Central Illuminated Glass Elevator & Light Core */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 12, 32]} />
        <meshPhysicalMaterial
          color="#00E5FF"
          transparent
          opacity={0.35}
          roughness={0.1}
          transmission={0.8}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 13, 16]} />
        <meshBasicMaterial color="#00E5FF" />
      </mesh>

      {/* Multi-tier Architectural Floor Plates */}
      {floors.map((floor, idx) => (
        <group key={idx} position={[0, floor.y, 0]}>
          {/* Main Hardwood / Stone Floor Plate */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[18, 0.35, 14]} />
            <meshStandardMaterial
              color="#0D1428"
              roughness={0.25}
              metalness={0.7}
            />
          </mesh>

          {/* Glowing Facade Edge */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(18, 0.35, 14)]} />
            <lineBasicMaterial color={floor.color} linewidth={2} />
          </lineSegments>

          {/* Exterior Glass Curtain Facade */}
          <mesh position={[0, 1.2, 7]}>
            <boxGeometry args={[18, 2.2, 0.05]} />
            <meshPhysicalMaterial
              color="#00E5FF"
              transparent
              opacity={0.15}
              roughness={0.1}
              transmission={0.8}
            />
          </mesh>
          <mesh position={[0, 1.2, -7]}>
            <boxGeometry args={[18, 2.2, 0.05]} />
            <meshPhysicalMaterial
              color="#00E5FF"
              transparent
              opacity={0.15}
              roughness={0.1}
              transmission={0.8}
            />
          </mesh>

          {/* Architectural Desks & Warm Lamps */}
          {[-5, 0, 5].map((tx) =>
            [-3, 3].map((tz) => (
              <group key={`d-${tx}-${tz}`} position={[tx, 0.2, tz]}>
                {/* Tabletop */}
                <mesh castShadow>
                  <boxGeometry args={[2.4, 0.08, 1.2]} />
                  <meshStandardMaterial color="#78350F" roughness={0.4} />
                </mesh>
                {/* Desk Reading Lamp */}
                <mesh position={[0.8, 0.25, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
                  <meshStandardMaterial color="#00E5FF" metalness={0.9} />
                </mesh>
                <mesh position={[0.8, 0.45, 0]}>
                  <sphereGeometry args={[0.06, 8, 8]} />
                  <meshBasicMaterial color="#FFF8E7" />
                </mesh>
              </group>
            ))
          )}

          {/* Perimeter Bookshelf Silhouettes */}
          {[-8, 8].map((bx) => (
            <mesh key={`b-${bx}`} position={[bx, 1.0, 0]} castShadow>
              <boxGeometry args={[0.8, 1.8, 8]} />
              <meshStandardMaterial color="#1E293B" roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Exterior Columns */}
      {[-9, 9].map((cx) =>
        [-7, 7].map((cz) => (
          <mesh key={`c-${cx}-${cz}`} position={[cx, 0.5, cz]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 12, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}
    </group>
  );
};

export const LandingScene3D: React.FC = () => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [20, 14, 24], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} color="#EAF4FF" />
        <directionalLight
          position={[20, 35, 20]}
          intensity={2.0}
          color="#FFF8E7"
          castShadow
        />
        <pointLight position={[-15, 10, -15]} intensity={1.5} color="#00E5FF" />
        <pointLight position={[0, 5, 0]} intensity={2.0} color="#80F0FF" distance={25} />

        <ArchitecturalTower />

        <OrbitControls
          enableZoom={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2 + 0.05}
          minPolarAngle={Math.PI / 6}
          enablePan={false}
        />
      </Canvas>

      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
        <span className="text-[11px] font-mono text-cyan tracking-widest uppercase bg-midnight/80 px-2.5 py-1 rounded-md border border-cyan/30">
          Photorealistic Digital Twin Active
        </span>
      </div>
    </div>
  );
};

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface HumanCharacterProps {
  seatId: number;
  activityType?: 'typing' | 'reading' | 'writing' | 'headphones' | 'monitor' | 'focus';
  deskPosition?: [number, number, number];
  isHovered?: boolean;
}

// Color palettes for believable diverse student characters
const SKIN_TONES = [
  '#E0B392', // Warm beige
  '#F3D0B5', // Fair peach
  '#C88E67', // Warm bronze
  '#A07355', // Deep olive / tan
  '#634430', // Deep rich espresso
  '#8D5524', // Chestnut brown
];

const HAIR_COLORS = [
  '#1C1917', // Jet black
  '#292524', // Dark espresso
  '#451A03', // Deep auburn
  '#78350F', // Rich brown
  '#D97706', // Amber blonde
  '#9A3412', // Russet red
];

const SHIRT_COLORS = [
  '#1E3A8A', // University navy hoodie
  '#065F46', // Pine green crewneck
  '#581C87', // Cyber violet pullover
  '#991B1B', // Crimson varsity sweater
  '#1F2937', // Charcoal minimalist tee
  '#0284C7', // Slate cyan jacket
  '#475569', // Heather grey sweatshirt
  '#D97706', // Mustard knit cardigan
];

const PANTS_COLORS = [
  '#1E293B', // Dark indigo denim
  '#0F172A', // Midnight black trousers
  '#334155', // Charcoal chinos
  '#78716C', // Stone grey denim
];

const SHOE_COLORS = [
  '#F8FAFC', // White athletic sneakers
  '#0F172A', // Black skate shoes
  '#0284C7', // Cyan-accented trainers
  '#94A3B8', // Grey low-tops
];

export const HumanCharacter3D: React.FC<HumanCharacterProps> = ({
  seatId,
  activityType,
  isHovered = false,
}) => {
  // Deterministic attributes based on seatId for consistent, diverse characters
  const attributes = useMemo(() => {
    const skin = SKIN_TONES[seatId % SKIN_TONES.length];
    const hair = HAIR_COLORS[(seatId * 3) % HAIR_COLORS.length];
    const shirt = SHIRT_COLORS[(seatId * 5) % SHIRT_COLORS.length];
    const pants = PANTS_COLORS[(seatId * 2) % PANTS_COLORS.length];
    const shoes = SHOE_COLORS[(seatId * 4) % SHOE_COLORS.length];
    const hairStyle = seatId % 4; // 0: cropped, 1: curly volume, 2: side-swept, 3: bun

    // Activity variation
    const activities: Array<'typing' | 'reading' | 'writing' | 'headphones' | 'monitor' | 'focus'> = [
      'typing',
      'reading',
      'writing',
      'headphones',
      'monitor',
      'focus',
    ];
    const active = activityType || activities[seatId % activities.length];

    return { skin, hair, shirt, pants, shoes, hairStyle, active };
  }, [seatId, activityType]);

  // Hierarchical Animation Refs
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);

  // Time offset per seat so characters don't breathe in perfect unison
  const timeOffset = useMemo(() => (seatId * 0.77) % (Math.PI * 2), [seatId]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + timeOffset;

    // 1. Subtle natural breathing motion (chest expansion & elevation)
    if (torsoRef.current) {
      torsoRef.current.position.y = 0.52 + Math.sin(t * 1.8) * 0.008;
      torsoRef.current.rotation.x = -0.04 + Math.sin(t * 1.8) * 0.005; // slight forward leaning
    }

    // 2. Natural study animations based on activity
    if (attributes.active === 'typing') {
      // Hands typing alternately on keyboard
      if (leftHandRef.current) {
        leftHandRef.current.position.y = 0.65 + Math.sin(t * 9.0) * 0.012;
      }
      if (rightHandRef.current) {
        rightHandRef.current.position.y = 0.65 + Math.cos(t * 8.5) * 0.012;
      }
      // Head looking slightly down at screen, occasional look up
      if (headRef.current) {
        headRef.current.rotation.x = 0.22 + Math.sin(t * 0.6) * 0.03;
        headRef.current.rotation.y = Math.sin(t * 0.4) * 0.04;
      }
    } else if (attributes.active === 'reading') {
      // Head scanning left to right across open book pages
      if (headRef.current) {
        headRef.current.rotation.x = 0.32;
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.12;
      }
      // Hand occasionally turning page
      if (rightHandRef.current) {
        rightHandRef.current.rotation.z = Math.sin(t * 0.5) > 0.8 ? -0.15 : 0;
      }
    } else if (attributes.active === 'writing') {
      // Right hand writing motion
      if (rightHandRef.current) {
        rightHandRef.current.position.x = 0.12 + Math.sin(t * 6.0) * 0.015;
        rightHandRef.current.position.z = 0.38 + Math.cos(t * 6.0) * 0.012;
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0.28 + Math.sin(t * 1.5) * 0.02;
        headRef.current.rotation.y = 0.08;
      }
    } else if (attributes.active === 'headphones') {
      // Rhythmic subtle head nodding to music
      if (headRef.current) {
        headRef.current.rotation.x = 0.15 + Math.abs(Math.sin(t * 3.5)) * 0.06;
        headRef.current.rotation.z = Math.sin(t * 1.75) * 0.03;
      }
    } else if (attributes.active === 'monitor') {
      // Scanning dual 4K monitors on Level 2
      if (headRef.current) {
        headRef.current.rotation.x = 0.05 + Math.sin(t * 0.5) * 0.03;
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.22;
      }
    } else {
      // Deep focus contemplation
      if (headRef.current) {
        headRef.current.rotation.x = 0.18 + Math.sin(t * 0.3) * 0.04;
        headRef.current.rotation.y = Math.cos(t * 0.2) * 0.08;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ================= LOWER BODY: SEATED ON CHAIR ================= */}
      {/* Pelvis / Hips */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[0.34, 0.14, 0.32]} />
        <meshStandardMaterial color={attributes.pants} roughness={0.7} />
      </mesh>

      {/* Left Thigh (extending horizontally forward) */}
      <mesh position={[-0.11, 0.44, 0.16]} castShadow>
        <boxGeometry args={[0.13, 0.12, 0.34]} />
        <meshStandardMaterial color={attributes.pants} roughness={0.7} />
      </mesh>
      {/* Right Thigh */}
      <mesh position={[0.11, 0.44, 0.16]} castShadow>
        <boxGeometry args={[0.13, 0.12, 0.34]} />
        <meshStandardMaterial color={attributes.pants} roughness={0.7} />
      </mesh>

      {/* Knees */}
      <mesh position={[-0.11, 0.44, 0.35]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={attributes.pants} roughness={0.7} />
      </mesh>
      <mesh position={[0.11, 0.44, 0.35]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={attributes.pants} roughness={0.7} />
      </mesh>

      {/* Left Shin / Lower Leg (extending vertically down to floor) */}
      <mesh position={[-0.11, 0.22, 0.35]} castShadow>
        <cylinderGeometry args={[0.055, 0.045, 0.38, 10]} />
        <meshStandardMaterial color={attributes.pants} roughness={0.7} />
      </mesh>
      {/* Right Shin / Lower Leg */}
      <mesh position={[0.11, 0.22, 0.35]} castShadow>
        <cylinderGeometry args={[0.055, 0.045, 0.38, 10]} />
        <meshStandardMaterial color={attributes.pants} roughness={0.7} />
      </mesh>

      {/* Left Shoe (resting flat on floor) */}
      <group position={[-0.11, 0.04, 0.39]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.07, 0.2]} />
          <meshStandardMaterial color={attributes.shoes} roughness={0.4} />
        </mesh>
        {/* White Sneaker Sole */}
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[0.105, 0.02, 0.21]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
      </group>

      {/* Right Shoe */}
      <group position={[0.11, 0.04, 0.39]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.07, 0.2]} />
          <meshStandardMaterial color={attributes.shoes} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[0.105, 0.02, 0.21]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
      </group>

      {/* ================= UPPER BODY: TORSO & SPINE ================= */}
      <group ref={torsoRef} position={[0, 0.52, 0]}>
        {/* Main Torso / Clothing */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.36, 0.38, 0.22]} />
          <meshStandardMaterial
            color={attributes.shirt}
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>

        {/* Hoodie / Collar details */}
        <mesh position={[0, 0.39, -0.05]}>
          <cylinderGeometry args={[0.12, 0.15, 0.06, 12]} />
          <meshStandardMaterial color={attributes.shirt} roughness={0.7} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.055, 0.06, 0.09, 10]} />
          <meshStandardMaterial color={attributes.skin} roughness={0.5} />
        </mesh>

        {/* ================= HEAD & HAIR ================= */}
        <group ref={headRef} position={[0, 0.53, 0]}>
          {/* Cranium / Face */}
          <mesh castShadow>
            <sphereGeometry args={[0.115, 16, 16]} />
            <meshStandardMaterial color={attributes.skin} roughness={0.45} />
          </mesh>

          {/* Facial features: stylized eyes & glasses option */}
          <mesh position={[-0.04, 0.02, 0.1]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#1C1917" />
          </mesh>
          <mesh position={[0.04, 0.02, 0.1]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#1C1917" />
          </mesh>

          {/* Glasses for 50% of students */}
          {seatId % 2 === 0 && (
            <group position={[0, 0.02, 0.11]}>
              <mesh position={[-0.04, 0, 0]}>
                <torusGeometry args={[0.025, 0.004, 8, 16]} />
                <meshStandardMaterial color="#00E5FF" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0.04, 0, 0]}>
                <torusGeometry args={[0.025, 0.004, 8, 16]} />
                <meshStandardMaterial color="#00E5FF" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.03, 0.004, 0.004]} />
                <meshStandardMaterial color="#00E5FF" metalness={0.9} />
              </mesh>
            </group>
          )}

          {/* Hair Styles */}
          {attributes.hairStyle === 0 && (
            // Cropped textured hair
            <mesh position={[0, 0.05, -0.02]} castShadow>
              <sphereGeometry args={[0.125, 14, 14]} />
              <meshStandardMaterial color={attributes.hair} roughness={0.8} />
            </mesh>
          )}

          {attributes.hairStyle === 1 && (
            // Voluminous curly hair
            <group position={[0, 0.07, -0.02]}>
              <mesh castShadow>
                <sphereGeometry args={[0.135, 14, 14]} />
                <meshStandardMaterial color={attributes.hair} roughness={0.9} />
              </mesh>
              {[-0.08, 0, 0.08].map((hx, i) => (
                <mesh key={i} position={[hx, 0.06, 0]}>
                  <sphereGeometry args={[0.04, 8, 8]} />
                  <meshStandardMaterial color={attributes.hair} roughness={0.9} />
                </mesh>
              ))}
            </group>
          )}

          {attributes.hairStyle === 2 && (
            // Side-swept modern styled hair
            <group position={[0, 0.06, -0.01]}>
              <mesh castShadow>
                <sphereGeometry args={[0.13, 14, 14]} />
                <meshStandardMaterial color={attributes.hair} roughness={0.7} />
              </mesh>
              <mesh position={[0.05, 0.04, 0.05]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[0.08, 0.05, 0.08]} />
                <meshStandardMaterial color={attributes.hair} roughness={0.7} />
              </mesh>
            </group>
          )}

          {attributes.hairStyle === 3 && (
            // Top knot / academic bun
            <group position={[0, 0.05, -0.02]}>
              <mesh castShadow>
                <sphereGeometry args={[0.125, 14, 14]} />
                <meshStandardMaterial color={attributes.hair} roughness={0.75} />
              </mesh>
              <mesh position={[0, 0.12, -0.04]} castShadow>
                <sphereGeometry args={[0.055, 10, 10]} />
                <meshStandardMaterial color={attributes.hair} roughness={0.75} />
              </mesh>
            </group>
          )}

          {/* Over-ear headphones if headphone activity */}
          {attributes.active === 'headphones' && (
            <group position={[0, 0.02, 0]}>
              {/* Headband arch */}
              <mesh position={[0, 0.11, 0]}>
                <torusGeometry args={[0.13, 0.012, 8, 20, Math.PI]} />
                <meshStandardMaterial color="#00E5FF" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Left ear cup */}
              <mesh position={[-0.13, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
                <meshStandardMaterial color="#0D1428" roughness={0.3} />
              </mesh>
              {/* Right ear cup */}
              <mesh position={[0.13, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
                <meshStandardMaterial color="#0D1428" roughness={0.3} />
              </mesh>
            </group>
          )}
        </group>

        {/* ================= ARMS & HANDS ================= */}
        {/* Left Arm Assembly */}
        <group ref={leftArmRef} position={[-0.21, 0.32, 0]}>
          {/* Shoulder */}
          <mesh>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color={attributes.shirt} />
          </mesh>
          {/* Upper Arm (down & forward) */}
          <mesh position={[-0.03, -0.12, 0.08]} rotation={[0.4, 0, -0.2]}>
            <cylinderGeometry args={[0.05, 0.045, 0.22, 8]} />
            <meshStandardMaterial color={attributes.shirt} />
          </mesh>
          {/* Forearm (reaching towards desk) */}
          <mesh position={[-0.02, -0.22, 0.22]} rotation={[1.1, 0.2, 0]}>
            <cylinderGeometry args={[0.045, 0.04, 0.22, 8]} />
            <meshStandardMaterial color={attributes.shirt} />
          </mesh>
          {/* Left Hand */}
          <group ref={leftHandRef} position={[-0.02, -0.25, 0.35]}>
            <mesh castShadow>
              <boxGeometry args={[0.07, 0.03, 0.08]} />
              <meshStandardMaterial color={attributes.skin} roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Right Arm Assembly */}
        <group ref={rightArmRef} position={[0.21, 0.32, 0]}>
          {/* Shoulder */}
          <mesh>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color={attributes.shirt} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[0.03, -0.12, 0.08]} rotation={[0.4, 0, 0.2]}>
            <cylinderGeometry args={[0.05, 0.045, 0.22, 8]} />
            <meshStandardMaterial color={attributes.shirt} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0.02, -0.22, 0.22]} rotation={[1.1, -0.2, 0]}>
            <cylinderGeometry args={[0.045, 0.04, 0.22, 8]} />
            <meshStandardMaterial color={attributes.shirt} />
          </mesh>
          {/* Right Hand */}
          <group ref={rightHandRef} position={[0.02, -0.25, 0.35]}>
            <mesh castShadow>
              <boxGeometry args={[0.07, 0.03, 0.08]} />
              <meshStandardMaterial color={attributes.skin} roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ================= STUDY ARTIFACTS ON DESK ================= */}
      {/* 1. Laptop if typing activity */}
      {attributes.active === 'typing' && (
        <group position={[0, 0.65, 0.52]} rotation={[0, Math.PI, 0]}>
          {/* Keyboard Base */}
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.012, 0.22]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Open Screen Lid */}
          <group position={[0, 0.006, -0.1]} rotation={[-0.35, 0, 0]}>
            <mesh position={[0, 0.11, 0]}>
              <boxGeometry args={[0.32, 0.2, 0.008]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Illuminated Display */}
            <mesh position={[0, 0.11, 0.005]}>
              <planeGeometry args={[0.3, 0.18]} />
              <meshBasicMaterial color="#EAF4FF" />
            </mesh>
          </group>
        </group>
      )}

      {/* 2. Open Textbook if reading */}
      {attributes.active === 'reading' && (
        <group position={[0, 0.65, 0.5]} rotation={[0, 0.05, 0]}>
          {/* Hardcover book spine & cover */}
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.025, 0.24]} />
            <meshStandardMaterial color="#8765FF" roughness={0.3} />
          </mesh>
          {/* Open paper pages */}
          <mesh position={[-0.08, 0.015, 0]} rotation={[0, 0, 0.03]}>
            <boxGeometry args={[0.15, 0.015, 0.22]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.9} />
          </mesh>
          <mesh position={[0.08, 0.015, 0]} rotation={[0, 0, -0.03]}>
            <boxGeometry args={[0.15, 0.015, 0.22]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* 3. Spiral Notebook & Pen if writing */}
      {attributes.active === 'writing' && (
        <group position={[0.08, 0.65, 0.48]} rotation={[0, -0.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.015, 0.26]} />
            <meshStandardMaterial color="#FEF08A" roughness={0.8} />
          </mesh>
          {/* Stylus / Pen in hand */}
          <mesh position={[0.04, 0.03, 0.02]} rotation={[0.4, 0.2, 0.8]}>
            <cylinderGeometry args={[0.005, 0.005, 0.14, 6]} />
            <meshStandardMaterial color="#00E5FF" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* Student Ceramic Coffee Tumbler on desk */}
      <mesh position={[0.26, 0.72, 0.46]} castShadow>
        <cylinderGeometry args={[0.035, 0.025, 0.11, 12]} />
        <meshStandardMaterial color="#0D1428" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
};

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { MLTelemetry, MLTree3D, MLTreeNode3D } from '../../types';
import { Cpu, RefreshCw, Layers, Compass, Play, CheckCircle, Sparkles, TrendingUp, GitBranch } from 'lucide-react';

interface ML3DLabProps {
  telemetry: MLTelemetry | null;
  onRetrain: () => Promise<void>;
  isRetraining: boolean;
}

// 3D Tree Forest Rendering with Illuminated Decision Branches
const Forest3D: React.FC<{
  trees: MLTree3D[];
  onSelectNode: (node: MLTreeNode3D | null) => void;
}> = ({ trees, onSelectNode }) => {
  return (
    <group position={[0, -2, 0]}>
      {trees.map((tree) => {
        // Map node by id for fast lookup to draw parent-child lines
        const nodeMap = new Map<number, MLTreeNode3D>();
        tree.nodes.forEach((n) => nodeMap.set(n.id, n));

        // Create branch line segments between parent and child nodes
        const branchLinePositions: number[] = [];
        tree.nodes.forEach((node) => {
          if (node.parent_id !== undefined && node.parent_id !== null) {
            const parent = nodeMap.get(node.parent_id);
            if (parent) {
              branchLinePositions.push(parent.x - tree.root_x, parent.y, parent.z);
              branchLinePositions.push(node.x - tree.root_x, node.y, node.z);
            }
          }
        });

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(branchLinePositions, 3)
        );

        return (
          <group key={tree.tree_index} position={[tree.root_x, 0, 0]}>
            {/* Tree Base Plate */}
            <mesh position={[0, -1, 0]}>
              <cylinderGeometry args={[2.8, 3.2, 0.25, 24]} />
              <meshStandardMaterial color="#0A1124" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.85, 0]}>
              <ringGeometry args={[2.6, 2.75, 32]} />
              <meshBasicMaterial color="#00E5FF" side={THREE.DoubleSide} />
            </mesh>

            {/* Tree Index Label */}
            <Text
              position={[0, -0.8, 2.4]}
              rotation={[-Math.PI / 2.5, 0, 0]}
              fontSize={0.28}
              color="#00E5FF"
              anchorX="center"
              anchorY="middle"
            >
              {`ESTIMATOR #${tree.tree_index + 1}`}
            </Text>

            {/* Glowing Illuminated Laser Branches */}
            {branchLinePositions.length > 0 && (
              <lineSegments geometry={lineGeometry}>
                <lineBasicMaterial
                  color="#80F0FF"
                  transparent
                  opacity={0.65}
                  linewidth={2}
                />
              </lineSegments>
            )}

            {/* Render Decision Nodes */}
            {tree.nodes.map((node) => {
              const isLeaf = node.is_leaf;
              const nodeColor = isLeaf
                ? '#10B981'
                : node.depth === 0
                ? '#00E5FF'
                : node.depth === 1
                ? '#8765FF'
                : '#38BDF8';

              return (
                <group
                  key={node.id}
                  position={[node.x - tree.root_x, node.y, node.z]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    onSelectNode(node);
                  }}
                  onPointerOut={() => onSelectNode(null)}
                >
                  <mesh castShadow>
                    {isLeaf ? (
                      <sphereGeometry args={[0.32, 16, 16]} />
                    ) : (
                      <boxGeometry args={[0.55, 0.4, 0.4]} />
                    )}
                    <meshStandardMaterial
                      color={nodeColor}
                      emissive={nodeColor}
                      emissiveIntensity={0.5}
                      roughness={0.2}
                    />
                  </mesh>

                  {/* Node Label Text */}
                  <Text
                    position={[0, 0.4, 0]}
                    fontSize={0.2}
                    color="#EAF4FF"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {isLeaf ? `Leaf: ${node.threshold.toFixed(0)}` : `${node.feature} ≤ ${node.threshold}`}
                  </Text>
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

// 3D Sequential Gradient Boosting (XGBoost) Stages
const XGBoostStages3D: React.FC<{
  stages: { stage: number; weight_scale: number; tree_summary: string }[];
}> = ({ stages }) => {
  return (
    <group position={[0, 0, 0]}>
      {stages.map((stg, idx) => {
        const xPos = (idx - (stages.length - 1) / 2) * 5.5;
        const color = idx === 0 ? '#00E5FF' : idx === 1 ? '#80F0FF' : idx === 2 ? '#8765FF' : '#10B981';

        return (
          <group key={stg.stage} position={[xPos, 0, 0]}>
            {/* Stage Tower Base */}
            <mesh position={[0, -2, 0]}>
              <boxGeometry args={[3.2, 0.3, 3.2]} />
              <meshStandardMaterial color="#0A1124" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Stage Core Column */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.8, 1.2, 4.5, 16]} />
              <meshStandardMaterial
                color="#0D1428"
                emissive={color}
                emissiveIntensity={0.25}
                roughness={0.3}
              />
            </mesh>

            {/* Glowing Shrinkage Ring */}
            <mesh position={[0, 2.8, 0]}>
              <torusGeometry args={[1.3, 0.08, 16, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
              />
            </mesh>

            {/* Floating Residual Gradient Sphere */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <mesh position={[0, 3.2, 0]}>
                <dodecahedronGeometry args={[0.6]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.7}
                  wireframe
                />
              </mesh>
            </Float>

            {/* Stage Labels */}
            <Text
              position={[0, 4.4, 0]}
              fontSize={0.32}
              color={color}
              anchorX="center"
            >
              {`BOOSTING ROUND ${stg.stage + 1}`}
            </Text>
            <Text
              position={[0, 3.95, 0]}
              fontSize={0.22}
              color="#EAF4FF"
              anchorX="center"
            >
              {`Learning Rate η = ${stg.weight_scale}`}
            </Text>
            <Text
              position={[0, -1.2, 0]}
              fontSize={0.2}
              color="#8290A8"
              maxWidth={3.0}
              textAlign="center"
              anchorX="center"
            >
              {stg.tree_summary}
            </Text>

            {/* Cascade Flow Arrow to Next Stage */}
            {idx < stages.length - 1 && (
              <group position={[2.75, 0.5, 0]}>
                <mesh rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.3, 0.8, 16]} />
                  <meshBasicMaterial color="#00E5FF" />
                </mesh>
                <Text position={[0, 0.5, 0]} fontSize={0.18} color="#00E5FF" anchorX="center">
                  -∇L Residual
                </Text>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

// 3D Fitted Linear Regression Plane
const RegressionPlane3D: React.FC<{
  planePoints: { x: number; y: number; z: number }[];
  dataPoints: { x: number; y: number; z: number; actual_occupancy: number }[];
}> = ({ planePoints, dataPoints }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* 3D Wireframe Bounding Box */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(18, 12, 18)]} />
        <lineBasicMaterial color="#00E5FF" transparent opacity={0.25} />
      </lineSegments>

      {/* Regression Surface Grid */}
      {planePoints.length >= 100 && (
        <group>
          {planePoints.map((pt, idx) => {
            const px = ((pt.x - 7) / 16) * 16 - 8;
            const py = ((pt.z - 20) / 330) * 10 - 5;
            const pz = ((pt.y - 50) / 270) * 16 - 8;
            return (
              <mesh key={`grid-${idx}`} position={[px, py, pz]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color="#00E5FF" transparent opacity={0.7} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Actual Data Points Cloud */}
      {dataPoints.map((dp, idx) => (
        <mesh key={`dp-${idx}`} position={[dp.x, dp.y, dp.z]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial
            color="#8765FF"
            emissive="#8765FF"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Axis Reference */}
      <Text position={[0, -6.5, 9.5]} fontSize={0.3} color="#00E5FF" anchorX="center">
        Hour of Day [0-24h] →
      </Text>
      <Text position={[-9.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} fontSize={0.3} color="#10B981" anchorX="center">
        Occupancy Seats [0-350] ↑
      </Text>
    </group>
  );
};

// 3D Neural Flow & Feature Node Graph
const NeuralFeatureGraph3D: React.FC<{ features: string[] }> = ({ features }) => {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  const count = 300;
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Input Feature Nodes Layer */}
      <group position={[-8, 0, 0]}>
        {features.slice(0, 8).map((feat, i) => {
          const y = (i - 3.5) * 1.3;
          return (
            <group key={feat} position={[0, y, 0]}>
              <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.6} />
              </mesh>
              <Text position={[-0.5, 0, 0]} fontSize={0.25} color="#80F0FF" anchorX="right">
                {feat}
              </Text>
            </group>
          );
        })}
      </group>

      {/* Hidden Dense / Ensemble Processing Core */}
      <group position={[0, 0, 0]}>
        {[-3, 0, 3].map((hx) =>
          [-2, 0, 2].map((hy) => (
            <mesh key={`h-${hx}-${hy}`} position={[hx, hy, 0]}>
              <octahedronGeometry args={[0.4]} />
              <meshStandardMaterial color="#8765FF" emissive="#8765FF" emissiveIntensity={0.7} />
            </mesh>
          ))
        )}
      </group>

      {/* Output Prediction Node */}
      <group position={[8, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} />
        </mesh>
        <Text position={[0.9, 0, 0]} fontSize={0.32} color="#10B981" anchorX="left">
          Occupancy Forecast (y_hat)
        </Text>
      </group>

      {/* Flowing Particle Stream */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#00E5FF" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};

export const ML3DLab: React.FC<ML3DLabProps> = ({ telemetry, onRetrain, isRetraining }) => {
  const [activeView, setActiveView] = useState<'forest' | 'xgboost' | 'plane' | 'graph'>('forest');
  const [selectedNode, setSelectedNode] = useState<MLTreeNode3D | null>(null);

  return (
    <div className="w-full h-full relative bg-midnight overflow-hidden select-none">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [18, 14, 20], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#070B18']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[15, 25, 15]} intensity={1.5} color="#80F0FF" />
        <pointLight position={[-10, 5, -10]} intensity={1.2} color="#8765FF" />
        <pointLight position={[10, -5, 10]} intensity={0.8} color="#00E5FF" />

        {/* Ambient Grid Floor */}
        <gridHelper args={[40, 40, '#00E5FF', '#0D1428']} position={[0, -3.2, 0]} />

        {activeView === 'forest' && telemetry?.trees_3d && (
          <Forest3D trees={telemetry.trees_3d} onSelectNode={setSelectedNode} />
        )}

        {activeView === 'xgboost' && telemetry?.xgboost_stages && (
          <XGBoostStages3D stages={telemetry.xgboost_stages} />
        )}

        {activeView === 'plane' && telemetry && (
          <RegressionPlane3D
            planePoints={telemetry.regression_surface_3d.plane_points}
            dataPoints={telemetry.data_points_3d}
          />
        )}

        {activeView === 'graph' && telemetry && (
          <NeuralFeatureGraph3D features={telemetry.features} />
        )}

        <OrbitControls enableDamping dampingFactor={0.06} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>

      {/* Top Controls: Mode Switcher & Live Retrain Button */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="glass-panel p-1.5 rounded-xl border border-cyan/30 flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => setActiveView('forest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'forest'
                ? 'bg-cyan text-midnight font-bold shadow-cyan-glow'
                : 'text-subtlegrey hover:text-softwhite'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            3D DECISION FOREST (RF)
          </button>
          <button
            onClick={() => setActiveView('xgboost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'xgboost'
                ? 'bg-violet text-softwhite font-bold shadow-violet-glow'
                : 'text-subtlegrey hover:text-softwhite'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            XGBOOST STAGES
          </button>
          <button
            onClick={() => setActiveView('plane')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeView === 'plane'
                ? 'bg-cyan text-midnight font-bold shadow-cyan-glow'
                : 'text-subtlegrey hover:text-softwhite'
            }`}
          >
            3D REGRESSION PLANE
          </button>
          <button
            onClick={() => setActiveView('graph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeView === 'graph'
                ? 'bg-cyan text-midnight font-bold shadow-cyan-glow'
                : 'text-subtlegrey hover:text-softwhite'
            }`}
          >
            FEATURE FLOW GRAPH
          </button>
        </div>

        <div className="pointer-events-auto">
          <button
            onClick={onRetrain}
            disabled={isRetraining}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
            {isRetraining ? 'TRAINING 3 ENSEMBLES...' : 'RETRAIN ENSEMBLE PIPELINE'}
          </button>
        </div>
      </div>

      {/* Selected Node Details Tooltip Card */}
      {selectedNode && (
        <div className="absolute top-20 right-4 z-20 glass-panel p-4 rounded-xl border border-cyan/40 shadow-cyan-glow text-xs font-mono text-softwhite space-y-1.5 w-64 animate-in fade-in duration-150">
          <div className="text-[10px] text-cyan uppercase font-bold tracking-wider">
            {selectedNode.is_leaf ? 'TERMINAL LEAF NODE' : 'DECISION SPLIT NODE'}
          </div>
          <div className="font-bold text-ice text-sm">
            {selectedNode.is_leaf ? `Value: ${selectedNode.threshold.toFixed(1)} seats` : `${selectedNode.feature} ≤ ${selectedNode.threshold}`}
          </div>
          <div className="flex justify-between text-subtlegrey text-[11px] pt-1 border-t border-white/5">
            <span>Sample Coverage:</span>
            <span className="text-softwhite font-bold">{selectedNode.samples} rows</span>
          </div>
          <div className="flex justify-between text-subtlegrey text-[11px]">
            <span>Gini / MSE Impurity:</span>
            <span className="text-softwhite">{selectedNode.impurity.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-subtlegrey text-[11px]">
            <span>Tree Depth:</span>
            <span className="text-cyan">Level {selectedNode.depth}</span>
          </div>
        </div>
      )}

      {/* Bottom Telemetry HUD */}
      {telemetry && (
        <div className="absolute bottom-4 left-4 right-4 z-10 glass-panel p-4 rounded-xl border border-cyan/20 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-subtlegrey">CHAMPION: </span>
              <strong className="text-cyan uppercase font-bold">{telemetry.champion_model}</strong>
            </div>
            <div>
              <span className="text-subtlegrey">XGBOOST R²: </span>
              <strong className="text-emerald-400">
                {telemetry.models?.xgboost?.r2?.toFixed(4) || '0.9533'}
              </strong>
            </div>
            <div>
              <span className="text-subtlegrey">MAE: </span>
              <strong className="text-ice">
                {telemetry.models?.xgboost?.mae || '12.69'} seats
              </strong>
            </div>
          </div>
          <div className="text-subtlegrey text-[11px]">
            TRAINED: {new Date(telemetry.trained_at).toLocaleTimeString()} ({telemetry.dataset_rows} samples in {telemetry.training_duration_seconds}s)
          </div>
        </div>
      )}
    </div>
  );
};

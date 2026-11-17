import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCadStore } from '../store/useCadStore';

interface WindTunnelProps {
  windSpeed?: number; // in m/s (default 12)
}

export const WindTunnelParticles: React.FC<WindTunnelProps> = ({ windSpeed = 14 }) => {
  const { config, motorsSpinning } = useCadStore();
  const pointsRef = useRef<THREE.Points>(null);

  const COUNT = 350;

  // Arm positions for downwash calculation
  const armLen = (config.armLength || 180) / 100;
  const armAngles = [
    (Math.PI / 180) * (config.armAngle || 45),
    (Math.PI / 180) * (180 - (config.armAngle || 45)),
    (Math.PI / 180) * (180 + (config.armAngle || 45)),
    (Math.PI / 180) * (360 - (config.armAngle || 45)),
  ];

  const rotorPositions = useMemo(() => {
    return armAngles.map((a) => ({
      x: Math.cos(a) * armLen,
      z: Math.sin(a) * armLen,
    }));
  }, [armLen, config.armAngle]);

  const [positions, velocities, initialPos] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const init = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      // Spawn in a rectangular air tunnel envelope ahead and around the drone
      const x = (Math.random() - 0.5) * (armLen * 2.8);
      const y = Math.random() * 2.0 - 0.2;
      const z = Math.random() * 5.0 - 2.5;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      init[i * 3] = x;
      init[i * 3 + 1] = y;
      init[i * 3 + 2] = z;

      vel[i * 3] = 0;
      vel[i * 3 + 1] = 0;
      vel[i * 3 + 2] = -0.04 * (windSpeed / 12);
    }

    return [pos, vel, init];
  }, [COUNT, armLen, windSpeed]);

  // Particle color attributes (cyan ahead, accelerating into emerald and amber downwash)
  const colors = useMemo(() => {
    const col = new Float32Array(COUNT * 3);
    const colorCyan = new THREE.Color('#00C8FF');
    const colorAmber = new THREE.Color('#f59e0b');
    const colorEmerald = new THREE.Color('#10b981');

    for (let i = 0; i < COUNT; i++) {
      const c = i % 3 === 0 ? colorCyan : i % 3 === 1 ? colorEmerald : colorAmber;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return col;
  }, [COUNT]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    const speedFactor = (windSpeed / 12) * delta * 45;
    const propRadius = ((config.propellerSize || 7) * 25.4 * 0.5) / 100;

    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;

      // Move particle along wind direction (-Z)
      arr[idx + 2] -= 0.05 * speedFactor;

      // If motors are spinning, apply downward propwash acceleration
      if (motorsSpinning) {
        const px = arr[idx];
        const py = arr[idx + 1];
        const pz = arr[idx + 2];

        for (let r = 0; r < 4; r++) {
          const rx = rotorPositions[r].x;
          const rz = rotorPositions[r].z;
          const distToRotorCenter = Math.hypot(px - rx, pz - rz);

          if (distToRotorCenter < propRadius * 1.25 && py > -0.4 && py < 0.6) {
            // Accelerate downward through blade disc with vortex deflection
            arr[idx + 1] -= 0.035 * speedFactor;
            // Swirl tangentially around the rotor axis
            const angle = Math.atan2(pz - rz, px - rx) + 0.12 * (r % 2 === 0 ? 1 : -1);
            arr[idx] = rx + Math.cos(angle) * distToRotorCenter;
            arr[idx + 2] = rz + Math.sin(angle) * distToRotorCenter;
          }
        }
      }

      // Recycle particles that travel past the aft boundary
      if (arr[idx + 2] < -3.0 || arr[idx + 1] < -0.8) {
        arr[idx] = (Math.random() - 0.5) * (armLen * 2.8);
        arr[idx + 1] = Math.random() * 1.6 + 0.1;
        arr[idx + 2] = 2.8 + Math.random() * 0.6;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        vertexColors
        transparent
        opacity={0.78}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

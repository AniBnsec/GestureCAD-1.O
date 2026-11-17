import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useCadStore } from '../store/useCadStore';

export const DroneModel: React.FC = () => {
  const {
    config,
    components,
    selectedComponentId,
    hoveredComponentId,
    setSelectedComponentId,
    setHoveredComponentId,
    isExploded,
    motorsSpinning,
    showDimensions,
    wireframeMode,
    windTunnelActive,
    xrayMode,
    gestureState,
  } = useCadStore();

  const groupRef = useRef<THREE.Group>(null);
  const propRefs = useRef<(THREE.Group | null)[]>([]);
  const ledRef = useRef<THREE.PointLight>(null);
  const ledRef2 = useRef<THREE.PointLight>(null);

  // Component visibility from store
  const isFrameVisible = components.find((c) => c.type === 'frame')?.visible ?? true;
  const isMotorVisible = components.find((c) => c.type === 'motor')?.visible ?? true;
  const isPropVisible = components.find((c) => c.type === 'propeller')?.visible ?? true;
  const isBatteryVisible = components.find((c) => c.type === 'battery')?.visible ?? true;
  const isCameraVisible = components.find((c) => c.type === 'camera')?.visible ?? true;
  const isFcVisible = components.find((c) => c.type === 'flight_controller')?.visible ?? true;

  // Modular and custom component accessories in assembly
  const gpsComp = components.find(
    (c) => (c.name.toLowerCase().includes('gps') || c.id.includes('gps')) && c.visible !== false
  );
  const vtxComp = components.find(
    (c) => (c.name.toLowerCase().includes('vtx') || c.name.toLowerCase().includes('transmitter') || c.id.includes('vtx')) && c.visible !== false
  );
  const actionCamComp = components.find(
    (c) => (c.name.toLowerCase().includes('action') || c.name.toLowerCase().includes('gopro') || c.id.includes('actioncam')) && c.visible !== false
  );
  const landingSkidsComp = components.find(
    (c) => (c.name.toLowerCase().includes('landing') || c.name.toLowerCase().includes('skid') || c.id.includes('landing')) && c.visible !== false
  );
  const buzzerComp = components.find(
    (c) => (c.name.toLowerCase().includes('buzzer') || c.name.toLowerCase().includes('alarm') || c.id.includes('buzzer')) && c.visible !== false
  );
  const lidarComp = components.find(
    (c) => (c.name.toLowerCase().includes('lidar') || c.name.toLowerCase().includes('rangefinder') || c.id.includes('lidar')) && c.visible !== false
  );

  // Scale: 1 unit in 3D scene = 100 mm (0.1m)
  const armLen = (config.armLength || 180) / 100;
  const bodyW = (config.bodyWidth || 120) / 100;
  const bodyL = (config.bodyLength || 120) / 100;
  const bodyH = (config.bodyHeight || 35) / 100;
  const motorD = (config.motorSize || 30) / 100;
  const propD = ((config.propellerSize || 7) * 25.4) / 100;

  // Exploded animation factor
  const explodeFactor = isExploded ? 1.0 : 0.0;
  const currentExplode = useRef(0);

  // Procedural Materials with Aerospace Precision
  const materials = useMemo(() => {
    // 1. Procedural 3K Matte Carbon Weave Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, 256, 256);

      const tow = 16;
      for (let x = 0; x < 256; x += tow) {
        for (let y = 0; y < 256; y += tow) {
          const isTwill = Math.floor((x + y) / (tow * 2)) % 2 === 0;
          const grad = ctx.createLinearGradient(x, y, x + tow, y + tow);
          if (isTwill) {
            grad.addColorStop(0, '#162030');
            grad.addColorStop(0.4, '#28364a');
            grad.addColorStop(0.7, '#141d2a');
            grad.addColorStop(1, '#0b1018');
          } else {
            grad.addColorStop(0, '#0b1018');
            grad.addColorStop(0.4, '#182230');
            grad.addColorStop(0.7, '#0f1622');
            grad.addColorStop(1, '#060a0f');
          }
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, tow, tow);

          // Micro carbon strands
          ctx.strokeStyle = isTwill ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.45)';
          ctx.lineWidth = 1;
          for (let s = 3; s < tow; s += 4) {
            ctx.beginPath();
            ctx.moveTo(x + s, y);
            ctx.lineTo(x, y + s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + tow, y + s);
            ctx.lineTo(x + s, y + tow);
            ctx.stroke();
          }
        }
      }
    }

    const carbonTexture = new THREE.CanvasTexture(canvas);
    carbonTexture.wrapS = THREE.RepeatWrapping;
    carbonTexture.wrapT = THREE.RepeatWrapping;
    carbonTexture.repeat.set(3, 3);

    // Matte Carbon Fiber Material (with X-Ray Holographic Cutaway support)
    const carbonMat = new THREE.MeshPhysicalMaterial({
      map: carbonTexture,
      roughnessMap: carbonTexture,
      color: xrayMode ? '#1e3a5f' : '#121822',
      metalness: 0.85,
      roughness: 0.28,
      transparent: xrayMode,
      opacity: xrayMode ? 0.35 : 1.0,
      transmission: xrayMode ? 0.65 : 0.0,
      thickness: xrayMode ? 0.2 : 0,
    });

    // CNC Anodized Aluminum Standoffs (Electric Blue)
    const standoffMat = new THREE.MeshStandardMaterial({
      color: '#1677FF',
      metalness: 0.95,
      roughness: 0.15,
    });

    // Anodized Neon Cyan Motor Bell
    const bellCyanMat = new THREE.MeshStandardMaterial({
      color: '#00C8FF',
      metalness: 0.92,
      roughness: 0.16,
    });

    // Anodized Red Accent Motor Bell
    const bellRedMat = new THREE.MeshStandardMaterial({
      color: '#F04444',
      metalness: 0.92,
      roughness: 0.16,
    });

    // Polished Titanium Hardware
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: '#344557',
      metalness: 0.95,
      roughness: 0.15,
    });

    // Hex Socket Head Cap Screws (Titanium Bolt)
    const screwMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      metalness: 0.96,
      roughness: 0.12,
    });

    const screwHexMat = new THREE.MeshStandardMaterial({
      color: '#080d17',
      metalness: 0.8,
      roughness: 0.4,
    });

    // Pure Copper Stator Windings
    const copperMat = new THREE.MeshStandardMaterial({
      color: '#d66826',
      metalness: 0.9,
      roughness: 0.22,
    });

    // Stator Core Iron Laminations
    const ironMat = new THREE.MeshStandardMaterial({
      color: '#1b222c',
      metalness: 0.92,
      roughness: 0.35,
    });

    // Translucent Aerodynamic Polycarbonate Propeller Blades
    const propMatCW = new THREE.MeshPhysicalMaterial({
      color: '#00C8FF',
      metalness: 0.15,
      roughness: 0.08,
      transmission: 0.85,
      thickness: 0.2,
      transparent: true,
      opacity: 0.92,
      ior: 1.58,
    });

    const propMatCCW = new THREE.MeshPhysicalMaterial({
      color: '#1677FF',
      metalness: 0.15,
      roughness: 0.08,
      transmission: 0.85,
      thickness: 0.2,
      transparent: true,
      opacity: 0.92,
      ior: 1.58,
    });

    // 4S LiPo Battery Pack
    const lipoMat = new THREE.MeshStandardMaterial({
      color: '#0b1017',
      roughness: 0.35,
      metalness: 0.1,
    });

    // High-Resolution LiPo Battery Label Canvas Texture
    const lipoCanvas = document.createElement('canvas');
    lipoCanvas.width = 256;
    lipoCanvas.height = 128;
    const lCtx = lipoCanvas.getContext('2d');
    if (lCtx) {
      lCtx.fillStyle = '#0a0f18';
      lCtx.fillRect(0, 0, 256, 128);

      // Gold race racing stripes
      lCtx.fillStyle = '#f59e0b';
      lCtx.fillRect(0, 0, 256, 10);
      lCtx.fillRect(0, 118, 256, 10);

      // Accent pill
      lCtx.fillStyle = '#1677ff';
      lCtx.fillRect(16, 20, 96, 22);
      lCtx.fillStyle = '#ffffff';
      lCtx.font = 'bold 12px sans-serif';
      lCtx.fillText('AERO CAD', 24, 35);

      // Main capacity text
      lCtx.fillStyle = '#00c8ff';
      lCtx.font = '900 28px monospace';
      lCtx.fillText('4S 1500mAh', 16, 72);

      // Spec badge
      lCtx.fillStyle = '#e2e8f0';
      lCtx.font = 'bold 13px monospace';
      lCtx.fillText('120C BURST · 14.8V GRAPHENE', 16, 100);
    }
    const lipoLabelTexture = new THREE.CanvasTexture(lipoCanvas);

    const lipoLabelMat = new THREE.MeshStandardMaterial({
      map: lipoLabelTexture,
      roughness: 0.2,
      metalness: 0.15,
    });

    // Gold Plated Terminals
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#ffd700',
      metalness: 0.95,
      roughness: 0.15,
    });

    // Avionics PCB Board
    const pcbMat = new THREE.MeshStandardMaterial({
      color: '#032619',
      roughness: 0.25,
      metalness: 0.45,
    });

    // Selection & Hover Highlight Glow Materials
    const selectMat = new THREE.MeshStandardMaterial({
      color: '#39D5FF',
      emissive: '#00C8FF',
      emissiveIntensity: 0.95,
      metalness: 0.7,
      roughness: 0.15,
    });

    const hoverMat = new THREE.MeshStandardMaterial({
      color: '#1677FF',
      emissive: '#00C8FF',
      emissiveIntensity: 0.45,
      metalness: 0.7,
      roughness: 0.2,
    });

    return {
      carbonMat,
      standoffMat,
      bellCyanMat,
      bellRedMat,
      titaniumMat,
      screwMat,
      screwHexMat,
      copperMat,
      ironMat,
      propMatCW,
      propMatCCW,
      lipoMat,
      lipoLabelMat,
      goldMat,
      pcbMat,
      selectMat,
      hoverMat,
    };
  }, [xrayMode]);

  const isSelected = (id: string) => selectedComponentId === id;
  const isHovered = (id: string) => hoveredComponentId === id;

  const resolveMat = (id: string, defaultMat: THREE.Material) => {
    const mat = isSelected(id) ? materials.selectMat : isHovered(id) ? materials.hoverMat : defaultMat;
    if (mat && 'wireframe' in mat) {
      (mat as any).wireframe = wireframeMode;
    }
    return mat;
  };

  // 4 Arm Angles in Quad-X Configuration: 45°, 135°, 225°, 315°
  const armAngles = [
    Math.PI * 0.25,  // Front-Right (CW)
    Math.PI * 0.75,  // Rear-Right (CCW)
    Math.PI * 1.25,  // Rear-Left (CW)
    Math.PI * 1.75,  // Front-Left (CCW)
  ];

  // 1. Aerodynamic Bottom Deck with Beveled Chamfers & Weight Cutouts
  const bottomPlateGeometry = useMemo(() => {
    const s = new THREE.Shape();
    const w = (bodyW * 0.88) * 0.5;
    const l = (bodyL * 0.98) * 0.5;
    const waist = w * 0.62;

    // Front camera bracket nose
    s.moveTo(0, -l * 1.12);
    s.lineTo(w * 0.42, -l * 1.08);
    // Front-right arm attachment root
    s.lineTo(w, -l * 0.68);
    s.lineTo(w * 1.06, -l * 0.42);
    // Narrowing to aerodynamic waist
    s.bezierCurveTo(w * 0.82, -l * 0.12, waist * 1.05, 0, waist, 0);
    // Waist outward to rear-right arm root
    s.bezierCurveTo(waist * 1.05, 0, w * 0.82, l * 0.12, w * 1.06, l * 0.42);
    s.lineTo(w, l * 0.68);
    // Rear antenna tail
    s.lineTo(w * 0.38, l * 1.16);
    s.lineTo(-w * 0.38, l * 1.16);
    // Rear-left arm attachment root
    s.lineTo(-w, l * 0.68);
    s.lineTo(-w * 1.06, l * 0.42);
    // Left waist
    s.bezierCurveTo(-w * 0.82, l * 0.12, -waist * 1.05, 0, -waist, 0);
    s.bezierCurveTo(-waist * 1.05, 0, -w * 0.82, -l * 0.12, -w * 1.06, -l * 0.42);
    // Front-left arm root
    s.lineTo(-w, -l * 0.68);
    s.lineTo(-w * 0.42, -l * 1.08);
    s.closePath();

    // Central weight-reduction cutouts
    const centerHole = new THREE.Path();
    const hw = w * 0.32;
    const hl = l * 0.32;
    centerHole.moveTo(-hw, -hl);
    centerHole.lineTo(hw, -hl);
    centerHole.lineTo(hw, hl);
    centerHole.lineTo(-hw, hl);
    centerHole.closePath();
    s.holes.push(centerHole);

    return new THREE.ExtrudeGeometry(s, {
      depth: 0.045,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.006,
      bevelThickness: 0.006,
    });
  }, [bodyW, bodyL]);

  // 2. Aerodynamic Top Deck with Battery Strap Pass-Through Slots
  const topPlateGeometry = useMemo(() => {
    const s = new THREE.Shape();
    const w = (bodyW * 0.76) * 0.5;
    const l = (bodyL * 0.88) * 0.5;
    const waist = w * 0.68;

    s.moveTo(0, -l * 1.06);
    s.lineTo(w * 0.38, -l * 1.02);
    s.lineTo(w, -l * 0.52);
    s.bezierCurveTo(w * 0.82, -l * 0.14, waist * 1.05, 0, waist, 0);
    s.bezierCurveTo(waist * 1.05, 0, w * 0.82, l * 0.14, w, l * 0.52);
    s.lineTo(w * 0.35, l * 1.12);
    s.lineTo(-w * 0.35, l * 1.12);
    s.lineTo(-w, l * 0.52);
    s.bezierCurveTo(-w * 0.82, l * 0.14, -waist * 1.05, 0, -waist, 0);
    s.bezierCurveTo(-waist * 1.05, 0, -w * 0.82, -l * 0.14, -w, -l * 0.52);
    s.lineTo(-w * 0.38, -l * 1.02);
    s.closePath();

    // Front battery strap slot
    const slot1 = new THREE.Path();
    slot1.moveTo(-w * 0.48, -l * 0.28);
    slot1.lineTo(w * 0.48, -l * 0.28);
    slot1.lineTo(w * 0.48, -l * 0.2);
    slot1.lineTo(-w * 0.48, -l * 0.2);
    slot1.closePath();
    s.holes.push(slot1);

    // Rear battery strap slot
    const slot2 = new THREE.Path();
    slot2.moveTo(-w * 0.48, l * 0.2);
    slot2.lineTo(w * 0.48, l * 0.2);
    slot2.lineTo(w * 0.48, l * 0.28);
    slot2.lineTo(-w * 0.48, l * 0.28);
    slot2.closePath();
    s.holes.push(slot2);

    return new THREE.ExtrudeGeometry(s, {
      depth: 0.038,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.005,
      bevelThickness: 0.005,
    });
  }, [bodyW, bodyL]);

  // Procedural Aerodynamic Propeller Blade Geometry (True horizontal airfoil with pitch twist)
  const bladeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Aerodynamic airfoil outline (chord width in Y, span in X)
    shape.moveTo(0.04, -0.022);
    shape.bezierCurveTo(propD * 0.18, -0.045, propD * 0.35, -0.04, propD * 0.47, -0.012);
    shape.quadraticCurveTo(propD * 0.51, 0.0, propD * 0.47, 0.015);
    shape.bezierCurveTo(propD * 0.32, 0.038, propD * 0.14, 0.032, 0.04, 0.018);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.012,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.004,
      bevelThickness: 0.003,
    });
  }, [propD]);

  // Continuous aerodynamic propeller rotation and LED pulse
  useFrame((state, delta) => {
    currentExplode.current = THREE.MathUtils.lerp(currentExplode.current, explodeFactor, delta * 5);

    // Propeller spinning: index 0 & 2 CW, index 1 & 3 CCW
    propRefs.current.forEach((pRef, index) => {
      if (pRef) {
        const direction = index % 2 === 0 ? 1 : -1;
        if (motorsSpinning) {
          pRef.rotation.y += delta * 24 * direction;
        } else {
          // Park at clean aerodynamic angle for CAD inspection
          pRef.rotation.y = THREE.MathUtils.lerp(pRef.rotation.y, (index * Math.PI) / 4, delta * 6);
        }
      }
    });

    // Blinking Flight Controller LEDs
    if (ledRef.current) {
      ledRef.current.intensity = 1.4 + Math.sin(state.clock.elapsedTime * 8) * 0.9;
    }
    if (ledRef2.current) {
      ledRef2.current.intensity = 1.1 + Math.cos(state.clock.elapsedTime * 6) * 0.8;
    }

    // Spatial 3D Drone Orbit driven by Open Palm Hand Gestures (Instant zero-lag response)
    if (groupRef.current && gestureState?.palmRotation) {
      if (gestureState.detected || gestureState.demoSimulated) {
        groupRef.current.rotation.y = THREE.MathUtils.damp(
          groupRef.current.rotation.y,
          gestureState.palmRotation.yaw,
          18,
          delta
        );
        groupRef.current.rotation.x = THREE.MathUtils.damp(
          groupRef.current.rotation.x,
          gestureState.palmRotation.pitch,
          18,
          delta
        );
      }
    }
  });

  return (
    <group ref={groupRef} name="GestureCAD_Quadcopter_Assembly">
      {/* ============================================================== */}
      {/* 1. CARBON UNIBODY CHASSIS & CNC STANDOFFS                     */}
      {/* ============================================================== */}
      {isFrameVisible && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId('c-frame');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId('c-frame');
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {/* Lower Unibody Carbon Deck Plate (CNC Contoured & Chamfered) */}
          <mesh
            geometry={bottomPlateGeometry}
            position={[0, -bodyH * 0.5 - currentExplode.current * 0.35, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={resolveMat('c-frame', materials.carbonMat)}
            castShadow
            receiveShadow
          />

          {/* Upper Carbon Deck Plate (CNC Contoured with Battery Strap Slots) */}
          <mesh
            geometry={topPlateGeometry}
            position={[0, bodyH * 0.5 + currentExplode.current * 0.45, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={resolveMat('c-frame', materials.carbonMat)}
            castShadow
            receiveShadow
          />

          {/* 6 Blue Anodized CNC Hexagonal Standoff Posts */}
          {[
            [-bodyW * 0.32, bodyL * 0.32],
            [bodyW * 0.32, bodyL * 0.32],
            [-bodyW * 0.32, -bodyL * 0.32],
            [bodyW * 0.32, -bodyL * 0.32],
            [-bodyW * 0.36, 0],
            [bodyW * 0.36, 0],
          ].map(([sx, sz], i) => (
            <mesh
              key={`standoff-${i}`}
              position={[sx, 0, sz]}
              material={materials.standoffMat}
              castShadow
            >
              <cylinderGeometry args={[0.022, 0.022, bodyH, 6]} />
            </mesh>
          ))}

          {/* 6 Countersunk M3 Titanium Screws on Top Plate */}
          {[
            [-bodyW * 0.32, bodyL * 0.32],
            [bodyW * 0.32, bodyL * 0.32],
            [-bodyW * 0.32, -bodyL * 0.32],
            [bodyW * 0.32, -bodyL * 0.32],
            [-bodyW * 0.36, 0],
            [bodyW * 0.36, 0],
          ].map(([sx, sz], i) => (
            <group
              key={`top-screw-${i}`}
              position={[sx, bodyH * 0.5 + currentExplode.current * 0.45 + 0.022, sz]}
            >
              <mesh material={materials.screwMat}>
                <cylinderGeometry args={[0.024, 0.024, 0.012, 16]} />
              </mesh>
              <mesh position={[0, 0.007, 0]} material={materials.screwHexMat}>
                <cylinderGeometry args={[0.012, 0.012, 0.005, 6]} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ============================================================== */}
      {/* 2. AVIONICS BAY: 4-IN-1 ESC & STM32 FLIGHT CONTROLLER         */}
      {/* ============================================================== */}
      {isFcVisible && (
        <group
          position={[0, currentExplode.current * 0.2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId('c-fc');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId('c-fc');
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {/* Lower 4-in-1 ESC Board */}
          <mesh position={[0, -0.06, 0]} material={materials.pcbMat} castShadow>
            <boxGeometry args={[bodyW * 0.48, 0.02, bodyL * 0.48]} />
          </mesh>

          {/* ESC Gold Solder Terminals */}
          {[-bodyW * 0.23, bodyW * 0.23].map((tx, ti) => (
            <mesh key={`esc-tab-${ti}`} position={[tx, -0.055, 0]} material={materials.goldMat}>
              <boxGeometry args={[0.03, 0.022, bodyL * 0.4]} />
            </mesh>
          ))}

          {/* Silicone Anti-Vibration Damping Bobbins */}
          {[
            [-bodyW * 0.18, bodyL * 0.18],
            [bodyW * 0.18, bodyL * 0.18],
            [-bodyW * 0.18, -bodyL * 0.18],
            [bodyW * 0.18, -bodyL * 0.18],
          ].map(([dx, dz], idx) => (
            <mesh key={`damper-${idx}`} position={[dx, -0.015, dz]} material={materials.titaniumMat}>
              <cylinderGeometry args={[0.018, 0.018, 0.05, 12]} />
            </mesh>
          ))}

          {/* Upper STM32 Flight Controller Board */}
          <mesh position={[0, 0.03, 0]} material={resolveMat('c-fc', materials.pcbMat)} castShadow>
            <boxGeometry args={[bodyW * 0.46, 0.02, bodyL * 0.46]} />
          </mesh>

          {/* STM32 Processor MCU Chip with Silver Marking */}
          <mesh position={[0, 0.05, 0]} material={materials.titaniumMat}>
            <boxGeometry args={[bodyW * 0.16, 0.02, bodyL * 0.16]} />
          </mesh>

          {/* MPU6000 Gyro IMU Chip */}
          <mesh position={[bodyW * 0.12, 0.045, -bodyL * 0.1]} material={materials.ironMat}>
            <boxGeometry args={[0.05, 0.015, 0.05]} />
          </mesh>

          {/* USB-C Firmware Port */}
          <mesh position={[-bodyW * 0.22, 0.035, 0]} material={materials.standoffMat}>
            <boxGeometry args={[0.03, 0.025, 0.07]} />
          </mesh>

          {/* Heartbeat Telemetry LED (Pulsing Cyan) */}
          <pointLight
            ref={ledRef}
            position={[bodyW * 0.14, 0.07, bodyL * 0.14]}
            color="#00C8FF"
            intensity={2}
            distance={1.5}
          />
          <mesh position={[bodyW * 0.14, 0.05, bodyL * 0.14]}>
            <boxGeometry args={[0.02, 0.015, 0.02]} />
            <meshBasicMaterial color="#00C8FF" />
          </mesh>

          {/* Status Telemetry LED (Pulsing Amber/Red) */}
          <pointLight
            ref={ledRef2}
            position={[-bodyW * 0.14, 0.07, -bodyL * 0.14]}
            color="#F04444"
            intensity={1.2}
            distance={1.2}
          />
          <mesh position={[-bodyW * 0.14, 0.05, -bodyL * 0.14]}>
            <boxGeometry args={[0.02, 0.015, 0.02]} />
            <meshBasicMaterial color="#F04444" />
          </mesh>
        </group>
      )}

      {/* ============================================================== */}
      {/* 3. LIPO BATTERY PACK MOUNTED ON TOP OF TOP PLATE              */}
      {/* ============================================================== */}
      {isBatteryVisible && (
        <group
          position={[0, bodyH * 0.5 + 0.16 + currentExplode.current * 0.8, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId('c-battery');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId('c-battery');
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {/* Silicone Anti-Slip Sticky Battery Pad */}
          <mesh position={[0, -0.115, 0]} material={materials.carbonMat}>
            <boxGeometry args={[bodyW * 0.48, 0.012, bodyL * 0.68]} />
          </mesh>

          {/* Main 4S LiPo Cell Brick (Black Heat-Shrink Sleeve) */}
          <mesh material={resolveMat('c-battery', materials.lipoMat)} castShadow>
            <boxGeometry args={[bodyW * 0.52, 0.22, bodyL * 0.72]} />
          </mesh>

          {/* Yellow Branding Label Band: "4S 1500mAh 120C" */}
          <mesh position={[0, 0, 0]} material={materials.lipoLabelMat}>
            <boxGeometry args={[bodyW * 0.524, 0.224, bodyL * 0.42]} />
          </mesh>

          {/* Kevlar Woven Battery Strap with Blue Aluminum Clasp */}
          <mesh position={[0, 0.01, 0]} material={materials.titaniumMat}>
            <boxGeometry args={[bodyW * 0.54, 0.24, 0.1]} />
          </mesh>
          <mesh position={[0, 0.125, 0]} material={materials.standoffMat}>
            <boxGeometry args={[0.1, 0.02, 0.11]} />
          </mesh>

          {/* Red and Black 12AWG Silicone Power Cables */}
          <mesh position={[-0.03, 0.03, bodyL * 0.4]} material={materials.bellRedMat}>
            <cylinderGeometry args={[0.016, 0.016, 0.12, 12]} />
          </mesh>
          <mesh position={[0.03, 0.03, bodyL * 0.4]} material={materials.lipoMat}>
            <cylinderGeometry args={[0.016, 0.016, 0.12, 12]} />
          </mesh>

          {/* Genuine Yellow Nylon XT60 Connector Plug */}
          <mesh position={[0, 0.03, bodyL * 0.48]}>
            <boxGeometry args={[0.08, 0.05, 0.09]} />
            <meshStandardMaterial color="#eab308" roughness={0.3} />
          </mesh>

          {/* Gold Bullet Pins inside XT60 */}
          {[-0.02, 0.02].map((px, pi) => (
            <mesh key={`pin-${pi}`} position={[px, 0.03, bodyL * 0.52]} material={materials.goldMat}>
              <cylinderGeometry args={[0.008, 0.008, 0.015, 12]} />
            </mesh>
          ))}

          {/* White JST-XH Cell Balance Lead */}
          <mesh position={[0.08, 0.07, bodyL * 0.38]}>
            <boxGeometry args={[0.04, 0.04, 0.06]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* ============================================================== */}
      {/* 4. FRONT HD FPV CAMERA WITH TITANIUM SIDE PLATES               */}
      {/* ============================================================== */}
      {isCameraVisible && (
        <group
          position={[0, 0, -(bodyL * 0.44 + 0.14 + currentExplode.current * 0.55)]}
          rotation={[-0.25, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId('c-camera');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId('c-camera');
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {/* Titanium Protection Side Cheek Plates */}
          <mesh position={[-0.12, 0, 0]} material={materials.titaniumMat} castShadow>
            <boxGeometry args={[0.02, 0.22, 0.24]} />
          </mesh>
          <mesh position={[0.12, 0, 0]} material={materials.titaniumMat} castShadow>
            <boxGeometry args={[0.02, 0.22, 0.24]} />
          </mesh>

          {/* Brass Tilt Angle Adjustment Screws */}
          {[-0.13, 0.13].map((cx, ci) => (
            <mesh key={`cam-screw-${ci}`} position={[cx, 0, 0]} material={materials.standoffMat}>
              <cylinderGeometry args={[0.025, 0.025, 0.015, 12]} />
            </mesh>
          ))}

          {/* Camera Core Aluminum Housing */}
          <mesh material={resolveMat('c-camera', materials.carbonMat)} castShadow>
            <boxGeometry args={[0.2, 0.18, 0.18]} />
          </mesh>

          {/* Machined Metal Lens Barrel */}
          <mesh position={[0, 0, -0.11]} rotation={[Math.PI / 2, 0, 0]} material={materials.titaniumMat}>
            <cylinderGeometry args={[0.065, 0.075, 0.08, 24]} />
          </mesh>

          {/* Spherical Optical Glass Lens with Anti-Reflective Cyan Sheen */}
          <mesh position={[0, 0, -0.155]}>
            <sphereGeometry args={[0.06, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshPhysicalMaterial
              color="#00C8FF"
              metalness={0.2}
              roughness={0.05}
              transmission={0.88}
              thickness={0.15}
              transparent
              opacity={0.95}
              ior={1.62}
            />
          </mesh>
        </group>
      )}

      {/* ============================================================== */}
      {/* 5. 4 CANTILEVER ARMS, 2207 MOTORS & HORIZONTAL AIRFOIL PROPS   */}
      {/* ============================================================== */}
      {armAngles.map((angle, index) => {
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const motorX = cosA * armLen;
        const motorZ = sinA * armLen;

        // Radial explode expansion offset
        const expX = cosA * currentExplode.current * 0.65;
        const expZ = sinA * currentExplode.current * 0.65;

        // Aerodynamic counter-rotation
        const isCW = index % 2 === 0;
        const isFront = index === 0 || index === 3;

        return (
          <group key={`quad-arm-${index}`} position={[expX, 0, expZ]}>
            {/* The Solid Carbon Arm Beam with Triangular Skeletal Cutouts */}
            {isFrameVisible && (
              <group
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedComponentId('c-frame');
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredComponentId('c-frame');
                }}
                onPointerOut={() => setHoveredComponentId(null)}
              >
                {/* Arm Beam with Chamfered Fillets */}
                <mesh
                  position={[motorX * 0.5, 0, motorZ * 0.5]}
                  rotation={[0, -angle + Math.PI / 2, 0]}
                  material={resolveMat('c-frame', materials.carbonMat)}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[0.13, 0.055, armLen]} />
                </mesh>

                {/* Triangular Weight-Reduction Truss Cutouts */}
                {[-0.2, 0.0, 0.2].map((slotOffset, si) => (
                  <mesh
                    key={`arm-slot-${si}`}
                    position={[motorX * (0.5 + slotOffset * 0.4), 0, motorZ * (0.5 + slotOffset * 0.4)]}
                    rotation={[0, -angle + Math.PI / 2, 0]}
                    material={materials.titaniumMat}
                  >
                    <boxGeometry args={[0.07, 0.058, armLen * 0.16]} />
                  </mesh>
                ))}

                {/* 3-Wire Silicone Motor Wire Bundle along the Arm */}
                <mesh
                  position={[motorX * 0.5, 0.035, motorZ * 0.5]}
                  rotation={[0, -angle + Math.PI / 2, 0]}
                  material={materials.lipoMat}
                >
                  <boxGeometry args={[0.035, 0.015, armLen * 0.92]} />
                </mesh>

                {/* Contoured Teardrop Motor Mount Plate at Tip */}
                <mesh
                  position={[motorX, -0.01, motorZ]}
                  material={resolveMat('c-frame', materials.carbonMat)}
                  castShadow
                >
                  <cylinderGeometry args={[motorD * 0.72, motorD * 0.72, 0.055, 28]} />
                </mesh>

                {/* 4 Carbon Impact Bumper Guard Ears around Motor Mount Tip */}
                {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((bumpA, bumpI) => {
                  const bx = Math.cos(bumpA + angle) * (motorD * 0.65);
                  const bz = Math.sin(bumpA + angle) * (motorD * 0.65);
                  return (
                    <mesh
                      key={`bumper-${bumpI}`}
                      position={[motorX + bx, -0.01, motorZ + bz]}
                      material={resolveMat('c-frame', materials.carbonMat)}
                      castShadow
                    >
                      <cylinderGeometry args={[0.024, 0.024, 0.055, 12]} />
                    </mesh>
                  );
                })}

                {/* 2 Titanium Root Locking Press-Bolts Clamping Arm to Chassis */}
                {[-0.038, 0.038].map((bx, bi) => (
                  <group
                    key={`arm-root-bolt-${bi}`}
                    position={[motorX * 0.22 + bx * Math.cos(-angle), 0.035, motorZ * 0.22 + bx * Math.sin(-angle)]}
                  >
                    <mesh material={materials.screwMat}>
                      <cylinderGeometry args={[0.02, 0.02, 0.014, 12]} />
                    </mesh>
                    <mesh position={[0, 0.008, 0]} material={materials.screwHexMat}>
                      <cylinderGeometry args={[0.01, 0.01, 0.006, 6]} />
                    </mesh>
                  </group>
                ))}

                {/* 4 Underside M3 Titanium Motor Mount Screws */}
                {[
                  [-motorD * 0.26, -motorD * 0.26],
                  [motorD * 0.26, -motorD * 0.26],
                  [-motorD * 0.26, motorD * 0.26],
                  [motorD * 0.26, motorD * 0.26],
                ].map(([mx, mz], mi) => (
                  <mesh
                    key={`m-screw-${mi}`}
                    position={[motorX + mx, -0.04, motorZ + mz]}
                    material={materials.screwMat}
                  >
                    <cylinderGeometry args={[0.014, 0.014, 0.01, 12]} />
                  </mesh>
                ))}

                {/* Silicone Motor Wire Retaining Clips on Arm */}
                {[-0.2, 0.2].map((clipPos, ci) => (
                  <mesh
                    key={`arm-clip-${ci}`}
                    position={[motorX * (0.5 + clipPos * 0.4), 0.04, motorZ * (0.5 + clipPos * 0.4)]}
                    rotation={[0, -angle + Math.PI / 2, 0]}
                    material={materials.standoffMat}
                  >
                    <boxGeometry args={[0.045, 0.02, 0.024]} />
                  </mesh>
                ))}

                {/* TPU Landing Skid Foot under Motor Mount */}
                <mesh position={[motorX, -0.085, motorZ]} material={materials.standoffMat}>
                  <cylinderGeometry args={[0.035, 0.02, 0.09, 16]} />
                </mesh>

                {/* Arm Tip Orientation Nav LED (Front: Cyan, Rear: Aviation Red) */}
                <group position={[motorX, 0.02, motorZ]}>
                  <mesh
                    position={[
                      Math.cos(angle) * (motorD * 0.72),
                      0,
                      Math.sin(angle) * (motorD * 0.72),
                    ]}
                  >
                    <boxGeometry args={[0.022, 0.015, 0.022]} />
                    <meshBasicMaterial color={isFront ? '#00C8FF' : '#ef4444'} />
                  </mesh>
                  <pointLight
                    position={[
                      Math.cos(angle) * (motorD * 0.72),
                      0.03,
                      Math.sin(angle) * (motorD * 0.72),
                    ]}
                    color={isFront ? '#00C8FF' : '#ef4444'}
                    intensity={0.65}
                    distance={1.0}
                  />
                </group>
              </group>
            )}

            {/* Brushless Outrunner DC Motor (2207 scale) */}
            {isMotorVisible && (
              <group
                position={[motorX, 0.065, motorZ]}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedComponentId('c-motors');
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredComponentId('c-motors');
                }}
                onPointerOut={() => setHoveredComponentId(null)}
              >
                {/* Stator CNC Base Mount with 4 M3 Screw Holes */}
                <mesh material={materials.titaniumMat} castShadow>
                  <cylinderGeometry args={[motorD * 0.5, motorD * 0.5, 0.05, 24]} />
                </mesh>

                {/* 12 Stator Armature Poles with Pure Copper Windings */}
                {Array.from({ length: 12 }).map((_, pIdx) => {
                  const pAngle = (pIdx * Math.PI * 2) / 12;
                  const px = Math.cos(pAngle) * (motorD * 0.26);
                  const pz = Math.sin(pAngle) * (motorD * 0.26);
                  return (
                    <mesh key={`pole-${pIdx}`} position={[px, 0.04, pz]} material={materials.copperMat}>
                      <cylinderGeometry args={[motorD * 0.08, motorD * 0.08, 0.06, 8]} />
                    </mesh>
                  );
                })}

                {/* Stator Core Iron Hub */}
                <mesh position={[0, 0.04, 0]} material={materials.ironMat}>
                  <cylinderGeometry args={[motorD * 0.22, motorD * 0.22, 0.06, 16]} />
                </mesh>

                {/* Anodized Outer Rotor Bell with Cooling Air Vents */}
                <mesh
                  position={[0, 0.085, 0]}
                  material={resolveMat('c-motors', isCW ? materials.bellCyanMat : materials.bellRedMat)}
                  castShadow
                >
                  <cylinderGeometry args={[motorD * 0.48, motorD * 0.48, 0.1, 28]} />
                </mesh>

                {/* 6 Curved Bell Cooling Vents */}
                {Array.from({ length: 6 }).map((_, vIdx) => {
                  const vAngle = (vIdx * Math.PI * 2) / 6;
                  const vx = Math.cos(vAngle) * (motorD * 0.26);
                  const vz = Math.sin(vAngle) * (motorD * 0.26);
                  return (
                    <mesh key={`vent-${vIdx}`} position={[vx, 0.138, vz]} material={materials.ironMat}>
                      <boxGeometry args={[motorD * 0.1, 0.008, motorD * 0.14]} />
                    </mesh>
                  );
                })}

                {/* Rotor Bell Laser Engraved Silver Accent Ring */}
                <mesh position={[0, 0.085, 0]} material={materials.titaniumMat}>
                  <cylinderGeometry args={[motorD * 0.482, motorD * 0.482, 0.02, 28]} />
                </mesh>

                {/* Titanium 5mm Motor Shaft & M5 Flanged Propeller Locknut */}
                <mesh position={[0, 0.165, 0]} material={materials.titaniumMat}>
                  <cylinderGeometry args={[0.025, 0.025, 0.09, 14]} />
                </mesh>
                <mesh position={[0, 0.22, 0]} material={materials.standoffMat}>
                  <cylinderGeometry args={[0.045, 0.035, 0.03, 6]} />
                </mesh>
              </group>
            )}

            {/* Aerodynamic Airfoil Propeller (Horizontal Rotation) */}
            {isPropVisible && (
              <group
                ref={(el) => (propRefs.current[index] = el)}
                position={[motorX, 0.23 + currentExplode.current * 0.45, motorZ]}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedComponentId('c-props');
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredComponentId('c-props');
                }}
                onPointerOut={() => setHoveredComponentId(null)}
              >
                {/* Propeller Hub with Aerodynamic Spinner Nose */}
                <mesh material={materials.titaniumMat} castShadow>
                  <cylinderGeometry args={[0.048, 0.052, 0.04, 18]} />
                </mesh>

                {/* 3 Realistic Curved Airfoil Blades (Horizontal Plane: X-Z with aerodynamic pitch) */}
                {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((bAngle, bIdx) => (
                  <group key={`airfoil-blade-${bIdx}`} rotation={[0, bAngle, 0]}>
                    <mesh
                      geometry={bladeGeometry}
                      // Rotate -90° on X to lie horizontally flat in X-Z, with true pitch twist
                      rotation={[-Math.PI / 2 + (isCW ? 0.22 : -0.22), 0, 0]}
                      material={resolveMat('c-props', isCW ? materials.propMatCW : materials.propMatCCW)}
                      castShadow
                    />
                  </group>
                ))}

                {/* High-speed Aerodynamic Tip Motion Blur Disc (Active during spin) */}
                {motorsSpinning && (
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <ringGeometry args={[propD * 0.46, propD * 0.51, 48]} />
                    <meshBasicMaterial
                      color={isCW ? '#00C8FF' : '#1677FF'}
                      transparent
                      opacity={0.34}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                )}
              </group>
            )}
          </group>
        );
      })}

      {/* ============================================================== */}
      {/* 6. MODULAR HARDWARE ACCESSORIES & AVIONICS PAYLOAD            */}
      {/* ============================================================== */}

      {/* 6.A. GPS & COMPASS MAST (Rendered when GPS component is in assembly) */}
      {gpsComp && (
        <group
          position={[0, bodyH * 0.5 + 0.12 + currentExplode.current * 0.7, bodyL * 0.36]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId(gpsComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId(gpsComp.id);
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {/* CNC Aluminum Folding Mast Base */}
          <mesh material={materials.standoffMat}>
            <cylinderGeometry args={[0.03, 0.035, 0.04, 16]} />
          </mesh>
          {/* Carbon Fiber Mast Tube */}
          <mesh position={[0, 0.14, 0]} material={materials.carbonMat}>
            <cylinderGeometry args={[0.015, 0.015, 0.26, 12]} />
          </mesh>
          {/* Aerodynamic Circular GPS Antenna Puck */}
          <group position={[0, 0.28, 0]}>
            <mesh material={resolveMat(gpsComp.id, materials.titaniumMat)} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.035, 28]} />
            </mesh>
            {/* Ceramic Patch Antenna on Top */}
            <mesh position={[0, 0.02, 0]} material={materials.carbonMat}>
              <boxGeometry args={[0.065, 0.008, 0.065]} />
            </mesh>
            {/* Active GPS Lock Green Pulsing LED */}
            <mesh position={[0.04, 0.022, 0.04]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>
        </group>
      )}

      {/* 6.B. 5.8GHz VTX TRANSMITTER & HIGH-GAIN ANTENNA */}
      {vtxComp ? (
        <group
          position={[0, bodyH * 0.5 + 0.08 + currentExplode.current * 0.6, bodyL * 0.44]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId(vtxComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId(vtxComp.id);
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {/* Gold SMA Connector Nut */}
          <mesh position={[0, 0, 0]} material={materials.goldMat}>
            <cylinderGeometry args={[0.022, 0.022, 0.04, 6]} />
          </mesh>
          {/* Semi-Rigid Coax Cable Angled Backwards 35° */}
          <mesh position={[0, 0.12, 0.06]} rotation={[0.42, 0, 0]} material={materials.carbonMat}>
            <cylinderGeometry args={[0.012, 0.012, 0.28, 12]} />
          </mesh>
          {/* Pagoda / Lollipop Circular Polarized Antenna Cap */}
          <group position={[0, 0.23, 0.12]}>
            <mesh material={resolveMat(vtxComp.id, materials.bellRedMat)} castShadow>
              <cylinderGeometry args={[0.048, 0.048, 0.03, 24]} />
            </mesh>
            <mesh position={[0, 0.018, 0]} material={materials.standoffMat}>
              <sphereGeometry args={[0.025, 12, 12]} />
            </mesh>
          </group>
        </group>
      ) : (
        /* Default Omnidirectional Stub Antenna when dedicated VTX module not added */
        <group position={[0, bodyH * 0.5 + 0.1, bodyL * 0.38]}>
          <mesh rotation={[0.32, 0, 0]} material={materials.carbonMat}>
            <cylinderGeometry args={[0.014, 0.014, 0.32, 12]} />
          </mesh>
          <mesh position={[0, 0.17, 0.05]} material={materials.bellRedMat}>
            <sphereGeometry args={[0.034, 16, 16]} />
          </mesh>
        </group>
      )}

      {/* 6.C. HD ACTION CAMERA MOUNT (TPU cage with 4K camera) */}
      {actionCamComp && (
        <group
          position={[0, bodyH * 0.5 + 0.12 + currentExplode.current * 0.5, -(bodyL * 0.44)]}
          rotation={[-0.38, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId(actionCamComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId(actionCamComp.id);
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {/* 3D-Printed Neon TPU Mounting Cage */}
          <mesh material={resolveMat(actionCamComp.id, materials.standoffMat)} castShadow>
            <boxGeometry args={[bodyW * 0.38, 0.18, 0.16]} />
          </mesh>
          {/* Action Camera Body (Black Alloy) */}
          <mesh position={[0, 0, 0]} material={materials.carbonMat}>
            <boxGeometry args={[bodyW * 0.34, 0.15, 0.13]} />
          </mesh>
          {/* Camera Lens Bezel & Glass Element */}
          <mesh position={[0, 0, -0.075]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, -0.086]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.005, 24]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.3} transparent opacity={0.85} />
          </mesh>
          {/* Red Tally LED Indicator */}
          <mesh position={[bodyW * 0.12, 0.05, -0.07]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* 6.D. CARBON FIBER LANDING SKIDS (Under 4 Motor Mounts) */}
      {landingSkidsComp && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId(landingSkidsComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId(landingSkidsComp.id);
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {armAngles.map((angle, skidIdx) => {
            const sx = Math.cos(angle) * armLen;
            const sz = Math.sin(angle) * armLen;
            return (
              <group key={`landing-strut-${skidIdx}`} position={[sx, -0.16, sz]}>
                {/* Angled Carbon Fiber Strut Leg */}
                <mesh material={resolveMat(landingSkidsComp.id, materials.carbonMat)} castShadow>
                  <cylinderGeometry args={[0.016, 0.012, 0.24, 10]} />
                </mesh>
                {/* Shock-Absorbing Silicone Landing Foot */}
                <mesh position={[0, -0.12, 0]} material={materials.standoffMat}>
                  <sphereGeometry args={[0.03, 12, 12]} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* 6.E. OBSTACLE AVOIDANCE MICRO LIDAR (Belly-Mounted Optical Pod) */}
      {lidarComp && (
        <group
          position={[0, -bodyH * 0.5 - 0.06 - currentExplode.current * 0.3, -bodyL * 0.25]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId(lidarComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId(lidarComp.id);
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          {/* Sensor Pod Enclosure */}
          <mesh material={resolveMat(lidarComp.id, materials.carbonMat)}>
            <boxGeometry args={[0.09, 0.032, 0.045]} />
          </mesh>
          {/* Dual Optical Transmitter / Receiver Lenses */}
          {[-0.025, 0.025].map((lx, li) => (
            <mesh key={`lidar-lens-${li}`} position={[lx, 0, -0.024]} rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
              <meshStandardMaterial color="#00C8FF" emissive="#00C8FF" emissiveIntensity={0.6} />
            </mesh>
          ))}
        </group>
      )}

      {/* 6.F. AUTONOMOUS FINDER BUZZER & STROBE */}
      {buzzerComp && (
        <group
          position={[bodyW * 0.16, bodyH * 0.5 + 0.04, -bodyL * 0.16]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId(buzzerComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponentId(buzzerComp.id);
          }}
          onPointerOut={() => setHoveredComponentId(null)}
        >
          <mesh material={resolveMat(buzzerComp.id, materials.standoffMat)} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          </mesh>
          <mesh position={[0, 0.016, 0]} material={materials.ironMat}>
            <cylinderGeometry args={[0.012, 0.012, 0.005, 12]} />
          </mesh>
        </group>
      )}



      {/* ============================================================== */}
      {/* 8. FLOATING COMPONENT INSPECTION CALLOUT CARD                   */}
      {/* ============================================================== */}
      {selectedComponentId && (
        <group>
          {selectedComponentId === 'c-motors' && (
            <Html position={[Math.cos(armAngles[0]) * armLen, 0.48, Math.sin(armAngles[0]) * armLen]} center distanceFactor={9}>
              <div className="bg-[#07111F]/95 backdrop-blur-md border border-[#00C8FF] p-2.5 rounded-xl shadow-glass text-white font-mono min-w-[200px] pointer-events-auto">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
                  <span className="text-[#00C8FF] font-bold">2207 BRUSHLESS MOTOR</span>
                  <button onClick={() => setSelectedComponentId(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="mt-1 space-y-0.5 text-[9px] text-slate-300">
                  <div>Stator Diameter: <span className="text-white font-bold">{config.motorSize} mm</span></div>
                  <div>Armature: <span className="text-amber-400">12-Pole Copper</span></div>
                  <div>Rating: <span className="text-emerald-400 font-bold">2450KV High-Torque</span></div>
                </div>
              </div>
            </Html>
          )}

          {selectedComponentId === 'c-props' && (
            <Html position={[Math.cos(armAngles[0]) * armLen, 0.48, Math.sin(armAngles[0]) * armLen]} center distanceFactor={9}>
              <div className="bg-[#07111F]/95 backdrop-blur-md border border-[#00C8FF] p-2.5 rounded-xl shadow-glass text-white font-mono min-w-[200px] pointer-events-auto">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
                  <span className="text-[#00C8FF] font-bold">TRI-BLADE AIRFOIL ROTOR</span>
                  <button onClick={() => setSelectedComponentId(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="mt-1 space-y-0.5 text-[9px] text-slate-300">
                  <div>Diameter: <span className="text-white font-bold">{config.propellerSize} in ({((config.propellerSize || 7) * 25.4).toFixed(0)} mm)</span></div>
                  <div>Material: <span className="text-cyan-300">Optical Polycarbonate</span></div>
                  <div>Pitch Twist: <span className="text-emerald-400">±12° Aerodynamic</span></div>
                </div>
              </div>
            </Html>
          )}

          {selectedComponentId === 'c-battery' && (
            <Html position={[0, bodyH * 0.5 + 0.46, 0]} center distanceFactor={9}>
              <div className="bg-[#07111F]/95 backdrop-blur-md border border-[#00C8FF] p-2.5 rounded-xl shadow-glass text-white font-mono min-w-[200px] pointer-events-auto">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
                  <span className="text-[#00C8FF] font-bold">4S 1500mAh GRAPHENE LIPO</span>
                  <button onClick={() => setSelectedComponentId(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="mt-1 space-y-0.5 text-[9px] text-slate-300">
                  <div>Voltage: <span className="text-amber-400 font-bold">14.8V Nominal (4S)</span></div>
                  <div>Discharge: <span className="text-emerald-400">120C Burst</span></div>
                  <div>Connector: <span className="text-[#00C8FF]">Gold XT60 + JST-XH</span></div>
                </div>
              </div>
            </Html>
          )}

          {selectedComponentId === 'c-camera' && (
            <Html position={[0, 0.28, -(bodyL * 0.44 + 0.25)]} center distanceFactor={9}>
              <div className="bg-[#07111F]/95 backdrop-blur-md border border-[#00C8FF] p-2.5 rounded-xl shadow-glass text-white font-mono min-w-[200px] pointer-events-auto">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
                  <span className="text-[#00C8FF] font-bold">HD FPV OPTICAL SENSOR</span>
                  <button onClick={() => setSelectedComponentId(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="mt-1 space-y-0.5 text-[9px] text-slate-300">
                  <div>Optics: <span className="text-cyan-300">Multi-Coated Glass</span></div>
                  <div>Uptilt Angle: <span className="text-white font-bold">30° Dynamic</span></div>
                  <div>Bracket: <span className="text-slate-300">7075-T6 Titanium Cage</span></div>
                </div>
              </div>
            </Html>
          )}

          {selectedComponentId === 'c-fc' && (
            <Html position={[0, 0.28, 0]} center distanceFactor={9}>
              <div className="bg-[#07111F]/95 backdrop-blur-md border border-[#00C8FF] p-2.5 rounded-xl shadow-glass text-white font-mono min-w-[200px] pointer-events-auto">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
                  <span className="text-[#00C8FF] font-bold">STM32F405 FLIGHT STACK</span>
                  <button onClick={() => setSelectedComponentId(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="mt-1 space-y-0.5 text-[9px] text-slate-300">
                  <div>Processor: <span className="text-white font-bold">STM32 Cortex-M4 168MHz</span></div>
                  <div>IMU Gyro: <span className="text-emerald-400">MPU6000 Low-Noise</span></div>
                  <div>ESC: <span className="text-[#00C8FF]">4-in-1 DShot600 55A</span></div>
                </div>
              </div>
            </Html>
          )}

          {selectedComponentId === 'c-frame' && (
            <Html position={[0, -0.35, 0]} center distanceFactor={9}>
              <div className="bg-[#07111F]/95 backdrop-blur-md border border-[#00C8FF] p-2.5 rounded-xl shadow-glass text-white font-mono min-w-[200px] pointer-events-auto">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
                  <span className="text-[#00C8FF] font-bold">3K TWILL CARBON CHASSIS</span>
                  <button onClick={() => setSelectedComponentId(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="mt-1 space-y-0.5 text-[9px] text-slate-300">
                  <div>Structure: <span className="text-white font-bold">Unibody Chamfered X-Deck</span></div>
                  <div>Arm Cantilever: <span className="text-[#39D5FF]">{config.armLength} mm (5mm Thick)</span></div>
                  <div>Wingspan: <span className="text-emerald-400 font-bold">{config.wingspan} mm</span></div>
                </div>
              </div>
            </Html>
          )}

          {/* Universal Inspection Callout for Added/Custom Components */}
          {(() => {
            const extraComp = components.find(
              (c) => c.id === selectedComponentId && !['c-motors', 'c-props', 'c-battery', 'c-camera', 'c-fc', 'c-frame'].includes(c.id)
            );
            if (!extraComp) return null;
            return (
              <Html position={[0, bodyH * 0.5 + 0.38, 0]} center distanceFactor={9}>
                <div className="bg-[#07111F]/95 backdrop-blur-md border border-[#00C8FF] p-2.5 rounded-xl shadow-glass text-white font-mono min-w-[210px] pointer-events-auto">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
                    <span className="text-[#00C8FF] font-bold uppercase truncate mr-2">{extraComp.name}</span>
                    <button onClick={() => setSelectedComponentId(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="mt-1 space-y-0.5 text-[9px] text-slate-300">
                    <div>Category: <span className="text-white font-bold uppercase">{extraComp.type}</span></div>
                    <div>Mass: <span className="text-amber-400 font-bold">{extraComp.weightGrams * extraComp.count}g</span> ({extraComp.weightGrams}g ea)</div>
                    <div>Quantity: <span className="text-emerald-400 font-bold">{extraComp.count} unit{extraComp.count > 1 ? 's' : ''}</span></div>
                    <div className="text-slate-400 pt-1 text-[8px] line-clamp-2">{extraComp.description}</div>
                  </div>
                </div>
              </Html>
            );
          })()}
        </group>
      )}
    </group>
  );
};

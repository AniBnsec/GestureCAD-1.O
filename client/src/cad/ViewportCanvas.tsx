import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { DroneModel } from './DroneModel';
import { useCadStore } from '../store/useCadStore';
import { ViewMode } from '../types';
import { useHandTracking } from '../gestures/useHandTracking';
import { useVoiceRecognition } from '../voice/useVoiceRecognition';
import {
  RotateCcw,
  Layers,
  Grid as GridIcon,
  Camera,
  CameraOff,
  Sparkles,
  Hand,
  Mic,
  MicOff,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Volume2,
  Radio,
  Play,
  Pause,
  Ruler,
  Box,
  Compass,
  HelpCircle,
  X,
  Wind,
  Scan,
  Camera as CameraIcon,
  ThumbsUp,
} from 'lucide-react';
import { exportCanvasSnapshot } from './exporters';

const CameraController: React.FC<{ viewMode: ViewMode }> = ({ viewMode }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!camera) return;

    if (viewMode === 'top') {
      camera.position.set(0, 7.8, 0.001);
      camera.up.set(0, 0, -1);
    } else if (viewMode === 'side') {
      camera.position.set(7.0, 0.4, 0);
      camera.up.set(0, 1, 0);
    } else if (viewMode === 'front') {
      camera.position.set(0, 0.4, 7.0);
      camera.up.set(0, 1, 0);
    } else if (viewMode === 'exploded') {
      camera.position.set(5.5, 4.0, 5.5);
      camera.up.set(0, 1, 0);
    } else {
      camera.position.set(4.2, 3.2, 4.8);
      camera.up.set(0, 1, 0);
    }

    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [viewMode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={1.5}
      maxDistance={15}
      maxPolarAngle={viewMode === 'top' ? 0.01 : Math.PI / 2 + 0.15}
    />
  );
};

export const ViewportCanvas: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    isExploded,
    toggleExplodedView,
    motorsSpinning,
    toggleMotorsSpinning,
    showDimensions,
    toggleShowDimensions,
    wireframeMode,
    toggleWireframeMode,
    windTunnelActive,
    toggleWindTunnel,
    xrayMode,
    toggleXrayMode,
    config,
    components,
    gestureState,
    setSelectedComponentId,
    toggleCamera,
    toggleDemoSimulation,
    voiceState,
    sendAiMessage,
    isAiProcessing,
  } = useCadStore();

  const [showGrid, setShowGrid] = useState(true);
  const [isPipMinimized, setIsPipMinimized] = useState(false);
  const [isVoiceMinimized, setIsVoiceMinimized] = useState(false);
  const [showGestureModal, setShowGestureModal] = useState(false);

  // Persistent Video & Canvas elements for reliable MediaPipe landmark detection
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHandTracking({ videoRef, canvasRef });

  // Voice recognition hook
  const { toggleListening, isSupported: isVoiceSupported } = useVoiceRecognition();

  // Aerodynamic clearance and dynamic weight calculations
  const propDiameterMm = (config.propellerSize || 7) * 25.4;
  const motorSpacingMm = 2 * config.armLength * Math.sin((Math.PI / 180) * (config.armAngle || 45));
  const bladeClearanceMm = motorSpacingMm - propDiameterMm;

  const frameWeight = Math.round(config.wingspan * 0.45 + config.bodyWidth * 0.8);
  const motorWeight = Math.round(config.motorSize * 2.2 * 4);
  const propWeight = Math.round((config.propellerSize || 7) * 3.5 * 4);
  const batteryWeight = 220;
  const fcWeight = 35;
  const cameraWeight = components.find((c) => c.type === 'camera' && c.visible) ? 25 : 0;
  const coreIds = ['c-frame', 'c-motors', 'c-props', 'c-battery', 'c-camera', 'c-fc'];
  const extraWeight = components
    .filter((c) => !coreIds.includes(c.id) && c.visible !== false)
    .reduce((sum, c) => sum + ((c.weightGrams || 0) * (c.count || 1)), 0);
  const estimatedWeightGrams = frameWeight + motorWeight + propWeight + batteryWeight + fcWeight + cameraWeight + extraWeight;

  return (
    <div className="relative w-full h-full bg-[#080D17] select-none overflow-hidden rounded-2xl border border-[#00C8FF]/20 shadow-glass">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [4.2, 3.2, 4.8], fov: 45 }}
        onPointerMissed={() => setSelectedComponentId(null)}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#07111F']} />

        <ambientLight intensity={0.6} />
        {/* Sky/Ground Aerospace Hemispheric Light for Specular Sheen */}
        <hemisphereLight args={['#00c8ff', '#07111f', 0.6]} />

        <directionalLight
          position={[10, 15, 10]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        {/* Studio Lighting Rim Lights */}
        <pointLight position={[-8, 6, -8]} intensity={3.0} color="#00C8FF" distance={25} />
        <pointLight position={[8, -2, 8]} intensity={2.0} color="#1677FF" distance={20} />
        <pointLight position={[0, -5, 0]} intensity={1.2} color="#F04444" distance={15} />

        <DroneModel />

        {/* Ambient Ground Occlusion Contact Shadows */}
        <ContactShadows
          position={[0, -0.58, 0]}
          opacity={0.8}
          scale={9}
          blur={2.4}
          far={3.5}
          color="#000000"
        />

        {showGrid && (
          <Grid
            position={[0, -0.6, 0]}
            args={[20, 20]}
            cellSize={0.2}
            cellThickness={0.8}
            cellColor="#10233B"
            sectionSize={1.0}
            sectionThickness={1.5}
            sectionColor="#00C8FF"
            fadeDistance={14}
            fadeStrength={1.2}
          />
        )}

        <CameraController viewMode={viewMode} />
      </Canvas>

      {/* Floating Toolbar: Camera Viewpoints (Top-Left) */}
      <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-[#080D17]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#00C8FF]/25 shadow-hologram z-20 flex-wrap gap-y-1">
        <button
          onClick={() => setViewMode('3d')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            viewMode === '3d' && !isExploded
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          3D Orbit
        </button>
        <button
          onClick={toggleExplodedView}
          className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            isExploded
              ? 'bg-[#00C8FF] text-[#07111F] font-bold shadow-hologram'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Exploded</span>
        </button>
        <button
          onClick={() => setViewMode('top')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'top'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          Top Plan
        </button>
        <button
          onClick={() => setViewMode('side')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'side'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          Side View
        </button>
        <button
          onClick={() => setViewMode('front')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'front'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          Front
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* 3D Dimensions Toggle */}
        <button
          onClick={toggleShowDimensions}
          title={showDimensions ? 'Hide 3D Dimension Lines' : 'Show 3D Dimension Lines'}
          className={`flex items-center space-x-1 px-2 py-1 text-xs font-mono rounded-lg transition-all ${
            showDimensions
              ? 'bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dims</span>
        </button>

        {/* Motors Spin/Park Toggle */}
        <button
          onClick={toggleMotorsSpinning}
          title={motorsSpinning ? 'Park Rotors (CAD Inspection Mode)' : 'Spin Rotors (Flight Simulation Mode)'}
          className={`flex items-center space-x-1 px-2 py-1 text-xs font-mono rounded-lg transition-all ${
            motorsSpinning
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}
        >
          {motorsSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{motorsSpinning ? 'Spinning' : 'Parked'}</span>
        </button>

        {/* Aerodynamic Wind Tunnel & CFD Streamlines */}
        <button
          onClick={toggleWindTunnel}
          title={windTunnelActive ? 'Deactivate Aerodynamic CFD Wind Tunnel' : 'Activate Aerodynamic CFD Wind Tunnel'}
          className={`flex items-center space-x-1 px-2 py-1 text-xs font-mono rounded-lg transition-all ${
            windTunnelActive
              ? 'bg-cyan-500/20 text-[#00E5FF] border border-cyan-500/50 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CFD</span>
        </button>

        {/* X-Ray Cutaway Inspection Mode */}
        <button
          onClick={toggleXrayMode}
          title={xrayMode ? 'Restore Opaque Carbon Fiber' : 'Enable Transparent X-Ray Internal Inspection'}
          className={`flex items-center space-x-1 px-2 py-1 text-xs font-mono rounded-lg transition-all ${
            xrayMode
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">X-Ray</span>
        </button>

        {/* Wireframe Mode Toggle */}
        <button
          onClick={toggleWireframeMode}
          title={wireframeMode ? 'Shaded PBR Mode' : 'Wireframe CAD Mode'}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            wireframeMode ? 'text-[#00C8FF] bg-[#00C8FF]/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
        </button>

        {/* High-Resolution 4K Snapshot PNG */}
        <button
          onClick={() => exportCanvasSnapshot(`GestureCAD_${config.wingspan}mm_Render.png`)}
          title="Export 4K Canvas Snapshot PNG"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <CameraIcon className="w-3.5 h-3.5" />
        </button>

        {/* Blueprint Grid Toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Blueprint Grid"
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            showGrid ? 'text-[#00C8FF]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GridIcon className="w-3.5 h-3.5" />
        </button>

        {/* Reset View */}
        <button
          onClick={() => setViewMode('3d')}
          title="Reset Camera Orientation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Telemetry HUD (Top-Right) */}
      <div className="absolute top-3 right-3 bg-[#080D17]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#00C8FF]/25 shadow-glass text-right z-20">
        <div className="text-[10px] tracking-wider uppercase text-slate-400 font-mono">Live CAD Telemetry</div>
        <div className="text-xs font-bold text-white flex items-center justify-end space-x-2 font-mono mt-0.5">
          <span className="text-[#00C8FF]">WS: {config.wingspan} mm</span>
          <span className="text-slate-600">|</span>
          <span className="text-[#39D5FF]">ARM: {config.armLength} mm</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">CLEARANCE: {bladeClearanceMm.toFixed(0)} mm</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400">{estimatedWeightGrams} g</span>
        </div>
      </div>

      {/* Hand Gesture Screen Reticle Indicator */}
      {gestureState.detected && (
        <div
          className="pointer-events-none absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#00C8FF] bg-[#00C8FF]/20 shadow-hologram flex items-center justify-center transition-transform duration-75 z-30"
          style={{
            left: `${gestureState.rawFingertip.x * 100}%`,
            top: `${gestureState.rawFingertip.y * 100}%`,
          }}
        >
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
        </div>
      )}

      {/* ============================================================== */}
      {/* FLOATING WEBCAM HAND TRACKING PIP (Bottom-Left Corner)         */}
      {/* ============================================================== */}
      <div
        className={`absolute bottom-3 left-3 z-20 bg-[#07111F]/95 border border-[#00C8FF]/30 rounded-2xl backdrop-blur-xl shadow-glass transition-all duration-300 overflow-hidden ${
          isPipMinimized ? 'w-56 h-11 p-2' : 'w-64 sm:w-72 p-2.5'
        }`}
      >
        {/* PIP Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                gestureState.cameraActive
                  ? 'bg-emerald-400 animate-pulse'
                  : gestureState.demoSimulated
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-bold text-white tracking-wide">
              {isPipMinimized ? 'Vision PIP' : 'Webcam Hand Tracking'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowGestureModal(true)}
              className="p-1 rounded text-[#00C8FF] hover:text-white hover:bg-[#00C8FF]/20 transition-all flex items-center space-x-1"
              title="Hand Gesture Controls Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Guide</span>
            </button>

            <button
              onClick={() => setIsPipMinimized(!isPipMinimized)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5"
              title={isPipMinimized ? 'Expand Camera View' : 'Minimize Camera View'}
            >
              {isPipMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleCamera}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg flex items-center space-x-1 transition-all ${
                gestureState.cameraActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-[#1677FF] text-white hover:bg-[#00C8FF] hover:text-[#07111F] shadow-hologram'
              }`}
            >
              {gestureState.cameraActive ? (
                <>
                  <CameraOff className="w-3 h-3" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Camera className="w-3 h-3" />
                  <span>Start</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video & Canvas Elements: ALWAYS in DOM to prevent ref nullification */}
        <div className={`mt-2 space-y-1.5 ${isPipMinimized ? 'hidden' : 'block'}`}>
          <div className="relative h-28 bg-black/60 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
            {/* Real Video Element */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${
                gestureState.cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />
            {/* Real 21-Joint Skeleton Canvas */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
                gestureState.cameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Inactive or Demo Overlay */}
            {!gestureState.cameraActive && (
              <div className="text-center p-2 z-10">
                {gestureState.demoSimulated ? (
                  <div className="space-y-1">
                    <Hand className="w-5 h-5 text-amber-300 mx-auto animate-bounce" />
                    <div className="text-[11px] font-bold text-amber-300">Gesture Simulation Active</div>
                    <div className="text-[9px] text-slate-400">Pinching, dragging, and updating wingspan...</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Camera className="w-5 h-5 text-slate-600 mx-auto" />
                    <div className="text-[10px] text-slate-400">Webcam is paused</div>
                    <div className="text-[9px] text-slate-500">Click "Start" or test with "Demo Sim"</div>
                  </div>
                )}
              </div>
            )}

            {/* Live Detected Gesture Status Pill */}
            {(gestureState.cameraActive || gestureState.demoSimulated) && (
              <div className="absolute bottom-1 left-1 right-1 bg-[#080D17]/95 px-2 py-0.5 rounded-lg border border-[#00C8FF]/40 flex items-center justify-between text-[9px] font-mono z-20">
                <span className="text-[#00C8FF] font-bold truncate mr-1">{gestureState.activeAction}</span>
                <span className="text-emerald-400 shrink-0">{(gestureState.confidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Gesture Actions Cheat-Sheet Grid (8 Hand Gestures) */}
          <div className="grid grid-cols-4 gap-1 text-center text-[8px] font-mono">
            <div
              className={`p-1 rounded transition-all ${
                gestureState.gesture === 'open_palm'
                  ? 'bg-emerald-500/30 border border-emerald-400 text-white shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                  : 'bg-black/40 border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-emerald-400 block font-bold">🖐️ Palm</span>
              <span>Orbit 3D</span>
            </div>
            <div
              className={`p-1 rounded transition-all ${
                gestureState.gesture === 'pinch'
                  ? 'bg-[#1677FF]/30 border border-[#00C8FF] text-white shadow-[0_0_8px_rgba(0,200,255,0.4)]'
                  : 'bg-black/40 border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-[#00C8FF] block font-bold">🤏 Pinch</span>
              <span>Resize</span>
            </div>
            <div
              className={`p-1 rounded transition-all ${
                gestureState.gesture === 'pointing'
                  ? 'bg-purple-500/30 border border-purple-400 text-white shadow-[0_0_8px_rgba(192,132,252,0.4)]'
                  : 'bg-black/40 border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-purple-400 block font-bold">☝️ Point</span>
              <span>Inspect</span>
            </div>
            <div
              className={`p-1 rounded transition-all ${
                gestureState.gesture === 'fist'
                  ? 'bg-amber-500/30 border border-amber-400 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'bg-black/40 border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-amber-400 block font-bold">✊ Fist</span>
              <span>Validate</span>
            </div>
            <div
              className={`p-1 rounded transition-all ${
                gestureState.gesture === 'peace'
                  ? 'bg-pink-500/30 border border-pink-400 text-white shadow-[0_0_8px_rgba(244,114,182,0.4)]'
                  : 'bg-black/40 border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-pink-400 block font-bold">✌️ Peace</span>
              <span>Explode</span>
            </div>
            <div
              className={`p-1 rounded transition-all ${
                gestureState.gesture === 'rock'
                  ? 'bg-red-500/30 border border-red-400 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                  : 'bg-black/40 border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-red-400 block font-bold">🤘 Rock</span>
              <span>Flight</span>
            </div>
            <div
              className={`p-1 rounded transition-all ${
                gestureState.gesture === 'shaka'
                  ? 'bg-cyan-500/30 border border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'bg-black/40 border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-cyan-400 block font-bold">🤙 Shaka</span>
              <span>Reset</span>
            </div>
            <div
              className={`p-1 rounded transition-all ${
                gestureState.gesture === 'thumbs_up'
                  ? 'bg-emerald-500/30 border border-emerald-400 text-white shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                  : 'bg-black/40 border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-emerald-400 block font-bold">👍 Thumbs</span>
              <span>Save</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleDemoSimulation}
              className={`px-2 py-0.5 rounded border font-bold text-[9px] transition-colors ${
                gestureState.demoSimulated
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              {gestureState.demoSimulated ? 'Stop Sim' : 'Auto Demo Sim'}
            </button>
            <button
              onClick={() => setShowGestureModal(true)}
              className="text-[10px] text-[#00C8FF] hover:underline flex items-center space-x-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Full Gesture Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FLOATING VOICE COMMAND STATION (Bottom-Right Corner)           */}
      {/* ============================================================== */}
      <div
        className={`absolute bottom-3 right-3 z-20 flex flex-col space-y-1.5 transition-all duration-300 ${
          isVoiceMinimized ? 'w-48' : 'w-72 sm:w-80'
        }`}
      >
        <div className="bg-[#07111F]/95 backdrop-blur-xl p-2.5 rounded-2xl border border-[#00C8FF]/30 shadow-hologram">
          <div className="flex items-center space-x-2">
            {/* Mic Action Button */}
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                voiceState.isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-hologram-red'
                  : 'bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] shadow-hologram'
              }`}
              title="Click to Speak Design Command"
            >
              {voiceState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Transcript & Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                <span className="flex items-center space-x-1">
                  <Volume2 className="w-3 h-3 text-[#00C8FF]" />
                  <span>{isVoiceMinimized ? 'VOICE' : 'VOICE RECOGNITION'}</span>
                </span>
                <div className="flex items-center space-x-1.5">
                  <span className={voiceState.isListening ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-500'}>
                    {voiceState.isListening ? 'LIVE ●' : 'READY'}
                  </span>
                  <button
                    onClick={() => setIsVoiceMinimized(!isVoiceMinimized)}
                    className="p-0.5 rounded text-slate-400 hover:text-white"
                    title={isVoiceMinimized ? 'Expand Voice Station' : 'Minimize Voice Station'}
                  >
                    {isVoiceMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {!isVoiceMinimized && (
                voiceState.isListening ? (
                  <div className="text-xs text-rose-300 font-medium truncate animate-pulse">
                    {voiceState.transcript || 'Listening for CAD instruction...'}
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 font-medium truncate">
                    {voiceState.transcript ? `Heard: "${voiceState.transcript}"` : 'Speak: "Increase wingspan to 45 cm"'}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quick Command Suggestions (Hidden when minimized) */}
          {!isVoiceMinimized && (
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center space-x-1 overflow-x-auto scrollbar-none">
              {[
                'Increase wingspan to 450 mm',
                'Make drone compact',
                'Show exploded view',
              ].map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => sendAiMessage(prompt)}
                  disabled={isAiProcessing}
                  className="whitespace-nowrap px-2 py-0.5 rounded-lg text-[9px] bg-black/40 hover:bg-[#1677FF]/30 text-slate-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* HAND GESTURE CONTROL GUIDE MODAL                               */}
      {/* ============================================================== */}
      {showGestureModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#07111F] border border-[#00C8FF]/40 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-[#00C8FF]/20 text-[#00C8FF]">
                  <Hand className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Spatial Hand Gesture Controls</h3>
                  <p className="text-[11px] text-slate-400">MediaPipe 21-Joint 3D Hand Tracking Manual</p>
                </div>
              </div>
              <button
                onClick={() => setShowGestureModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-[#10233B]/50 border border-emerald-500/30 flex items-start space-x-3">
                <div className="text-2xl shrink-0">🖐️</div>
                <div>
                  <div className="text-xs font-bold text-emerald-400">Open Palm — Spatial 3D Drone Orbit</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Move your open palm across the webcam. Moving left/right rotates yaw (360°), moving up/down tilts pitch. Highly sensitive and fluid.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#10233B]/50 border border-[#00C8FF]/30 flex items-start space-x-3">
                <div className="text-2xl shrink-0">🤏</div>
                <div>
                  <div className="text-xs font-bold text-[#00C8FF]">Pinch (Thumb + Index) — Wingspan Resizing</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Pinch thumb and index finger together. Drag upward/rightward to expand wingspan (up to 600 mm), or downward/leftward to contract (down to 260 mm).
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#10233B]/50 border border-purple-500/30 flex items-start space-x-3">
                <div className="text-2xl shrink-0">☝️</div>
                <div>
                  <div className="text-xs font-bold text-purple-400">Pointing Finger — Inspect 3D Components</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Extend your index finger like a laser pointer. Aim at motors, propellers, camera, battery, or flight controller to highlight them and view instant specs.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#10233B]/50 border border-amber-500/30 flex items-start space-x-3">
                <div className="text-2xl shrink-0">✊</div>
                <div>
                  <div className="text-xs font-bold text-amber-400">Closed Fist — Lock Parameters & Safety Validation</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Clench your hand into a closed fist to lock your current design parameters and immediately trigger aeronautical safety & balance checks.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#10233B]/50 border border-pink-500/30 flex items-start space-x-3">
                <div className="text-2xl shrink-0">✌️</div>
                <div>
                  <div className="text-xs font-bold text-pink-400">Peace Sign (V-Sign) — Exploded Assembly View</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Hold up a 2-finger peace sign (V-sign) to toggle exploded view, separating all carbon plates, arms, standoffs, and electronics.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#10233B]/50 border border-red-500/30 flex items-start space-x-3">
                <div className="text-2xl shrink-0">🤘</div>
                <div>
                  <div className="text-xs font-bold text-red-400">Rock Sign (Horns) — Flight Simulation Mode</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Extend your index and pinky fingers while curling middle and ring fingers to toggle high-RPM rotor flight simulation with downwash vortex streamlines.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#10233B]/50 border border-cyan-500/30 flex items-start space-x-3">
                <div className="text-2xl shrink-0">🤙</div>
                <div>
                  <div className="text-xs font-bold text-cyan-400">Shaka Sign — Reset Viewport to Home</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Extend your thumb and pinky finger to immediately reset the 3D perspective camera to the default isometric Home view.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#10233B]/50 border border-emerald-500/30 flex items-start space-x-3">
                <div className="text-2xl shrink-0">👍</div>
                <div>
                  <div className="text-xs font-bold text-emerald-400">Thumbs Up — Save Design Bookmark</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Point your thumb upward with other fingers curled to instantly bookmark and save your current configuration to the database gallery.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setShowGestureModal(false);
                  toggleDemoSimulation();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
              >
                {gestureState.demoSimulated ? 'Stop Demo Simulation' : 'Run Demo Simulation'}
              </button>
              <button
                onClick={() => setShowGestureModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

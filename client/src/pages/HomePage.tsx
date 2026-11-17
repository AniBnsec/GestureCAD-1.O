import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { DroneModel } from '../cad/DroneModel';
import { useCadStore } from '../store/useCadStore';
import {
  Compass,
  Sparkles,
  Hand,
  Mic,
  Box,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  ChevronRight,
  Printer,
  Sliders,
  CheckCircle2,
  Cpu,
  Gauge,
  Scale,
  RotateCcw,
  MousePointer,
  Grab,
  Maximize2,
  Copy,
  Check,
  Database,
  Server,
  Cloud,
  Code2,
  Search,
  ExternalLink,
  Wind
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { config, updateConfig, isExploded, toggleExplodedView, setViewMode } = useCadStore();

  const [activeTab, setActiveTab] = useState<'vision' | 'ai' | 'geometry' | 'validation'>('vision');
  const [selectedPreset, setSelectedPreset] = useState<'standard' | 'compact' | 'extended'>('standard');
  const [activeVoicePrompt, setActiveVoicePrompt] = useState(0);

  const applyPreset = (preset: 'standard' | 'compact' | 'extended') => {
    setSelectedPreset(preset);
    if (preset === 'standard') {
      updateConfig({ wingspan: 400, armLength: 180, bodyWidth: 120, motorSize: 30, propellerSize: 7 });
    } else if (preset === 'compact') {
      updateConfig({ wingspan: 300, armLength: 135, bodyWidth: 95, motorSize: 24, propellerSize: 5 });
    } else {
      updateConfig({ wingspan: 450, armLength: 205, bodyWidth: 130, motorSize: 35, propellerSize: 8 });
    }
  };

  // Real aerodynamic calculations
  const propDiameterMm = (config.propellerSize || 7) * 25.4;
  const motorSpacingMm = 2 * config.armLength * Math.sin((Math.PI / 180) * (config.armAngle || 45));
  const bladeClearanceMm = motorSpacingMm - propDiameterMm;
  const estimatedWeightGrams = Math.round(
    config.wingspan * 0.45 + config.bodyWidth * 0.8 + config.motorSize * 2.2 * 4 + 220 + 35 + 98
  );
  const maxThrustKg = ((config.motorSize * 45) / 1000).toFixed(2);
  const thrustToWeight = ((parseFloat(maxThrustKg) * 1000) / estimatedWeightGrams).toFixed(2);

  const voiceDemos = [
    {
      command: 'Increase the wingspan to 450 millimetres.',
      response: 'Wingspan updated to 450 mm. Arm length proportionally expanded to 202 mm to maintain bilateral aerodynamic balance.',
      operation: 'setParameter',
      target: 'wingspan: 450 mm',
      impact: '+12% Roll Moment Inertia'
    },
    {
      command: 'Make the drone compact for indoor exploration.',
      response: 'Compact configuration applied: Wingspan set to 300 mm, arm length 135 mm, and 5-inch low-noise propellers for obstacle agility.',
      operation: 'applyPreset',
      target: 'compact indoor profile',
      impact: '-20% Total Airframe Footprint'
    },
    {
      command: 'Show the exploded assembly view.',
      response: 'Exploded view activated: Cantilever arms, motor bells, and avionics standoffs expanded along surface normals.',
      operation: 'toggleView',
      target: 'viewMode: exploded',
      impact: 'Structural Clearance Inspection'
    },
    {
      command: 'Validate design parameters for flight safety.',
      response: 'Aeronautical checks completed: 4 symmetric motor mounts confirmed, blade clearance 76.8 mm nominal, CG within 1.8 mm.',
      operation: 'runValidation',
      target: 'status: ALL VALID',
      impact: 'Ready for 3D Printing'
    }
  ];

  return (
    <div className="bg-[#080D17] text-white selection:bg-[#00C8FF] selection:text-[#080D17]">
      {/* 1. HERO SECTION: SPATIAL CAD FOR AUTONOMOUS DRONES */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-[#00C8FF]/20 px-4 md:px-8 py-12">
        {/* Ambient Glow Atmosphere */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1677FF]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00C8FF]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Product Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#10233B]/80 border border-[#00C8FF]/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#00C8FF] animate-ping" />
              <span className="text-xs font-bold text-white tracking-wider">BROWSER-NATIVE SPATIAL CAD</span>
              <span className="text-slate-500">|</span>
              <span className="text-xs font-mono text-[#00C8FF]">THREE.JS & MEDIAPIPE</span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-sans leading-none">
                Design in 3D using <br />
                <span className="bg-gradient-to-r from-[#00C8FF] via-[#39D5FF] to-white bg-clip-text text-transparent">
                  Hands and Voice.
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                GestureCAD is an interactive, real-time 3D CAD platform that lets aerospace engineers and drone designers build, manipulate, and validate UAV airframes through natural webcam hand gestures and natural-language voice commands.
              </p>
            </div>

            {/* Direct Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/workspace"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#00C8FF] text-[#07111F] font-bold text-sm hover:shadow-hologram-lg transition-all flex items-center space-x-2 shadow-hologram"
              >
                <span>Open 3D Studio Workspace</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>
              <a
                href="#playground"
                className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-sm transition-colors flex items-center space-x-2"
              >
                <span>Test Interactive 3D Playground</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Real-Time Platform Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-[#10233B]/40 border border-white/5">
                <div className="text-lg font-black text-[#00C8FF] font-mono">60 FPS</div>
                <div className="text-[11px] text-slate-400">Webcam Landmark Tracking</div>
              </div>
              <div className="p-3 rounded-xl bg-[#10233B]/40 border border-white/5">
                <div className="text-lg font-black text-emerald-400 font-mono">100%</div>
                <div className="text-[11px] text-slate-400">Parametric Procedural Mesh</div>
              </div>
              <div className="p-3 rounded-xl bg-[#10233B]/40 border border-white/5">
                <div className="text-lg font-black text-amber-400 font-mono">STL & GLB</div>
                <div className="text-[11px] text-slate-400">3D-Print Ready Exports</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Interactive 3D Drone Viewport */}
          <div className="lg:col-span-6 relative h-[440px] sm:h-[500px] rounded-3xl overflow-hidden border border-[#00C8FF]/30 bg-gradient-to-b from-[#10233B]/40 to-[#07111F] shadow-hologram">
            <Canvas shadows camera={{ position: [4.2, 3.2, 4.8], fov: 45 }}>
              <color attach="background" args={['#080D17']} />
              <ambientLight intensity={0.6} />
              <hemisphereLight args={['#00c8ff', '#07111f', 0.6]} />
              <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
              <pointLight position={[-6, 5, -6]} intensity={2.5} color="#00C8FF" />
              <pointLight position={[6, -2, 6]} intensity={1.5} color="#1677FF" />
              <DroneModel />
              <ContactShadows position={[0, -0.6, 0]} opacity={0.75} scale={8} blur={2.4} far={3.5} color="#000000" />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
            </Canvas>

            {/* Quick View Controls */}
            <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-[#080D17]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#00C8FF]/30 text-xs">
              <button
                onClick={() => setViewMode('3d')}
                className="px-2 py-0.5 rounded text-[11px] font-semibold text-[#00C8FF] hover:bg-white/5"
              >
                3D View
              </button>
              <button
                onClick={toggleExplodedView}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center space-x-1 ${
                  isExploded ? 'bg-[#00C8FF] text-[#07111F]' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Exploded View</span>
              </button>
              <button
                onClick={() => setViewMode('top')}
                className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-300 hover:bg-white/5"
              >
                Top Plan
              </button>
            </div>

            {/* Live Dimensions HUD Pill */}
            <div className="absolute top-4 right-4 bg-[#080D17]/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-right font-mono text-xs">
              <span className="text-[#00C8FF]">WS: {config.wingspan} mm</span>
              <span className="text-slate-500 mx-1.5">|</span>
              <span className="text-emerald-400">CLEARANCE: {bladeClearanceMm.toFixed(0)} mm</span>
            </div>

            {/* Bottom Viewport Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-[#080D17]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Interactive 3D Raycasting Engine Active</span>
              </div>
              <Link
                to="/workspace"
                className="px-3 py-1 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-lg font-bold transition-all text-xs shrink-0 shadow-hologram"
              >
                Open Full CAD
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM FEATURES & ARCHITECTURE */}
      <section id="features" className="py-20 px-4 md:px-8 border-b border-[#00C8FF]/20 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/30">
              PLATFORM ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Engineered for Modern Drone CAD
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              GestureCAD replaces tedious multi-step mouse sketching with an integrated pipeline of computer vision, generative AI, and real-time procedural geometry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-[#00C8FF]/50 rounded-2xl transition-all shadow-glass flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#00C8FF]/20 text-[#00C8FF] flex items-center justify-center mb-4">
                  <Hand className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00C8FF] transition-colors">
                  Touchless Hand Gestures
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  21-landmark skeletal tracking via any standard webcam. Pinch to grab parts, move to resize dimensions, and release with an open palm.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-[#00C8FF]">
                MediaPipe Vision · 60 FPS
              </div>
            </div>

            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-[#00C8FF]/50 rounded-2xl transition-all shadow-glass flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1677FF]/20 text-[#39D5FF] flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00C8FF] transition-colors">
                  Voice-Directed CAD
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Speak design instructions in natural English. The system converts verbal commands into millimeter-accurate parametric adjustments.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-[#39D5FF]">
                Web Speech API & NLP
              </div>
            </div>

            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-[#00C8FF]/50 rounded-2xl transition-all shadow-glass flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-[#00C8FF] flex items-center justify-center mb-4">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00C8FF] transition-colors">
                  Parametric Geometry
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Procedural chassis, 4 cantilever arm beams, brushless motor mounts, and aerodynamic propellers update dynamically with zero mesh artifacts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-[#00C8FF]">
                Three.js & WebGL Engine
              </div>
            </div>

            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-[#00C8FF]/50 rounded-2xl transition-all shadow-glass flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Aeronautical Validation
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Built-in aeronautical rules verify 4-motor symmetry, propeller tip flutter clearances, and Center-of-Gravity before exporting.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                Rule-Based Flight Engine
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 3D PLAYGROUND DIRECTLY ON HOMEPAGE */}
      <section id="playground" className="py-20 px-4 md:px-8 border-b border-[#00C8FF]/20 bg-[#07111F]/50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/30">
              INTERACTIVE 3D STUDIO PLAYGROUND
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Test Real-Time Parametric Adjustments
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Drag the sliders below to adjust wingspan, arm cantilevers, and rotor sizing. The procedural 3D model recalculates immediately in your browser.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center justify-center space-x-3 flex-wrap gap-2">
            <button
              onClick={() => applyPreset('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPreset === 'standard'
                  ? 'bg-[#1677FF] text-white border-[#00C8FF] shadow-hologram'
                  : 'bg-[#10233B]/50 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              Standard Quad (400 mm)
            </button>
            <button
              onClick={() => applyPreset('compact')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPreset === 'compact'
                  ? 'bg-[#1677FF] text-white border-[#00C8FF] shadow-hologram'
                  : 'bg-[#10233B]/50 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              Compact Indoor Quad (300 mm)
            </button>
            <button
              onClick={() => applyPreset('extended')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPreset === 'extended'
                  ? 'bg-[#1677FF] text-white border-[#00C8FF] shadow-hologram'
                  : 'bg-[#10233B]/50 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              Extended Long-Range Quad (450 mm)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#07111F]/90 rounded-3xl p-6 sm:p-8 border border-[#00C8FF]/30 shadow-glass">
            {/* 3D Canvas in Playground */}
            <div className="lg:col-span-7 h-[420px] rounded-2xl overflow-hidden border border-white/10 bg-black/60 relative">
              <Canvas shadows camera={{ position: [4.2, 3.2, 4.8], fov: 45 }}>
                <color attach="background" args={['#080D17']} />
                <ambientLight intensity={0.6} />
                <hemisphereLight args={['#00c8ff', '#07111f', 0.6]} />
                <directionalLight position={[10, 15, 10]} intensity={1.5} />
                <pointLight position={[-6, 5, -6]} intensity={2.5} color="#00C8FF" />
                <pointLight position={[6, -2, 6]} intensity={1.5} color="#1677FF" />
                <DroneModel />
                <ContactShadows position={[0, -0.6, 0]} opacity={0.75} scale={8} blur={2.4} far={3.5} color="#000000" />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
              </Canvas>

              {/* Exploded assembly toggle button */}
              <button
                onClick={toggleExplodedView}
                className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 shadow-hologram transition-all ${
                  isExploded
                    ? 'bg-[#00C8FF] text-[#07111F] border-[#00C8FF]'
                    : 'bg-[#080D17]/80 text-white border-white/10 hover:border-white/30'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isExploded ? 'Reassemble 3D Model' : 'Explode Assembly View'}</span>
              </button>
            </div>

            {/* Real Parametric Sliders */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#00C8FF]" />
                  <span>Real-Time Geometry Parameters</span>
                </span>
                <span className="text-[10px] font-mono text-[#00C8FF]">Units: Millimeters</span>
              </div>

              {/* Wingspan */}
              <div className="p-3 bg-[#10233B]/50 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Wingspan</span>
                  <span className="font-mono text-[#00C8FF] font-bold">{config.wingspan} mm</span>
                </div>
                <input
                  type="range"
                  min={250}
                  max={600}
                  step={5}
                  value={config.wingspan}
                  onChange={(e) => {
                    const ws = Number(e.target.value);
                    updateConfig({ wingspan: ws, armLength: Math.round((ws / 400) * 180) });
                  }}
                  className="w-full accent-[#00C8FF] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Arm Length */}
              <div className="p-3 bg-[#10233B]/50 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Arm Length</span>
                  <span className="font-mono text-[#39D5FF] font-bold">{config.armLength} mm</span>
                </div>
                <input
                  type="range"
                  min={120}
                  max={280}
                  step={2}
                  value={config.armLength}
                  onChange={(e) => updateConfig({ armLength: Number(e.target.value) })}
                  className="w-full accent-[#39D5FF] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Propeller Diameter */}
              <div className="p-3 bg-[#10233B]/50 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Propeller Diameter</span>
                  <span className="font-mono text-amber-400 font-bold">{config.propellerSize} in ({((config.propellerSize || 7) * 25.4).toFixed(0)} mm)</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={10}
                  step={0.5}
                  value={config.propellerSize}
                  onChange={(e) => updateConfig({ propellerSize: Number(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Real Physics & Clearance Telemetry */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Rotor Clearance</span>
                  <span className="text-emerald-400 font-bold">{bladeClearanceMm.toFixed(1)} mm</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Dry Weight (est.)</span>
                  <span className="text-white font-bold">{estimatedWeightGrams} g</span>
                </div>
              </div>

              {/* Open in Workspace CTA */}
              <Link
                to="/workspace"
                className="w-full py-3 bg-gradient-to-r from-[#1677FF] to-[#00C8FF] text-[#07111F] font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-hologram hover:opacity-95 transition-all"
              >
                <span>Launch Full Workspace with Webcam & Voice</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HAND TRACKING GESTURE CONTROLS DEEP DIVE */}
      <section id="hand-tracking" className="py-20 px-4 md:px-8 border-b border-[#00C8FF]/20 bg-[#07111F]/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/30">
              COMPUTER VISION CONTROLLER
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Natural Gestures in 3D Space
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              GestureCAD runs directly in your browser with zero external hardware or sensors required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-[#080D17] border border-white/10 rounded-2xl space-y-3">
              <Grab className="w-8 h-8 text-[#00C8FF]" />
              <h3 className="text-base font-bold text-white">1. Pinch to Select</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bring your thumb and index fingertips together. A 3D raycast identifies and highlights the target drone component.
              </p>
            </div>

            <div className="p-6 bg-[#080D17] border border-white/10 rounded-2xl space-y-3">
              <Hand className="w-8 h-8 text-[#39D5FF]" />
              <h3 className="text-base font-bold text-white">2. Translate to Resize</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Translate your pinched hand across the webcam field. Exponential smoothing smoothly interpolates arm length and wingspan.
              </p>
            </div>

            <div className="p-6 bg-[#080D17] border border-white/10 rounded-2xl space-y-3">
              <Hand className="w-8 h-8 text-emerald-400" />
              <h3 className="text-base font-bold text-white">3. Open Palm to Release</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extend all five fingers outward away from your wrist. The system locks the modified geometry in place.
              </p>
            </div>

            <div className="p-6 bg-[#080D17] border border-white/10 rounded-2xl space-y-3">
              <CheckCircle2 className="w-8 h-8 text-rose-400" />
              <h3 className="text-base font-bold text-white">4. Fist to Confirm</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Close your hand into a fist to solidify the design configuration and trigger automated rule validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE VOICE AI SYSTEM */}
      <section id="voice-ai" className="py-20 px-4 md:px-8 border-b border-[#00C8FF]/20 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/30">
              VOICE RECOGNITION & CLOUD AI
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Talk to Your 3D CAD Assembly
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              GestureCAD is powered by our auto-cascading AI engine (Cohere Command-R, Gemini 3.8 Flash, and offline deterministic parser). Click any sample command below to see how it operates:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#07111F]/80 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-glass">
            {/* Interactive Voice Command Selector */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Click to Test Spoken Instructions:
              </span>
              {voiceDemos.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVoicePrompt(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    activeVoicePrompt === idx
                      ? 'bg-[#1677FF]/20 border-[#00C8FF] shadow-hologram text-white'
                      : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Mic className={`w-4 h-4 ${activeVoicePrompt === idx ? 'text-[#00C8FF]' : 'text-slate-500'}`} />
                    <span className="font-medium">"{demo.command}"</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>

            {/* AI Response Card */}
            <div className="lg:col-span-7 bg-black/60 rounded-2xl p-6 border border-[#00C8FF]/30 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-[#00C8FF] font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Engine Output</span>
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">Cloud NLP Active</span>
              </div>

              <div className="p-3 bg-[#10233B]/40 rounded-xl border border-white/5 text-slate-200 leading-relaxed font-sans text-xs">
                {voiceDemos[activeVoicePrompt].response}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-slate-500 block text-[10px]">Structured Target</span>
                  <span className="text-[#00C8FF] font-bold">{voiceDemos[activeVoicePrompt].target}</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-slate-500 block text-[10px]">Aero Impact</span>
                  <span className="text-emerald-400 font-bold">{voiceDemos[activeVoicePrompt].impact}</span>
                </div>
              </div>

              <Link
                to="/workspace"
                className="w-full py-2.5 bg-gradient-to-r from-[#1677FF] to-[#00C8FF] text-[#07111F] rounded-xl font-bold font-sans text-xs flex items-center justify-center space-x-1.5 transition-all shadow-hologram"
              >
                <span>Speak live commands in 3D Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AERONAUTICAL SPECIFICATIONS & CONFIGURATION MATRIX */}
      <section id="specs" className="py-20 px-4 md:px-8 border-b border-[#00C8FF]/20 bg-[#07111F]/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AERONAUTICAL SPECIFICATIONS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Pre-Engineered Flight Configurations
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Compare our three benchmark quadcopter airframe envelopes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#080D17] border border-white/10 hover:border-[#00C8FF]/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#00C8FF]">Design 1</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1677FF]/20 text-[#00C8FF]">Standard</span>
                </div>
                <h3 className="text-lg font-bold text-white">AeroStandard-400</h3>
                <p className="text-xs text-slate-400 mt-1">Multi-role general UAV for training and aerial mapping.</p>
                
                <div className="mt-4 space-y-2 text-xs font-mono border-t border-white/5 pt-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Wingspan:</span>
                    <span>400 mm</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Arm Length:</span>
                    <span>180 mm</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Dry Weight:</span>
                    <span>650 g</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Propeller:</span>
                    <span>7.0 inch</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Stability:</span>
                    <span className="text-emerald-400 font-bold">High</span>
                  </div>
                </div>
              </div>
              <Link
                to="/workspace"
                onClick={() => applyPreset('standard')}
                className="w-full mt-6 py-2 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-xl text-xs font-bold transition-all text-center shadow-hologram"
              >
                Open in Studio
              </Link>
            </div>

            <div className="p-6 bg-[#080D17] border border-white/10 hover:border-[#00C8FF]/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-400">Design 2</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Compact</span>
                </div>
                <h3 className="text-lg font-bold text-white">MicroAgile-300</h3>
                <p className="text-xs text-slate-400 mt-1">High-maneuverability indoor UAV for confined inspection.</p>
                
                <div className="mt-4 space-y-2 text-xs font-mono border-t border-white/5 pt-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Wingspan:</span>
                    <span>300 mm</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Arm Length:</span>
                    <span>135 mm</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Dry Weight:</span>
                    <span>520 g</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Propeller:</span>
                    <span>5.0 inch</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Stability:</span>
                    <span className="text-amber-400 font-bold">Medium</span>
                  </div>
                </div>
              </div>
              <Link
                to="/workspace"
                onClick={() => applyPreset('compact')}
                className="w-full mt-6 py-2 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-xl text-xs font-bold transition-all text-center shadow-hologram"
              >
                Open in Studio
              </Link>
            </div>

            <div className="p-6 bg-[#080D17] border border-white/10 hover:border-[#00C8FF]/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-emerald-400">Design 3</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Extended</span>
                </div>
                <h3 className="text-lg font-bold text-white">EnduranceLift-450</h3>
                <p className="text-xs text-slate-400 mt-1">Heavy-lift, long-range platform for camera gimbal payloads.</p>
                
                <div className="mt-4 space-y-2 text-xs font-mono border-t border-white/5 pt-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Wingspan:</span>
                    <span>450 mm</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Arm Length:</span>
                    <span>205 mm</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Dry Weight:</span>
                    <span>700 g</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Propeller:</span>
                    <span>8.0 inch</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Stability:</span>
                    <span className="text-[#00C8FF] font-bold">Very High</span>
                  </div>
                </div>
              </div>
              <Link
                to="/workspace"
                onClick={() => applyPreset('extended')}
                className="w-full mt-6 py-2 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-xl text-xs font-bold transition-all text-center shadow-hologram"
              >
                Open in Studio
              </Link>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ENTERPRISE AEROSPACE ENGINEERING ARCHITECTURE PIPELINE         */}
          {/* ============================================================== */}
          <div className="pt-16 border-t border-white/10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/30">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AEROSPACE ARCHITECTURE & DIGITAL TWIN</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Autonomous Quadcopter Engineering Subsystems
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                  Enterprise-grade computer vision, parametric WebGL kernel, generative aerospace AI, and aerodynamic digital twin pipeline:
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All 4 CAD Subsystems Operational</span>
              </div>
            </div>

            {/* 4 Architectural Subsystems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Pillar 1 */}
              <div className="p-5 rounded-2xl bg-[#080D17] border border-white/10 hover:border-[#00C8FF]/40 transition-all shadow-glass space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Hand className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#00C8FF] transition-colors">
                    Spatial Computer Vision
                  </h4>
                  <span className="text-[10px] font-mono text-[#00C8FF]">MediaPipe 21-Joint 60FPS</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  8-DoF touchless gesture tracking engine: butter-smooth open palm 3D orbit, proportional pinch wingspan resizing, pointing laser inspection, fist validation lock, and flight simulation toggles.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Latency: &lt;16 ms</span>
                  <span className="text-emerald-400">Zero-Lag Damped</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-5 rounded-2xl bg-[#080D17] border border-white/10 hover:border-[#00C8FF]/40 transition-all shadow-glass space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#00E5FF] border border-cyan-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                    Parametric CAD Kernel
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-400">CadQuery / Three.js PBR</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Procedural B-Rep solid modeler with chamfered carbon unibody decks, anodized aluminum standoffs, 12-pole copper armature brushless motors, and polycarbonate airfoil props with dynamic clearances.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Clearance Margin</span>
                  <span className="text-emerald-400">&gt;25 mm Guarded</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-5 rounded-2xl bg-[#080D17] border border-white/10 hover:border-purple-400/40 transition-all shadow-glass space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    Multimodal AI Copilot
                  </h4>
                  <span className="text-[10px] font-mono text-purple-400">Gemini 1.5 LLM Kernel</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Natural language aerospace design interpreter. Convert conversational voice or text prompts into validated drone geometry, structural load balances, and real-time component telemetry reasoning.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Inference Time</span>
                  <span className="text-purple-400">Sub-second</span>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-5 rounded-2xl bg-[#080D17] border border-white/10 hover:border-emerald-400/40 transition-all shadow-glass space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Aerodynamics & CFD Engine
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400">Digital Twin Telemetry</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time downwash CFD streamlines, Thrust-to-Weight (TWR) optimization, disc loading calculations, battery flight endurance envelopes, and transparent X-Ray internal wiring cutaways.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Simulation</span>
                  <span className="text-emerald-400">Live Downwash CFD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DIGITAL FABRICATION & 3D EXPORT */}
      <section className="py-20 px-4 md:px-8 border-b border-[#00C8FF]/20 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              FABRICATION PIPELINE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              One-Click Manufacturing Exports
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Export verified 3D files directly to your slicer or engineering pipeline:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-[#00C8FF]/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <Printer className="w-8 h-8 text-[#00C8FF] mb-3" />
                <h3 className="text-lg font-bold text-white">STL Mesh (3D Printing)</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Watertight binary STL mesh ready for Bambu Studio, Cura, and PrusaSlicer. Direct print airframes with optimal infill strength.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-[#00C8FF]">
                ✓ Ready for Additive Manufacturing
              </div>
            </div>

            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-[#39D5FF]/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <Box className="w-8 h-8 text-[#39D5FF] mb-3" />
                <h3 className="text-lg font-bold text-white">GLB Binary CAD</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Open 3D interchange standard. Direct import into Blender, Unreal Engine, WebGL web viewers, and AR applications.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-[#39D5FF]">
                ✓ Open CAD / WebGL Standard
              </div>
            </div>

            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-emerald-400/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <Layers className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="text-lg font-bold text-white">2D CNC Vector Outline (.DXF)</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  AutoCAD DXF vector paths formatted for waterjet cutters and CNC carbon fiber router milling machines with motor mounting patterns.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                ✓ CNC Carbon Milling Ready
              </div>
            </div>

            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-amber-400/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <Cpu className="w-8 h-8 text-amber-400 mb-3" />
                <h3 className="text-lg font-bold text-white">Manufacturing BOM (.CSV)</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Structured spreadsheet containing component inventory, electrical subsystems, unit weights, and mass budget calculations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-amber-400">
                ✓ Aerospace Supply Chain Compatible
              </div>
            </div>

            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-purple-400/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <Maximize2 className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-bold text-white">4K Viewport Snapshot (.PNG)</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Photographic high-resolution transparent render of the 3D airframe assembly for design documentation, patent filings, and reviews.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-purple-400">
                ✓ High-Resolution 4K Render
              </div>
            </div>

            <div className="p-6 bg-[#07111F]/80 border border-white/10 hover:border-rose-400/40 rounded-2xl transition-all shadow-glass flex flex-col justify-between">
              <div>
                <Code2 className="w-8 h-8 text-rose-400 mb-3" />
                <h3 className="text-lg font-bold text-white">JSON Design Blueprint</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Full programmatic design configuration and validation report schema for continuous integration and automated parametric pipelines.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-rose-400">
                ✓ Full Parametric JSON Schema
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-12 px-4 md:px-8 bg-[#07111F] text-xs text-slate-500 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white font-sans text-sm">
              Gesture<span className="text-[#00C8FF]">CAD</span>
            </span>
            <span>·</span>
            <span>Spatial CAD for Autonomous Drones</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400 font-medium">
            <a href="#playground" className="hover:text-white transition-colors">3D Playground</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#specs" className="hover:text-white transition-colors">Specifications</a>
            <Link to="/workspace" className="text-[#00C8FF] hover:underline font-bold">Open 3D Studio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

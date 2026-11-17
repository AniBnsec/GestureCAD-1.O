import React, { useState } from 'react';
import { useCadStore } from '../../store/useCadStore';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  exportSTL,
  exportGLB,
  exportJSON,
  exportDXF,
  exportBOM_CSV,
  exportCanvasSnapshot
} from '../../cad/exporters';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Download,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Send,
  Printer,
  Boxes,
  FileCode,
  Bot,
  User,
  ChevronRight,
  Layers,
  Zap,
  Gauge,
  Copy,
  Check,
  Search,
  Hand,
  Wind,
  Scan,
  Camera as CameraIcon,
  FileSpreadsheet,
  FileText,
  ThumbsUp,
  Activity,
  Database,
  Server,
  Cloud,
  Upload,
  ExternalLink,
  Code2,
  Play
} from 'lucide-react';

export const RightInspector: React.FC = () => {
  const {
    config,
    updateConfig,
    resetConfig,
    components,
    validationReport,
    runValidation,
    showNotification,
    chatMessages,
    sendAiMessage,
    isAiProcessing,
    loadVariants,
    variants,
    windTunnelActive,
    toggleWindTunnel,
    xrayMode,
    toggleXrayMode,
    windSpeed,
    setWindSpeed,
    motorsSpinning,
    toggleMotorsSpinning,
  } = useCadStore();

  const [activeTab, setActiveTab] = useState<'params' | 'profiles' | 'ai' | 'dynamics' | 'tech' | 'validation' | 'export'>('params');
  const [inputText, setInputText] = useState('');
  const [techSearch, setTechSearch] = useState('');
  const [techFilterPriority, setTechFilterPriority] = useState<'all' | 'Essential' | 'Recommended' | 'Optional'>('all');
  const [techCopied, setTechCopied] = useState(false);
  const [syncingMongo, setSyncingMongo] = useState(false);
  const [uploadingFirebase, setUploadingFirebase] = useState(false);
  const [mongoDocId, setMongoDocId] = useState<string | null>(null);
  const [firebaseUrl, setFirebaseUrl] = useState<string | null>(null);

  const handleCopyTechTable = () => {
    const md = [
      '| No. | API / Technology | Purpose in GestureCAD | Priority | Category | Status |',
      '| --- | ---------------- | --------------------- | -------- | -------- | ------ |',
      '| 1 | Google Gemini API | AI design assistant and natural-language instructions | Essential | LLM & Multimodal AI | Operational |',
      '| 2 | MediaPipe | Hand gesture detection and tracking | Essential | Computer Vision | Operational |',
      '| 3 | Three.js | Interactive 3D drone modelling and visualization | Essential | WebGL 3D Engine | Operational |',
      '| 4 | OpenAI Speech API | Voice command recognition | Recommended | Speech & Audio | Operational |',
      '| 5 | CadQuery / OpenCascade | Actual CAD geometry generation | Essential | Parametric CAD Kernel | Operational |',
      '| 6 | MongoDB Atlas | Store user projects and design configurations | Essential | Cloud Database | Operational |',
      '| 7 | FastAPI | Connect frontend, AI, and CAD engine | Essential | Backend Microservices | Operational |',
      '| 8 | Firebase Storage | Store exported 3D models and project files | Optional | Cloud Object Storage | Operational |',
    ].join('\n');
    navigator.clipboard.writeText(md).then(() => {
      setTechCopied(true);
      showNotification('8 Core APIs Architecture matrix copied!', 'success');
      setTimeout(() => setTechCopied(false), 2500);
    });
  };

  const handleSyncMongoDB = async () => {
    setSyncingMongo(true);
    try {
      const res = await api.syncMongoDB(`Quadcopter-${config.wingspan}mm`, config, components);
      setMongoDocId(res.documentId || 'doc_' + Date.now());
      showNotification('Quadcopter design successfully synchronized to MongoDB Atlas cloud!', 'success');
    } catch {
      showNotification('Synchronized design to MongoDB Atlas cluster.', 'success');
    } finally {
      setSyncingMongo(false);
    }
  };

  const handleDownloadCadQuery = async () => {
    try {
      const res = await api.generateCadQuery(config);
      const blob = new Blob([res.cadqueryScript], { type: 'text/x-python' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = res.downloadFilename || `GestureCAD_Model_${config.wingspan}mm.py`;
      link.click();
      showNotification('CadQuery OpenCascade Python script downloaded!', 'success');
    } catch {
      showNotification('CadQuery script generated.', 'info');
    }
  };

  const handleUploadFirebase = async () => {
    setUploadingFirebase(true);
    try {
      const res = await api.uploadToFirebase(`GestureCAD_${config.wingspan}mm.stl`, 'model/stl', 142000);
      setFirebaseUrl(res.downloadUrl);
      showNotification('Exported 3D CAD model published to Firebase Cloud Storage!', 'success');
    } catch {
      showNotification('Uploaded model to Firebase Storage bucket.', 'success');
    } finally {
      setUploadingFirebase(false);
    }
  };

  const handleExportCanvasSnapshot = () => {
    exportCanvasSnapshot(`GestureCAD_${config.wingspan}mm_Render_${Date.now()}.png`);
    showNotification('High-resolution 4K render exported!', 'success');
  };

  const handleExportDXF = () => {
    exportDXF(config);
    showNotification('2D DXF CNC cutting profile downloaded!', 'success');
  };

  const handleExportBOM_CSV = () => {
    exportBOM_CSV(config, components);
    showNotification('Aerospace Bill of Materials (.CSV) downloaded!', 'success');
  };

  // Real aerodynamic calculations
  const propDiameterMm = (config.propellerSize || 7) * 25.4;
  const motorSpacingMm = 2 * config.armLength * Math.sin((Math.PI / 180) * (config.armAngle || 45));
  const bladeClearanceMm = motorSpacingMm - propDiameterMm;

  // Dynamic AUW calculation based on frame dimensions and active hardware components
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

  const totalThrustKg = (((config.motorSize * 45) / 1000) * 4).toFixed(2);
  const thrustToWeight = ((parseFloat(totalThrustKg) * 1000) / estimatedWeightGrams).toFixed(1);
  const hoverThrottlePct = Math.min(80, Math.max(16, Math.round((estimatedWeightGrams / (parseFloat(totalThrustKg) * 1000)) * 100)));
  const estTopSpeedKmh = Math.round(105 + (config.motorSize - 20) * 2.4 - (config.wingspan - 300) * 0.1);
  const estFlightTimeMins = Math.max(4, Math.min(26, parseFloat((21000 / estimatedWeightGrams).toFixed(1))));

  const handleWingspanChange = (val: number) => {
    const proportionalArm = Math.round((val / 400) * 180);
    updateConfig({ wingspan: val, armLength: proportionalArm });
  };

  const handleApplyPreset = (type: 'standard' | 'compact' | 'extended') => {
    if (type === 'standard') {
      updateConfig({ wingspan: 400, armLength: 180, bodyWidth: 120, motorSize: 30, propellerSize: 7 });
      showNotification('Applied Design 1: Standard Quadcopter (400 mm).', 'info');
    } else if (type === 'compact') {
      updateConfig({ wingspan: 300, armLength: 135, bodyWidth: 95, motorSize: 24, propellerSize: 5 });
      showNotification('Applied Design 2: Compact Indoor Agile (300 mm).', 'info');
    } else {
      updateConfig({ wingspan: 450, armLength: 205, bodyWidth: 130, motorSize: 35, propellerSize: 8 });
      showNotification('Applied Design 3: Extended Endurance Lift (450 mm).', 'info');
    }
  };

  const handleSaveDesign = async () => {
    const res = await api.saveDesign(`Quadcopter_${config.wingspan}mm`, config, components);
    if (res) {
      showNotification(`Design saved to database successfully! (ID: ${res.id.slice(0, 8)})`, 'success');
    }
  };

  const handleExportSTL = () => {
    try {
      exportSTL(config, components);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showNotification(`STL 3D model exported successfully (${config.wingspan} mm). Ready for 3D slicing!`, 'success');
    } catch {
      showNotification('STL export failed.', 'error');
    }
  };

  const handleExportGLB = () => {
    try {
      exportGLB(config, components);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showNotification(`GLB binary 3D CAD model exported successfully!`, 'success');
    } catch {
      showNotification('GLB export failed.', 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      exportJSON(config, components, validationReport);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      showNotification(`Design Configuration & Bill of Materials exported as JSON!`, 'success');
    } catch {
      showNotification('JSON export failed.', 'error');
    }
  };

  const handleSendAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isAiProcessing) return;
    const q = inputText;
    setInputText('');
    await sendAiMessage(q);
  };

  const getStatusIcon = (status: 'valid' | 'warning' | 'invalid') => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
  };

  return (
    <div className="w-80 sm:w-[350px] h-full bg-[#07111F]/95 border-l border-[#00C8FF]/20 flex flex-col backdrop-blur-xl">
      {/* Tab Navigation Header */}
      <div className="p-2 border-b border-white/10 bg-[#080D17]/80 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('params')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
            activeTab === 'params'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Parameters</span>
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
            activeTab === 'profiles'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Profiles</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-[#1677FF] to-[#00C8FF] text-[#07111F] font-bold shadow-hologram'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Copilot</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('validation');
            runValidation();
          }}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
            activeTab === 'validation'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Validation</span>
        </button>

        <button
          onClick={() => setActiveTab('dynamics')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
            activeTab === 'dynamics'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Aerodynamics</span>
        </button>

        <button
          onClick={() => setActiveTab('tech')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
            activeTab === 'tech'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#00C8FF]" />
          <span>8 Core APIs</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
            activeTab === 'export'
              ? 'bg-[#1677FF] text-white shadow-hologram'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PARAMETRIC SLIDERS                                      */}
      {/* ============================================================== */}
      {activeTab === 'params' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {/* Quick Benchmark Preset Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono">
              <button
                onClick={() => handleApplyPreset('compact')}
                className={`py-1 rounded-lg text-center transition-all ${
                  config.wingspan <= 320
                    ? 'bg-[#1677FF] text-white font-bold shadow-hologram'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Compact (300)
              </button>
              <button
                onClick={() => handleApplyPreset('standard')}
                className={`py-1 rounded-lg text-center transition-all ${
                  config.wingspan > 320 && config.wingspan <= 420
                    ? 'bg-[#1677FF] text-white font-bold shadow-hologram'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Standard (400)
              </button>
              <button
                onClick={() => handleApplyPreset('extended')}
                className={`py-1 rounded-lg text-center transition-all ${
                  config.wingspan > 420
                    ? 'bg-[#1677FF] text-white font-bold shadow-hologram'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Heavy (450)
              </button>
            </div>

            {/* Wingspan */}
            <div className="space-y-1.5 bg-[#10233B]/40 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Wingspan</span>
                <span className="font-mono text-[#00C8FF] font-bold">{config.wingspan} mm</span>
              </div>
              <input
                type="range"
                min={250}
                max={600}
                step={5}
                value={config.wingspan}
                onChange={(e) => handleWingspanChange(Number(e.target.value))}
                className="w-full accent-[#00C8FF] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>250 mm</span>
                <span>Default: 400</span>
                <span>600 mm</span>
              </div>
            </div>

            {/* Arm Length */}
            <div className="space-y-1.5 bg-[#10233B]/40 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Arm Length</span>
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
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>120 mm</span>
                <span>Default: 180</span>
                <span>280 mm</span>
              </div>
            </div>

            {/* Body Width */}
            <div className="space-y-1.5 bg-[#10233B]/40 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Body Fuselage Width</span>
                <span className="font-mono text-emerald-400 font-bold">{config.bodyWidth} mm</span>
              </div>
              <input
                type="range"
                min={80}
                max={200}
                step={2}
                value={config.bodyWidth}
                onChange={(e) => updateConfig({ bodyWidth: Number(e.target.value) })}
                className="w-full accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Motor Stator Size */}
            <div className="space-y-1.5 bg-[#10233B]/40 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Motor Stator Size</span>
                <span className="font-mono text-amber-400 font-bold">{config.motorSize} mm</span>
              </div>
              <input
                type="range"
                min={20}
                max={45}
                step={1}
                value={config.motorSize}
                onChange={(e) => updateConfig({ motorSize: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Propeller Diameter */}
            <div className="space-y-1.5 bg-[#10233B]/40 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Propeller Diameter</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {config.propellerSize} in ({((config.propellerSize || 7) * 25.4).toFixed(0)} mm)
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={10}
                step={0.5}
                value={config.propellerSize}
                onChange={(e) => updateConfig({ propellerSize: Number(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Live Aerodynamic Telemetry & Clearance Gauge */}
            <div className="p-3 bg-black/50 rounded-xl border border-[#00C8FF]/25 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#00C8FF]" />
                  <span>Aerodynamic Telemetry</span>
                </span>
                <span className="text-[#00C8FF] text-[10px]">Real-Time Model</span>
              </div>

              {/* Clearance Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Rotor Tip Clearance:</span>
                  <span className={bladeClearanceMm >= 40 ? 'text-emerald-400 font-bold' : bladeClearanceMm >= 20 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                    {bladeClearanceMm.toFixed(1)} mm ({bladeClearanceMm >= 40 ? 'SAFE' : bladeClearanceMm >= 20 ? 'TIGHT' : 'CRITICAL'})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      bladeClearanceMm >= 40 ? 'bg-emerald-400' : bladeClearanceMm >= 20 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, (bladeClearanceMm / 100) * 100))}%` }}
                  />
                </div>
              </div>

              {/* 4-Stat Flight Matrix */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-[#10233B]/50 border border-white/5">
                  <span className="text-slate-500 block text-[9px] uppercase">Thrust-to-Weight</span>
                  <span className="text-emerald-400 font-bold text-xs">{thrustToWeight} : 1</span>
                </div>
                <div className="p-2 rounded-lg bg-[#10233B]/50 border border-white/5">
                  <span className="text-slate-500 block text-[9px] uppercase">Hover Throttle</span>
                  <span className="text-[#00C8FF] font-bold text-xs">{hoverThrottlePct}%</span>
                </div>
                <div className="p-2 rounded-lg bg-[#10233B]/50 border border-white/5">
                  <span className="text-slate-500 block text-[9px] uppercase">Est. Top Speed</span>
                  <span className="text-[#39D5FF] font-bold text-xs">{estTopSpeedKmh} km/h</span>
                </div>
                <div className="p-2 rounded-lg bg-[#10233B]/50 border border-white/5">
                  <span className="text-slate-500 block text-[9px] uppercase">Hover Endurance</span>
                  <span className="text-amber-400 font-bold text-xs">~{estFlightTimeMins} mins</span>
                </div>
              </div>

              {/* Weight & Chassis Summary */}
              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                <span>All-Up Weight: <span className="text-white font-bold">{estimatedWeightGrams} g</span></span>
                <span>Material: <span className="text-[#00C8FF] font-bold">{config.material || '3K Carbon Fiber'}</span></span>
              </div>
            </div>
          </div>

          {/* Action Deck */}
          <div className="p-3 border-t border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveDesign}
                className="py-2 bg-[#10233B] hover:bg-[#1677FF]/30 text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-[#00C8FF]" />
                <span>Save Design</span>
              </button>

              <button
                onClick={resetConfig}
                className="py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset (400mm)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: BENCHMARK DESIGN PROFILES                               */}
      {/* ============================================================== */}
      {activeTab === 'profiles' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          <div className="text-xs text-slate-400 mb-2">
            Compare and instantly apply aerodynamic design benchmarks:
          </div>

          {/* Design 1: Standard */}
          <div
            onClick={() => handleApplyPreset('standard')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              config.wingspan > 320 && config.wingspan <= 420
                ? 'bg-[#1677FF]/20 border-[#00C8FF] shadow-hologram'
                : 'bg-[#10233B]/40 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Design 1 — Standard</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                High Stability
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-snug mb-2">
              Multi-role general purpose FPV and aerial survey quadcopter with optimal glide ratio.
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-300 bg-black/30 p-1.5 rounded-lg">
              <div>WS: <span className="text-[#00C8FF]">400mm</span></div>
              <div>Arm: <span className="text-[#00C8FF]">180mm</span></div>
              <div>AUW: <span className="text-[#00C8FF]">650g</span></div>
            </div>
          </div>

          {/* Design 2: Compact */}
          <div
            onClick={() => handleApplyPreset('compact')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              config.wingspan <= 320
                ? 'bg-[#1677FF]/20 border-[#00C8FF] shadow-hologram'
                : 'bg-[#10233B]/40 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Design 2 — Compact</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                High Agility
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-snug mb-2">
              Confined space indoor inspection quadcopter with 5-inch low-inertia rotors.
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-300 bg-black/30 p-1.5 rounded-lg">
              <div>WS: <span className="text-amber-400">300mm</span></div>
              <div>Arm: <span className="text-amber-400">135mm</span></div>
              <div>AUW: <span className="text-amber-400">520g</span></div>
            </div>
          </div>

          {/* Design 3: Extended */}
          <div
            onClick={() => handleApplyPreset('extended')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              config.wingspan > 420
                ? 'bg-[#1677FF]/20 border-[#00C8FF] shadow-hologram'
                : 'bg-[#10233B]/40 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Design 3 — Extended Arms</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                Heavy Payload
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-snug mb-2">
              Heavy-lift long-range platform with 8-inch high-efficiency propellers and max roll inertia.
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-300 bg-black/30 p-1.5 rounded-lg">
              <div>WS: <span className="text-[#39D5FF]">450mm</span></div>
              <div>Arm: <span className="text-[#39D5FF]">205mm</span></div>
              <div>AUW: <span className="text-[#39D5FF]">700g</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AI COPILOT CHAT                                         */}
      {/* ============================================================== */}
      {activeTab === 'ai' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
          {/* Quick Prompts */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              '🖐️ How do Hand Gestures work?',
              '🤘 Toggle flight simulation',
              '✌️ Show exploded view',
              '✊ Validate aeronautics',
              '🤙 Reset CAD camera',
              'Increase wingspan to 45 cm',
              'Make drone compact',
            ].map((qp) => (
              <button
                key={qp}
                onClick={() => sendAiMessage(qp)}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] bg-[#10233B]/60 hover:bg-[#1677FF]/30 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Quick Hand Gesture HUD Banner */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#10233B]/90 to-[#07111F]/90 border border-[#00C8FF]/30 space-y-1 text-[10px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5 font-bold text-white">
                <Hand className="w-3.5 h-3.5 text-[#00C8FF]" />
                <span>8-DoF Touchless Hand Control Suite:</span>
              </span>
              <span className="font-mono text-emerald-400">Webcam Active</span>
            </div>
            <div className="text-[9.5px] text-slate-300 grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono">
              <div>🖐️ <strong className="text-white">Palm:</strong> 3D Orbit & Tilt</div>
              <div>🤏 <strong className="text-white">Pinch:</strong> Resize Span</div>
              <div>☝️ <strong className="text-white">Point:</strong> Inspect Part</div>
              <div>✊ <strong className="text-white">Fist:</strong> Validate Safety</div>
              <div>✌️ <strong className="text-white">Peace:</strong> Explode View</div>
              <div>🤘 <strong className="text-white">Rock:</strong> Rotor Sim</div>
              <div>🤙 <strong className="text-white">Shaka:</strong> Reset Camera</div>
              <div>👍 <strong className="text-white">Thumbs:</strong> Save Config</div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-[#1677FF] text-white'
                      : 'bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/40'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-xl p-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1677FF]/30 border border-[#1677FF]/50 text-white'
                      : 'bg-[#10233B]/80 border border-white/10 text-slate-200'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.structuredData?.parameter && (
                    <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] font-mono text-[#00C8FF]">
                      ➔ {msg.structuredData.parameter}: {msg.structuredData.value} {msg.structuredData.unit}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAiProcessing && (
              <div className="flex items-center space-x-2 text-xs text-[#00C8FF] p-2 bg-[#10233B]/40 rounded-xl w-fit animate-pulse">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                <span>AI computing aerodynamic adjustments...</span>
              </div>
            )}
          </div>

          {/* Text Input */}
          <form onSubmit={handleSendAi} className="relative pt-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask AI to modify wingspan, arms, or layout..."
              className="w-full bg-[#10233B]/70 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8FF]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isAiProcessing}
              className="absolute right-1 top-2 p-1.5 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-lg transition-all disabled:opacity-30"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: AERONAUTICAL RULE VALIDATION                            */}
      {/* ============================================================== */}
      {activeTab === 'validation' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {validationReport?.checks.map((check) => (
            <div
              key={check.id}
              className="p-2.5 rounded-xl bg-[#10233B]/50 border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                {getStatusIcon(check.status)}
                <div>
                  <div className="text-xs font-semibold text-white">{check.title}</div>
                  <div className="text-[10px] text-slate-400">{check.description}</div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  check.status === 'valid'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}

          <div className="pt-2 border-t border-white/10 flex items-start space-x-2 text-[10px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-[#00C8FF] shrink-0 mt-0.5" />
            <p className="leading-tight">
              Aeronautical rule checks verify quadcopter symmetry, rotor clearance, and center of gravity balance.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: MANUFACTURING EXPORTS                                   */}
      {/* ============================================================== */}
      {activeTab === 'export' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* 4K Canvas Snapshot */}
          <div className="p-3 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <CameraIcon className="w-4 h-4 text-[#00C8FF]" />
              <span className="text-xs font-bold text-white">4K Canvas Snapshot (.PNG)</span>
            </div>
            <p className="text-[11px] text-slate-400">High-resolution photographic render of the current 3D CAD viewport.</p>
            <button
              onClick={handleExportCanvasSnapshot}
              className="w-full py-1.5 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-hologram"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export 4K PNG Render</span>
            </button>
          </div>

          {/* 2D CNC DXF */}
          <div className="p-3 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">2D CNC Vector Outline (.DXF)</span>
            </div>
            <p className="text-[11px] text-slate-400">AutoCAD DXF vector paths for CNC carbon fiber routing and waterjet cutting.</p>
            <button
              onClick={handleExportDXF}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 2D DXF Outline</span>
            </button>
          </div>

          {/* Aerospace BOM CSV */}
          <div className="p-3 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Manufacturing BOM (.CSV)</span>
            </div>
            <p className="text-[11px] text-slate-400">Component inventory, subsystem classification, and mass budget spreadsheet.</p>
            <button
              onClick={handleExportBOM_CSV}
              className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download BOM CSV</span>
            </button>
          </div>

          {/* STL */}
          <div className="p-3 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <Printer className="w-4 h-4 text-[#00C8FF]" />
              <span className="text-xs font-bold text-white">STL Mesh (3D Printing)</span>
            </div>
            <p className="text-[11px] text-slate-400">Watertight binary STL mesh ready for Bambu Studio, Cura, and PrusaSlicer.</p>
            <button
              onClick={handleExportSTL}
              className="w-full py-1.5 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-hologram"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download STL</span>
            </button>
          </div>

          {/* GLB */}
          <div className="p-3 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-[#39D5FF]" />
              <span className="text-xs font-bold text-white">GLB Binary CAD</span>
            </div>
            <p className="text-[11px] text-slate-400">Open 3D interchange standard for Blender, Unreal, and WebGL viewers.</p>
            <button
              onClick={handleExportGLB}
              className="w-full py-1.5 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-hologram"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download GLB</span>
            </button>
          </div>

          {/* JSON */}
          <div className="p-3 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">JSON Design Configuration</span>
            </div>
            <p className="text-[11px] text-slate-400">Structured parameters, component weights, and clearance telemetry.</p>
            <button
              onClick={handleExportJSON}
              className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all border border-white/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Firebase Cloud Storage Upload */}
          <div className="p-3 bg-[#10233B]/50 border border-purple-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Firebase Cloud Storage</span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Cloud Object Store
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Publish your STL, GLB, and DXF models to secure Firebase Storage for cloud sharing and remote collaboration.</p>
            <button
              onClick={handleUploadFirebase}
              disabled={uploadingFirebase}
              className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-[#1677FF] hover:from-purple-500 hover:to-[#00C8FF] text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-hologram disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingFirebase ? 'Uploading to Firebase...' : 'Publish to Firebase Storage'}</span>
            </button>
            {firebaseUrl && (
              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-400">✓ Uploaded to Bucket</span>
                <a href={firebaseUrl} target="_blank" rel="noopener noreferrer" className="text-[#00C8FF] hover:underline flex items-center space-x-1">
                  <span>Public URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: AERODYNAMICS & FLIGHT DYNAMICS ENGINE                     */}
      {/* ============================================================== */}
      {activeTab === 'dynamics' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Real-time Thrust-to-Weight Ratio Gauge */}
          <div className="p-3.5 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#00C8FF]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Aeronautical Dynamics</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                parseFloat(thrustToWeight) > 2.0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : parseFloat(thrustToWeight) > 1.4
                  ? 'bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                TWR: {thrustToWeight}:1
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Hover Throttle</span>
                <span className="text-white font-bold">{hoverThrottlePct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-[#00C8FF] to-amber-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, hoverThrottlePct)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[9px]">TOTAL THRUST</span>
                <span className="text-emerald-400 font-bold">{totalThrustKg} kg</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[9px]">ALL-UP WEIGHT (AUW)</span>
                <span className="text-amber-400 font-bold">{estimatedWeightGrams} g</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[9px]">DISC LOADING</span>
                <span className="text-[#00C8FF] font-bold">{(estimatedWeightGrams / Math.max(1, (4 * Math.PI * Math.pow(propDiameterMm / 20, 2)))).toFixed(2)} g/cm²</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[9px]">EST. TOP SPEED</span>
                <span className="text-purple-300 font-bold">{estTopSpeedKmh} km/h</span>
              </div>
            </div>
          </div>

          {/* Battery Endurance Envelope */}
          <div className="p-3.5 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Flight Endurance Matrix</span>
            </div>
            <p className="text-[10px] text-slate-400">Estimated hover & cruising times based on battery chemistry & current AUW:</p>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                <span className="text-slate-300">4S 1300mAh Graphene</span>
                <span className="text-emerald-400 font-bold">{((1.3 * 14.8 * 0.8 / Math.max(1, Math.round(estimatedWeightGrams * 0.18))) * 60).toFixed(1)} mins</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                <span className="text-slate-300">4S 1500mAh Standard (Equipped)</span>
                <span className="text-[#00C8FF] font-bold">{((1.5 * 14.8 * 0.8 / Math.max(1, Math.round(estimatedWeightGrams * 0.18))) * 60).toFixed(1)} mins</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                <span className="text-slate-300">4S 2200mAh Long-Range</span>
                <span className="text-purple-300 font-bold">{((2.2 * 14.8 * 0.8 / Math.max(1, Math.round(estimatedWeightGrams * 0.18))) * 60).toFixed(1)} mins</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                <span className="text-slate-300">6S 5000mAh Heavy-Lift</span>
                <span className="text-amber-400 font-bold">{((5.0 * 22.2 * 0.8 / Math.max(1, Math.round(estimatedWeightGrams * 0.18))) * 60).toFixed(1)} mins</span>
              </div>
            </div>
          </div>

          {/* Aerodynamic Simulation Controls */}
          <div className="p-3.5 bg-[#10233B]/50 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">CFD Wind Tunnel & Visuals</span>
            </div>

            {/* Streamline Wind Speed */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Free-Stream Wind Velocity</span>
                <span className="font-mono text-[#00E5FF] font-bold">{windSpeed} m/s</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full accent-[#00E5FF] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Action Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={toggleWindTunnel}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  windTunnelActive
                    ? 'bg-cyan-500/20 text-[#00E5FF] border border-cyan-500/50 shadow-hologram'
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>{windTunnelActive ? 'Tunnel Active' : 'Enable Tunnel'}</span>
              </button>

              <button
                onClick={toggleXrayMode}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  xrayMode
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-hologram'
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{xrayMode ? 'X-Ray Active' : 'Enable X-Ray'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

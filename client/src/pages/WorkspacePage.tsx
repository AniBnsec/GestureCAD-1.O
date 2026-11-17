import React, { useState } from 'react';
import { ComponentSidebar } from '../components/workspace/ComponentSidebar';
import { ViewportCanvas } from '../cad/ViewportCanvas';
import { RightInspector } from '../components/workspace/RightInspector';
import { useCadStore } from '../store/useCadStore';
import {
  ChevronLeft,
  ChevronRight,
  Box,
  Boxes,
  Layers,
  Sliders,
  Sparkles,
  ShieldCheck,
  Download,
  Save,
  RotateCcw,
  Maximize,
  HelpCircle,
  Cpu
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { config, resetConfig, showNotification } = useCadStore();

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#080D17]">
      {/* Top Professional CAD Workspace Status Strip */}
      <div className="h-8 bg-[#07111F] border-b border-[#00C8FF]/15 px-4 flex items-center justify-between text-[11px] font-mono shrink-0 select-none">
        {/* Project Breadcrumb */}
        <div className="flex items-center space-x-2 text-slate-400">
          <span className="text-white font-semibold">GestureCAD Studio</span>
          <span>/</span>
          <span className="text-[#00C8FF]">Autonomous Drone Assembly</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">Wingspan: {config.wingspan} mm</span>
        </div>

        {/* Center AI Engine Status */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">AI Engine:</span>
          <span className="text-[#00C8FF] font-semibold">Auto-Cascading (Cohere / Gemini / Local)</span>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center space-x-2 text-slate-400">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="hover:text-white flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00C8FF]" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>

          <button
            onClick={resetConfig}
            className="hover:text-white flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
            title="Reset Default Dimensions"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleFullscreen}
            className="hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main 3-Pane Workstation Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANE: Component Tree & Assembly */}
        {isLeftOpen ? (
          <div className="relative h-full flex shrink-0">
            <ComponentSidebar />
            <button
              onClick={() => setIsLeftOpen(false)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-[#07111F] border border-[#00C8FF]/30 rounded-r-md flex items-center justify-center text-slate-400 hover:text-white shadow-hologram"
              title="Collapse Components (Left)"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-11 h-full bg-[#07111F] border-r border-[#00C8FF]/20 flex flex-col items-center py-3 space-y-3 shrink-0 select-none z-10">
            <button
              onClick={() => setIsLeftOpen(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#1677FF] text-slate-400 hover:text-white transition-all shadow-hologram"
              title="Expand Components Sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="w-5 h-px bg-white/10" />
            <button
              onClick={() => setIsLeftOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C8FF] hover:bg-white/5"
              title="Components"
            >
              <Box className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsLeftOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C8FF] hover:bg-white/5"
              title="Assembly"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CENTER PANE: 3D CAD Viewport with Webcam PIP & Voice HUD */}
        <div className="flex-1 h-full p-2 flex flex-col min-w-0 overflow-hidden relative">
          <ViewportCanvas />
        </div>

        {/* RIGHT PANE: Multi-Tab Studio Inspector */}
        {isRightOpen ? (
          <div className="relative h-full flex shrink-0">
            <button
              onClick={() => setIsRightOpen(false)}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-[#07111F] border border-[#00C8FF]/30 rounded-l-md flex items-center justify-center text-slate-400 hover:text-white shadow-hologram"
              title="Collapse Inspector (Right)"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <RightInspector />
          </div>
        ) : (
          <div className="w-11 h-full bg-[#07111F] border-l border-[#00C8FF]/20 flex flex-col items-center py-3 space-y-3 shrink-0 select-none z-10">
            <button
              onClick={() => setIsRightOpen(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#1677FF] text-slate-400 hover:text-white transition-all shadow-hologram"
              title="Expand Inspector Sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="w-5 h-px bg-white/10" />
            <button
              onClick={() => setIsRightOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C8FF] hover:bg-white/5"
              title="Parameters"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRightOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C8FF] hover:bg-white/5"
              title="Benchmark Profiles"
            >
              <Boxes className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRightOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C8FF] hover:bg-white/5"
              title="AI Copilot"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRightOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C8FF] hover:bg-white/5"
              title="Validation"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRightOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C8FF] hover:bg-white/5"
              title="Export Files"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Dialog Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-[#07111F] border border-[#00C8FF]/40 rounded-2xl p-6 max-w-md w-full shadow-glass space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-[#00C8FF]" />
                <span>Keyboard & Gesture Shortcuts</span>
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ESC / Close
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                <span className="text-slate-300">Exploded Assembly View</span>
                <kbd className="px-2 py-0.5 rounded bg-[#10233B] text-[#00C8FF] border border-[#00C8FF]/30">E</kbd>
              </div>
              <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                <span className="text-slate-300">Top Plan View</span>
                <kbd className="px-2 py-0.5 rounded bg-[#10233B] text-[#00C8FF] border border-[#00C8FF]/30">T</kbd>
              </div>
              <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                <span className="text-slate-300">Side Elevation View</span>
                <kbd className="px-2 py-0.5 rounded bg-[#10233B] text-[#00C8FF] border border-[#00C8FF]/30">S</kbd>
              </div>
              <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                <span className="text-slate-300">3D Perspective Orbit</span>
                <kbd className="px-2 py-0.5 rounded bg-[#10233B] text-[#00C8FF] border border-[#00C8FF]/30">3</kbd>
              </div>
              <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                <span className="text-slate-300">Reset Default Dimensions</span>
                <kbd className="px-2 py-0.5 rounded bg-[#10233B] text-[#00C8FF] border border-[#00C8FF]/30">R</kbd>
              </div>
              <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                <span className="text-slate-300">Toggle Webcam Vision</span>
                <kbd className="px-2 py-0.5 rounded bg-[#10233B] text-[#00C8FF] border border-[#00C8FF]/30">C</kbd>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400">
              💡 Tip: Pinch with your thumb and index finger to grab and resize drone wingspan dynamically.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

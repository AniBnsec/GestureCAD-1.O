import React from 'react';
import confetti from 'canvas-confetti';
import { useCadStore } from '../../store/useCadStore';
import { exportSTL, exportGLB, exportJSON } from '../../cad/exporters';
import {
  Download,
  Printer,
  Boxes,
  FileCode,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const ExportPanel: React.FC = () => {
  const { config, components, validationReport, showNotification } = useCadStore();

  const handleExportSTL = () => {
    try {
      exportSTL(config, components);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showNotification(`STL 3D model exported successfully (${config.wingspan} mm). Ready for slicing & 3D printing!`, 'success');
    } catch (e) {
      showNotification('STL export failed.', 'error');
    }
  };

  const handleExportGLB = () => {
    try {
      exportGLB(config, components);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showNotification(`GLB binary 3D CAD model exported successfully!`, 'success');
    } catch (e) {
      showNotification('GLB export failed.', 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      exportJSON(config, components, validationReport);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      showNotification(`Design Configuration & Bill of Materials exported as JSON!`, 'success');
    } catch (e) {
      showNotification('JSON export failed.', 'error');
    }
  };

  return (
    <div className="h-full bg-[#07111F]/90 border border-[#00C8FF]/20 rounded-2xl p-4 flex flex-col backdrop-blur-md shadow-glass">
      {/* Header matching Slide 4 */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Export & Real-World Use</h3>
          <p className="text-[11px] text-slate-400">Take your design from concept to the real world</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Manufacturing Ready
        </span>
      </div>

      {/* 4 Format Cards matching Slide 4 */}
      <div className="grid grid-cols-4 gap-3 my-3">
        {/* STL (3D Print) */}
        <div className="p-3 bg-[#10233B]/50 hover:bg-[#1677FF]/20 border border-white/10 hover:border-[#00C8FF]/50 rounded-xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Printer className="w-5 h-5 text-[#00C8FF]" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
            </div>
            <div className="text-xs font-bold text-white">STL File</div>
            <div className="text-[10px] text-slate-400 mt-0.5">3D Printing</div>
            <p className="text-[9px] text-slate-500 mt-1">Cura, PrusaSlicer & Bambu Lab compatible mesh.</p>
          </div>
          <button
            onClick={handleExportSTL}
            className="w-full mt-3 py-1.5 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-hologram"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download STL</span>
          </button>
        </div>

        {/* GLB / GLTF (3D Model) */}
        <div className="p-3 bg-[#10233B]/50 hover:bg-[#1677FF]/20 border border-white/10 hover:border-[#00C8FF]/50 rounded-xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Boxes className="w-5 h-5 text-[#39D5FF]" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
            </div>
            <div className="text-xs font-bold text-white">GLB / GLTF</div>
            <div className="text-[10px] text-slate-400 mt-0.5">CAD & Web 3D</div>
            <p className="text-[9px] text-slate-500 mt-1">Blender, Three.js & AR/VR interchange format.</p>
          </div>
          <button
            onClick={handleExportGLB}
            className="w-full mt-3 py-1.5 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-hologram"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download GLB</span>
          </button>
        </div>

        {/* JSON Configuration */}
        <div className="p-3 bg-[#10233B]/50 hover:bg-[#1677FF]/20 border border-white/10 hover:border-[#00C8FF]/50 rounded-xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
            </div>
            <div className="text-xs font-bold text-white">JSON Spec</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Parametric Config</div>
            <p className="text-[9px] text-slate-500 mt-1">Full Bill of Materials & dimensional metadata.</p>
          </div>
          <button
            onClick={handleExportJSON}
            className="w-full mt-3 py-1.5 bg-[#10233B] hover:bg-[#1677FF]/40 text-white border border-white/10 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>

        {/* STEP (CAD workflows) - Marked as Planned */}
        <div className="p-3 bg-black/30 border border-dashed border-slate-700 rounded-xl flex flex-col justify-between opacity-75">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Boxes className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center space-x-1">
                <Clock className="w-2.5 h-2.5" />
                <span>PHASE 2</span>
              </span>
            </div>
            <div className="text-xs font-bold text-slate-300">STEP Format</div>
            <div className="text-[10px] text-slate-500 mt-0.5">NURBS Solid Model</div>
            <p className="text-[9px] text-slate-500 mt-1">Planned for SolidWorks & Fusion 360 direct kernel import.</p>
          </div>
          <button
            disabled
            className="w-full mt-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs font-medium cursor-not-allowed text-center"
          >
            In Roadmap
          </button>
        </div>
      </div>

      {/* PPT Highlight Features matching Slide 4 */}
      <div className="pt-2 border-t border-white/10 grid grid-cols-4 gap-2 text-[10px] text-slate-300">
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>3D Print Ready</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>CAD Compatible</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Prototype & Test</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Further Engineering Use</span>
        </div>
      </div>
    </div>
  );
};


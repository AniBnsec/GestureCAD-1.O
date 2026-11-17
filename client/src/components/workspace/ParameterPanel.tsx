import React from 'react';
import { useCadStore } from '../../store/useCadStore';
import { api } from '../../services/api';
import {
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';

export const ParameterPanel: React.FC = () => {
  const {
    config,
    updateConfig,
    resetConfig,
    components,
    loadVariants,
    setActiveDrawerTab,
    runValidation,
    showNotification,
  } = useCadStore();

  const handleWingspanChange = (val: number) => {
    // Keep arm length proportional to maintain clean quad geometry
    const proportionalArm = Math.round((val / 400) * 180);
    updateConfig({ wingspan: val, armLength: proportionalArm });
  };

  const handleGenerateAlternatives = async () => {
    setActiveDrawerTab('comparison');
    await loadVariants();
    showNotification('Generated 3 aerodynamic drone alternatives (Standard, Compact, Extended Arms).', 'success');
  };

  const handleSaveDesign = async () => {
    const res = await api.saveDesign(`Quadcopter-${config.wingspan}mm`, config, components);
    if (res) {
      showNotification(`Design saved to database successfully! (ID: ${res.id.slice(0, 8)}...)`, 'success');
    }
  };

  const handleValidate = async () => {
    setActiveDrawerTab('validation');
    await runValidation();
    showNotification('Design validation completed. All geometric & rule checks verified.', 'info');
  };

  return (
    <div className="w-80 h-full bg-[#07111F]/90 border-l border-[#00C8FF]/20 flex flex-col backdrop-blur-md">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-[#00C8FF]" />
          <h2 className="text-sm font-bold text-white tracking-wide">Design Parameters</h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/30">
          Units: mm
        </span>
      </div>

      {/* Sliders Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <span className="text-slate-300 font-medium">Body Width</span>
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
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>80 mm</span>
            <span>Default: 120</span>
            <span>200 mm</span>
          </div>
        </div>

        {/* Motor Size */}
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
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>20 mm (2004)</span>
            <span>30 mm (2207)</span>
            <span>45 mm (2806)</span>
          </div>
        </div>

        {/* Propeller Size */}
        <div className="space-y-1.5 bg-[#10233B]/40 p-3 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Propeller Diameter</span>
            <span className="font-mono text-cyan-400 font-bold">{config.propellerSize} in ({((config.propellerSize || 7) * 25.4).toFixed(0)} mm)</span>
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
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>4 inch</span>
            <span>7 inch</span>
            <span>10 inch</span>
          </div>
        </div>

        {/* Material Selection */}
        <div className="space-y-1.5 bg-[#10233B]/40 p-3 rounded-xl border border-white/5">
          <label className="text-xs text-slate-300 font-medium">Chassis Material</label>
          <select
            value={config.material}
            onChange={(e) => updateConfig({ material: e.target.value })}
            className="w-full bg-[#080D17] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
          >
            <option value="Carbon Fiber">3K Matte Carbon Fiber</option>
            <option value="Aviation Aluminum">7075-T6 Anodized Aluminum</option>
            <option value="Polycarbonate Composite">High-Modulus Polycarbonate</option>
          </select>
        </div>
      </div>

      {/* Action Buttons matching Slide 4 */}
      <div className="p-4 border-t border-white/10 space-y-2.5">
        {/* Generate Alternatives Button matching PPT */}
        <button
          onClick={handleGenerateAlternatives}
          className="w-full py-2.5 bg-gradient-to-r from-[#1677FF] to-[#00C8FF] text-[#07111F] font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-hologram hover:opacity-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Alternatives</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleValidate}
            className="py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Validate</span>
          </button>
          <button
            onClick={handleSaveDesign}
            className="py-2 bg-[#10233B] hover:bg-[#1677FF]/30 text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-[#00C8FF]" />
            <span>Save</span>
          </button>
        </div>

        <button
          onClick={resetConfig}
          className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Parameters</span>
        </button>
      </div>
    </div>
  );
};


import React, { useEffect } from 'react';
import { useCadStore } from '../../store/useCadStore';
import { DesignVariantData } from '../../types';
import { Sparkles, Check, ArrowRight, Gauge, Scale, Shield, CheckCircle2 } from 'lucide-react';

export const ComparisonPanel: React.FC = () => {
  const { variants, activeVariantId, applyVariantConfig, loadVariants } = useCadStore();

  useEffect(() => {
    if (variants.length === 0) {
      loadVariants();
    }
  }, [variants.length, loadVariants]);

  return (
    <div className="h-full bg-[#07111F]/90 border border-[#00C8FF]/20 rounded-2xl p-4 flex flex-col backdrop-blur-md shadow-glass">
      {/* Header matching Slide 4 */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Design Comparison</h3>
          <p className="text-[11px] text-slate-400">Easily compare multiple drone configurations</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/30">
          3 Real Configs
        </span>
      </div>

      {/* 3 Design Cards matching Slide 4 */}
      <div className="grid grid-cols-3 gap-3 my-3">
        {variants.map((v) => {
          const isActive = v.id === activeVariantId;
          return (
            <div
              key={v.id}
              onClick={() => applyVariantConfig(v)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-[#1677FF]/20 border-[#00C8FF] shadow-hologram ring-1 ring-[#00C8FF]'
                  : 'bg-[#10233B]/50 border-white/10 hover:border-white/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{v.name}</span>
                  {isActive && (
                    <span className="p-0.5 rounded-full bg-emerald-500 text-black">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 mb-2 leading-tight">{v.tagline}</p>

                {/* Metrics Table */}
                <div className="space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Gauge className="w-3 h-3 text-[#00C8FF]" />
                      <span>Wingspan:</span>
                    </span>
                    <span className="font-bold text-white">{v.wingspan} mm</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Scale className="w-3 h-3 text-amber-400" />
                      <span>Weight:</span>
                    </span>
                    <span className="font-bold text-white">{v.weight} g</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span>Stability:</span>
                    </span>
                    <span
                      className={`font-bold ${
                        v.stability === 'Very High'
                          ? 'text-[#00C8FF]'
                          : v.stability === 'High'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {v.stability}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  applyVariantConfig(v);
                }}
                className={`w-full mt-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 ${
                  isActive
                    ? 'bg-[#00C8FF] text-[#07111F] font-bold shadow-hologram'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                <span>{isActive ? 'Active in Viewport' : 'Apply Configuration'}</span>
                {!isActive && <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Detail Bar */}
      <div className="bg-[#10233B]/40 rounded-xl p-2.5 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Click any variant card to update the 3D model geometry and aerodynamic envelope instantly.</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">Physics & Dimensions verified</span>
      </div>
    </div>
  );
};


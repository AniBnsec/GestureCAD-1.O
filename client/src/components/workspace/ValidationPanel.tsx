import React, { useEffect } from 'react';
import { useCadStore } from '../../store/useCadStore';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Info, RefreshCw } from 'lucide-react';

export const ValidationPanel: React.FC = () => {
  const { validationReport, runValidation, config } = useCadStore();

  useEffect(() => {
    if (!validationReport) {
      runValidation();
    }
  }, [validationReport, runValidation]);

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

  const getStatusBadge = (status: 'valid' | 'warning' | 'invalid') => {
    switch (status) {
      case 'valid':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
            Valid
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
            Warning
          </span>
        );
      case 'invalid':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
            Invalid
          </span>
        );
    }
  };

  return (
    <div className="h-full bg-[#07111F]/90 border border-[#00C8FF]/20 rounded-2xl p-4 flex flex-col backdrop-blur-md shadow-glass">
      {/* Header matching Slide 4 */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Design Validation</h3>
            <p className="text-[11px] text-slate-400">AI + Rule-based checks ensure feasible and safe designs</p>
          </div>
        </div>

        <button
          onClick={() => runValidation()}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Re-validate</span>
        </button>
      </div>

      {/* Validation Checks List matching Slide 4 */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2">
        {validationReport?.checks.map((check) => (
          <div
            key={check.id}
            className="p-2.5 rounded-xl bg-[#10233B]/50 border border-white/5 flex items-center justify-between hover:border-white/15 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              {getStatusIcon(check.status)}
              <div>
                <div className="text-xs font-semibold text-white">{check.title}</div>
                <div className="text-[10px] text-slate-400">{check.description}</div>
              </div>
            </div>

            <div className="text-right shrink-0 ml-3">
              {getStatusBadge(check.status)}
              {check.measuredValue && (
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">{check.measuredValue}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Engineering Disclaimer */}
      <div className="pt-2 border-t border-white/10 flex items-start space-x-2 text-[10px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-[#00C8FF] shrink-0 mt-0.5" />
        <p className="leading-tight">
          {validationReport?.disclaimer ||
            'Conceptual design prototype. Geometric and rule checks assist rapid prototyping but do not replace certified aerospace structural analysis.'}
        </p>
      </div>
    </div>
  );
};


import React, { useRef } from 'react';
import { useCadStore } from '../store/useCadStore';
import { useHandTracking } from './useHandTracking';
import { Camera, CameraOff, Sparkles, Hand, MousePointer, Grab, CheckCircle2 } from 'lucide-react';

export const GestureHUD: React.FC = () => {
  const { gestureState, toggleCamera, toggleDemoSimulation } = useCadStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isInitializing, initError } = useHandTracking({ videoRef, canvasRef });

  return (
    <div className="bg-[#07111F]/90 border border-[#00C8FF]/20 rounded-2xl p-4 backdrop-blur-md flex flex-col h-full shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#1677FF]/20 rounded-lg text-[#00C8FF]">
            <Hand className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Webcam Hand Tracking</h3>
            <p className="text-[11px] text-slate-400">MediaPipe AI Vision Controller</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDemoSimulation}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center space-x-1.5 ${
              gestureState.demoSimulated
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-hologram'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{gestureState.demoSimulated ? 'Simulating' : 'Demo Mode'}</span>
          </button>

          <button
            onClick={toggleCamera}
            disabled={isInitializing}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
              gestureState.cameraActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-[#1677FF] text-white hover:bg-[#1677FF]/80 shadow-hologram'
            }`}
          >
            {gestureState.cameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>{isInitializing ? 'Loading...' : 'Start Camera'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Video / Canvas Feed */}
      <div className="relative mt-3 flex-1 min-h-[170px] bg-black/40 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
        {gestureState.cameraActive ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          </>
        ) : gestureState.demoSimulated ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#10233B]/50 to-transparent">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 bg-amber-400/20 flex items-center justify-center shadow-hologram animate-pulse mb-2">
              <Hand className="w-6 h-6 text-amber-300" />
            </div>
            <div className="text-xs font-bold text-amber-300 tracking-wide">Interactive Demo Gesture Active</div>
            <p className="text-[11px] text-slate-400 text-center mt-1 max-w-xs">
              Simulating continuous hand landmarks and pinch-to-adjust CAD parameters.
            </p>
          </div>
        ) : (
          <div className="text-center p-4">
            <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400 font-medium">Webcam tracking is currently paused.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Click "Start Camera" or "Demo Mode" to interact with gestures.</p>
          </div>
        )}

        {/* Live Detected Gesture Tag */}
        {(gestureState.cameraActive || gestureState.demoSimulated) && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-[#080D17]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#00C8FF]/30 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[#00C8FF] font-semibold">{gestureState.activeAction}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">
              Conf: {(gestureState.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {initError && (
        <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
          {initError}
        </div>
      )}

      {/* PPT Gesture Cheat-sheet Visual matching Slide 1 & Slide 4 */}
      <div className="mt-3 grid grid-cols-5 gap-1.5 text-center text-[10px]">
        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-[#00C8FF]/40 transition-colors">
          <Grab className="w-3.5 h-3.5 mx-auto text-[#00C8FF] mb-1" />
          <div className="font-semibold text-white">Pinch</div>
          <div className="text-slate-400 text-[9px]">Select Part</div>
        </div>
        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-[#00C8FF]/40 transition-colors">
          <Hand className="w-3.5 h-3.5 mx-auto text-[#39D5FF] mb-1" />
          <div className="font-semibold text-white">Move</div>
          <div className="text-slate-400 text-[9px]">Reposition</div>
        </div>
        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-[#00C8FF]/40 transition-colors">
          <MousePointer className="w-3.5 h-3.5 mx-auto text-[#1677FF] mb-1" />
          <div className="font-semibold text-white">Point</div>
          <div className="text-slate-400 text-[9px]">Highlight</div>
        </div>
        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-[#00C8FF]/40 transition-colors">
          <Hand className="w-3.5 h-3.5 mx-auto text-emerald-400 mb-1" />
          <div className="font-semibold text-white">Open Palm</div>
          <div className="text-slate-400 text-[9px]">Release</div>
        </div>
        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-[#00C8FF]/40 transition-colors">
          <CheckCircle2 className="w-3.5 h-3.5 mx-auto text-rose-400 mb-1" />
          <div className="font-semibold text-white">Fist</div>
          <div className="text-slate-400 text-[9px]">Confirm</div>
        </div>
      </div>
    </div>
  );
};


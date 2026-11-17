import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCadStore } from '../store/useCadStore';
import {
  Compass,
  Hand,
  Mic,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { gestureState, voiceState, config } = useCadStore();
  const isWorkspace = location.pathname === '/workspace';

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (isWorkspace) return;
    const sections = ['specs', 'voice-ai', 'hand-tracking', 'playground', 'features', 'home'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isWorkspace]);

  return (
    <header className="h-16 bg-[#07111F]/95 border-b border-[#00C8FF]/20 backdrop-blur-xl sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1677FF] to-[#00C8FF] p-0.5 shadow-hologram group-hover:shadow-hologram-lg transition-all flex items-center justify-center">
            <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#00C8FF] group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-wider text-white font-sans">
                Gesture<span className="text-[#00C8FF]">CAD</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isWorkspace ? 'Active Studio' : 'v2.4 Spatial CAD'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wide -mt-0.5">
              Spatial CAD for Autonomous Drones
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation: Workspace Mode vs Landing Mode */}
      {isWorkspace ? (
        /* WORKSPACE MODE: Workstation Status Bar */
        <div className="hidden md:flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-[#10233B]/50 border border-white/5 text-slate-300">
            <span className="text-slate-500">Design:</span>
            <span className="text-white font-bold">AeroX-4</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#00C8FF]">WS: {config.wingspan}mm</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#10233B]/50 border border-white/5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-500">AI:</span>
            <span className="text-emerald-400 font-bold">Cohere / Gemini Live</span>
          </div>
        </div>
      ) : (
        /* LANDING PAGE MODE: Exact Navigation Links matching UI reference */
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
          <a
            href="#home"
            className={`${
              activeSection === 'home' ? 'text-[#00C8FF]' : 'text-slate-300 hover:text-[#00C8FF]'
            } transition-colors`}
          >
            Home
          </a>
          <a
            href="#features"
            className={`${
              activeSection === 'features' ? 'text-[#00C8FF]' : 'text-slate-300 hover:text-[#00C8FF]'
            } transition-colors`}
          >
            Features
          </a>
          <a
            href="#playground"
            className={`${
              activeSection === 'playground' ? 'text-[#00C8FF]' : 'text-slate-300 hover:text-[#00C8FF]'
            } transition-colors`}
          >
            3D Playground
          </a>
          <a
            href="#hand-tracking"
            className={`${
              activeSection === 'hand-tracking' ? 'text-[#00C8FF]' : 'text-slate-300 hover:text-[#00C8FF]'
            } transition-colors`}
          >
            Hand Tracking
          </a>
          <a
            href="#voice-ai"
            className={`${
              activeSection === 'voice-ai' ? 'text-[#00C8FF]' : 'text-slate-300 hover:text-[#00C8FF]'
            } transition-colors`}
          >
            Voice AI
          </a>
          <a
            href="#specs"
            className={`${
              activeSection === 'specs' ? 'text-[#00C8FF]' : 'text-slate-300 hover:text-[#00C8FF]'
            } transition-colors`}
          >
            Specifications
          </a>
        </nav>
      )}

      {/* Hardware Badges & Workspace Launch Button */}
      <div className="flex items-center space-x-3">
        {/* Hardware Status Indicators */}
        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono">
          <div
            className={`px-2 py-1 rounded-lg border flex items-center space-x-1.5 ${
              gestureState.cameraActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : gestureState.demoSimulated
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <Hand className="w-3 h-3" />
            <span>
              {gestureState.cameraActive
                ? 'VISION ACTIVE'
                : gestureState.demoSimulated
                ? 'DEMO ACTIVE'
                : 'VISION READY'}
            </span>
          </div>

          <div
            className={`px-2 py-1 rounded-lg border flex items-center space-x-1.5 ${
              voiceState.isListening
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>{voiceState.isListening ? 'LISTENING' : 'VOICE READY'}</span>
          </div>
        </div>

        {/* Studio Link CTA */}
        {isWorkspace ? (
          <Link
            to="/"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Studio</span>
          </Link>
        ) : (
          <Link
            to="/workspace"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#1677FF] to-[#00C8FF] text-[#07111F] hover:shadow-hologram transition-all flex items-center space-x-1.5 shadow-glass"
          >
            <span>Launch 3D Studio</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        )}
      </div>
    </header>
  );
};

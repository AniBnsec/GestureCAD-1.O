import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './layouts/Navbar';
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { useCadStore } from './store/useCadStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const App: React.FC = () => {
  const {
    notification,
    clearNotification,
    toggleExplodedView,
    setViewMode,
    resetConfig,
    toggleCamera,
  } = useCadStore();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'e':
          toggleExplodedView();
          break;
        case 't':
          setViewMode('top');
          break;
        case 's':
          setViewMode('side');
          break;
        case 'f':
          setViewMode('front');
          break;
        case '3':
          setViewMode('3d');
          break;
        case 'r':
          resetConfig();
          break;
        case 'c':
          toggleCamera();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleExplodedView, setViewMode, resetConfig, toggleCamera]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#080D17] text-white flex flex-col font-sans selection:bg-[#00C8FF] selection:text-[#080D17]">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
          </Routes>
        </main>

        {/* Global Toast Notification - Placed at Top-Right to prevent bottom HUD collisions */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 max-w-md animate-slide-up">
            <div
              className={`p-3.5 rounded-xl border backdrop-blur-xl flex items-start space-x-3 shadow-glass ${
                notification.type === 'success'
                  ? 'bg-[#07111F]/95 border-emerald-500/50 text-emerald-300'
                  : notification.type === 'warning'
                  ? 'bg-[#07111F]/95 border-amber-500/50 text-amber-300'
                  : notification.type === 'error'
                  ? 'bg-[#07111F]/95 border-rose-500/50 text-rose-300'
                  : 'bg-[#07111F]/95 border-[#00C8FF]/50 text-[#00C8FF]'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : notification.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 shrink-0 text-[#00C8FF] mt-0.5" />
              )}

              <div className="flex-1 text-xs font-medium text-white leading-snug">
                {notification.message}
              </div>

              <button
                onClick={clearNotification}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;


import React, { useState } from 'react';
import { useCadStore } from '../../store/useCadStore';
import { useVoiceRecognition } from '../../voice/useVoiceRecognition';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Sliders,
  CheckCircle2,
  Volume2
} from 'lucide-react';

export const AiAssistantPanel: React.FC = () => {
  const { chatMessages, sendAiMessage, isAiProcessing, voiceState } = useCadStore();
  const { toggleListening, isSupported } = useVoiceRecognition();
  const [inputText, setInputText] = useState('');

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isAiProcessing) return;
    const text = inputText;
    setInputText('');
    await sendAiMessage(text);
  };

  const samplePrompts = [
    '🖐️ How do Hand Gestures work?',
    'Increase wingspan to 45 cm',
    'Show exploded assembly view',
    'Suggest a more compact version for indoor use',
    'Generate 3 alternative designs',
  ];

  return (
    <div className="h-full bg-[#07111F]/90 border border-[#00C8FF]/20 rounded-2xl p-4 flex flex-col backdrop-blur-md shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-br from-[#1677FF] to-[#00C8FF] rounded-lg text-[#07111F]">
            <Sparkles className="w-4 h-4 font-bold" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">AI Design Assistant</h3>
            <p className="text-[11px] text-slate-400">Natural-Language Parametric CAD Controller</p>
          </div>
        </div>

        {/* Voice Recognition Control */}
        <button
          onClick={toggleListening}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all ${
            voiceState.isListening
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500 animate-pulse shadow-hologram-red'
              : 'bg-[#1677FF]/20 text-[#00C8FF] border border-[#00C8FF]/40 hover:bg-[#1677FF]/30 shadow-hologram'
          }`}
        >
          {voiceState.isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Command</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Quick Prompts matching Slide 4 */}
      <div className="flex items-center space-x-2 overflow-x-auto py-2 border-b border-white/5 scrollbar-none">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendAiMessage(prompt)}
            className="whitespace-nowrap px-2.5 py-1 text-[11px] bg-[#10233B]/70 hover:bg-[#1677FF]/30 text-slate-300 hover:text-white border border-white/10 hover:border-[#00C8FF]/40 rounded-lg transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#00C8FF]" />
            <span>"{prompt}"</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-[#1677FF] text-white shadow-hologram'
                  : 'bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/40'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#1677FF]/30 border border-[#1677FF]/50 text-white shadow-glass'
                  : 'bg-[#10233B]/80 border border-white/10 text-slate-200 shadow-glass'
              }`}
            >
              <p>{msg.text}</p>

              {/* Structured Parameter Tag matching Slide 4 cards */}
              {msg.structuredData && (
                <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                  {msg.structuredData.parameter && (
                    <span className="px-2 py-0.5 rounded bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/30 flex items-center space-x-1">
                      <Sliders className="w-3 h-3" />
                      <span>{msg.structuredData.parameter}: {msg.structuredData.value} {msg.structuredData.unit}</span>
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Geometry Updated</span>
                  </span>
                </div>
              )}

              <span className="block text-[9px] text-slate-500 text-right mt-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isAiProcessing && (
          <div className="flex items-center space-x-2 text-xs text-[#00C8FF] p-2 bg-[#10233B]/40 rounded-xl w-fit animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>AI analyzing aerodynamics and recomputing geometry...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="relative mt-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type a design command (e.g. 'Increase wingspan to 45 cm')..."
          className="w-full bg-[#10233B]/70 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8FF]/80 transition-colors shadow-glass"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isAiProcessing}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] rounded-lg transition-all disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};


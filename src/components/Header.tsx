import React from 'react';
import { Sparkles, Code2, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
          <Code2 className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-black">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            Figma<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-extrabold ml-1">ToCode</span>
            <span className="ml-2.5 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-md bg-white/[0.06] text-white/70 border border-white/[0.08]">
              MVP v1.0
            </span>
          </h1>
          <p className="text-[11px] text-white/40 font-medium">AI-Powered Screen-to-React Converter</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/70 space-x-2">
          <Zap className="w-3.5 h-3.5 text-violet-400 fill-violet-400/20" />
          <span>Gemini 2.5 Flash Vision</span>
        </div>
        <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-500/20 border border-violet-500/30 text-xs font-semibold text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
          <span>Hackathon Ready</span>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Clipboard, Trash2, ArrowRight, Settings, LogIn, Sparkles, AlertCircle, Image as ImageIcon, Paperclip, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UploadSectionProps {
  onImageSelected: (base64Image: string) => void;
  onGenerate: (context: string, language: string, textPrompt?: string) => void;
  isLoading: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function UploadSection({ onImageSelected, onGenerate, isLoading, selectedModel, onModelChange }: UploadSectionProps) {
  const { user, signInWithGoogle, signInAsGuest } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('generic');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('react');
  const [textPrompt, setTextPrompt] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported (PNG, JPEG, WebP, etc.)');
      return;
    }

    // Limit to 20MB
    if (file.size > 20 * 1024 * 1024) {
      alert('Maximum file size is 20MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setImagePreview(base64data);
      onImageSelected(base64data);
    };
  }, [onImageSelected]);

  // Paste handler for quick clipboard support inside the search component
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading || imagePreview) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [imagePreview, isLoading, processFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
 
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  const handleClear = () => {
    setImagePreview(null);
    onImageSelected('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleGenerateClick = () => {
    if (!textPrompt.trim() && !imagePreview) return;
    onGenerate(selectedContext, selectedLanguage, textPrompt.trim() ? textPrompt : undefined);
  };

  return (
    <div className="relative flex flex-col space-y-6 w-full max-w-2xl mx-auto p-1">
      {!user && (
         <div className="absolute inset-0 bg-[#06070a]/50 backdrop-blur-md border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center p-8 text-center z-20 animate-fade-in">
           <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-fuchsia-500/30 border border-violet-500/30 text-white shadow-xl shadow-violet-500/10 mb-4 animate-pulse">
             <Sparkles className="w-7 h-7 text-violet-400" />
           </div>
           <h3 className="text-lg font-bold text-white tracking-tight">Convert Design to React Code</h3>
           <p className="text-xs text-white/50 max-w-sm mt-1.5 mb-6 leading-relaxed">
             Instantly translate your design screenshots into responsive, ready-to-use React components. Sign in with Google to get started.
           </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 py-3 px-6 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
              <button
                onClick={signInAsGuest}
                className="flex items-center space-x-2 py-3 px-6 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white hover:text-white transition-all active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
              >
                <span>Proceed as Guest</span>
              </button>
            </div>
         </div>
      )}

      {/* Unified AI Agent Search Bar Tray */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full flex flex-col space-y-4 p-6 rounded-2xl bg-white/[0.02] border transition-all duration-300 backdrop-blur-md shadow-2xl relative ${
          dragActive ? 'border-violet-500 bg-violet-500/[0.03] scale-[0.99]' : 'border-white/[0.06]'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02),transparent_70%)] pointer-events-none" />
        
        <div className="flex items-center justify-between text-xs font-semibold text-white/60">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            <span>Describe UI or upload Figma design screenshot</span>
          </div>
          {dragActive && (
            <span className="text-[10px] text-violet-400 font-bold animate-pulse uppercase tracking-wider">
              Drop screenshot file here...
            </span>
          )}
        </div>

        {/* Floating Attachment Tray inside Search Tray */}
        {imagePreview && (
          <div className="flex items-center space-x-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl p-2 pr-3 max-w-max animate-fade-in shadow-lg">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center bg-black/40">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Search Attachment" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/80">Figma Screenshot</span>
              <span className="text-[8px] text-white/40">Attached to Prompt</span>
            </div>
            <button
              onClick={handleClear}
              className="text-white/40 hover:text-red-400 p-1 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
              title="Remove attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="relative flex items-center mt-1">
          {/* Hidden File Input */}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          <input
            type="text"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder={imagePreview ? "Describe custom layouts or modifications (optional)..." : "Describe layout details or drag-and-drop screenshot here..."}
            className="w-full px-5 py-4 pl-12 pr-64 rounded-2xl bg-black/40 hover:bg-black/55 focus:bg-black/60 border border-white/[0.08] focus:border-violet-500/40 focus:outline-none text-xs sm:text-sm text-white placeholder-white/20 transition-all font-medium shadow-inner"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleGenerateClick();
              }
            }}
          />
          <Sparkles className="absolute left-4 w-5 h-5 text-violet-400/80 animate-pulse" />
          
          {/* Right Action Tray nestled cleanly inside Input Bar */}
          <div className="absolute right-2 flex items-center space-x-2 select-none">
            {/* Model/Agent Selector Dropdown nested inside search bar */}
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              disabled={isLoading}
              className="bg-transparent border-none text-[9.5px] font-extrabold text-violet-400 focus:outline-none cursor-pointer pr-1 transition-colors hover:text-violet-300 max-w-[100px] truncate"
            >
              <option value="gemini-3.5-flash" className="bg-[#0c0d14] text-white">⚡ Gemini 3.5</option>
              <option value="gemini-3.1-pro" className="bg-[#0c0d14] text-white">🧠 Gemini 3.1 Pro</option>
              <option value="gemini-3.1-flash-lite" className="bg-[#0c0d14] text-white">⚡ Gemini Lite</option>
              <option value="gemini-2.5-pro" className="bg-[#0c0d14] text-white">🧠 Gemini 2.5 Pro</option>
              <option value="gemini-2.5-flash" className="bg-[#0c0d14] text-white">⚡ Gemini 2.5</option>
              <option value="claude-3-5-sonnet" className="bg-[#0c0d14] text-white">🔮 Claude Sonnet</option>
              <option value="claude-3-5-haiku" className="bg-[#0c0d14] text-white">🔮 Claude Haiku</option>
            </select>

            <div className="w-[1px] h-4 bg-white/10" />

            {/* Unified Upload Camera/Image Icon inside search bar */}
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isLoading}
              className="p-2 rounded-xl text-white/50 hover:text-violet-300 hover:bg-white/[0.04] active:scale-95 transition-all cursor-pointer"
              title="Attach screenshot design"
            >
              <ImageIcon className="w-4.5 h-4.5" />
            </button>

            {/* Glowing Ask Agent trigger button inside search bar */}
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || (!textPrompt.trim() && !imagePreview)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-[10px] sm:text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center space-x-1.5"
            >
              <span>Ask Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-col space-y-2 select-none pt-2 border-t border-white/[0.04] mt-2">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider pl-1">
            AI Prompt Suggestions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Glassmorphic Login Card', text: 'A premium dark glassmorphic login card with interactive inputs, glow borders, and transition indicators' },
              { label: 'Analytics Dashboard Grid', text: 'A clean SaaS metrics dashboard grid displaying revenue, server load, and dynamic growth graphs' },
              { label: 'Sidebar Navigation Menu', text: 'A responsive dashboard sidebar navigation including indicators, collapsible drawers, and user profiles' },
              { label: 'Interactive Form Wizard', text: 'A multi-step onboarding wizard layout with smooth button controls, visual icons, and status checks' }
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTextPrompt(chip.text)}
                className="px-2.5 py-1.5 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-violet-500/25 text-[10px] text-white/60 hover:text-violet-300 font-semibold transition-all duration-300 cursor-pointer active:scale-98"
              >
                💡 {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Context & Language Options Section */}
      <div className="flex flex-col space-y-5 animate-fade-in p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
        {/* Options Header */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-white/60">
          <Settings className="w-4 h-4 text-violet-400" />
          <span>Select Design Layout Context</span>
        </div>

        {/* Context Options Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { id: 'generic', label: 'Generic Component', desc: 'Buttons, Cards, inputs' },
            { id: 'landing_page', label: 'Landing Page', desc: 'Hero grids, forms, CTAs' },
            { id: 'dashboard', label: 'Dashboard UI', desc: 'Metric lists, sidebar, tabs' },
            { id: 'mobile_app', label: 'Mobile Screen', desc: 'Nav bar, touch targets' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedContext(option.id)}
              disabled={isLoading}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-300 ${
                selectedContext === option.id
                  ? 'border-violet-500/80 bg-violet-600/[0.08] text-white shadow-md shadow-violet-500/5'
                  : 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] hover:bg-white/[0.02] text-white/60'
              }`}
            >
              <span className="text-xs font-bold block truncate">{option.label}</span>
              <span className="text-[10px] opacity-60 mt-0.5 line-clamp-1 leading-snug">
                {option.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Language Selector */}
        <div className="flex flex-col space-y-2 pt-1 select-none">
          <label className="text-xs font-semibold text-white/60 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span>Target Programming Language / SDK</span>
          </label>
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3.5 rounded-xl bg-[#0b0c10]/95 hover:bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/40 text-xs font-bold text-white focus:outline-none transition-all cursor-pointer shadow-inner"
            >
              <optgroup label="Frontend Web Frameworks" className="bg-[#0c0d14] text-white">
                <option value="react">⚛️ React TSX (TypeScript + Tailwind)</option>
                <option value="vue">💚 Vue 3 SFC (Composition API + Tailwind)</option>
                <option value="svelte">🧡 Svelte Component (Svelte + Tailwind)</option>
                <option value="htmlcss">🌐 Vanilla HTML/CSS (Embedded Styles)</option>
              </optgroup>
              <optgroup label="Python Layouts" className="bg-[#0c0d14] text-white">
                <option value="python_tkinter">🐍 Python (Tkinter + ttk Styles)</option>
                <option value="python_pyqt">🐍 Python (PyQt5 QtWidgets + Stylesheets)</option>
              </optgroup>
              <optgroup label="Mobile SDKs" className="bg-[#0c0d14] text-white">
                <option value="flutter">💙 Flutter (Dart Widgets Layout)</option>
                <option value="swiftui">🍎 iOS SwiftUI (Swift Declarative)</option>
                <option value="kotlin">🤖 Kotlin (Android Jetpack Compose)</option>
              </optgroup>
              <optgroup label="System / Desktop Native" className="bg-[#0c0d14] text-white">
                <option value="rust">🦀 Rust (egui layout script)</option>
                <option value="java">☕ Java (Swing Components Layout)</option>
                <option value="csharp">🎯 C# (WPF Desktop XAML layout)</option>
                <option value="cpp">💎 C++ (Qt Desktop Widget application)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Generate Action Button */}
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || (!textPrompt.trim() && !imagePreview)}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span>Ask AI Agent to Generate UI</span>
          <ArrowRight className="w-4 h-4 text-white animate-pulse" />
        </button>
      </div>
    </div>
  );
}

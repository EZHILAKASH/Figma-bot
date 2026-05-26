import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Clipboard, Trash2, ArrowRight, Settings, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UploadSectionProps {
  onImageSelected: (base64Image: string) => void;
  onGenerate: (context: string) => void;
  isLoading: boolean;
}

export default function UploadSection({ onImageSelected, onGenerate, isLoading }: UploadSectionProps) {
  const { user, signInWithGoogle } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('generic');
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

  // Paste handler for quick clipboard support
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

  return (
    <div className="relative flex flex-col space-y-6 w-full max-w-2xl mx-auto p-1">
      {!user && (
        <div className="absolute inset-0 bg-[#06070a]/50 backdrop-blur-md border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center p-8 text-center z-20 animate-fade-in">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-fuchsia-500/30 border border-violet-500/30 text-white shadow-xl shadow-violet-500/10 mb-4 animate-pulse">
            <Upload className="w-7 h-7 text-violet-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Convert Design to React Code</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1.5 mb-6 leading-relaxed">
            Instantly translate your design screenshots into responsive, ready-to-use React components. Sign in with Google to get started.
          </p>
          <button
            onClick={signInWithGoogle}
            className="flex items-center space-x-2 py-3 px-6 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={`relative flex flex-col items-center justify-center min-h-[320px] rounded-2xl border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? 'border-violet-500 bg-violet-500/[0.04] scale-[0.99] shadow-lg shadow-violet-500/5'
            : imagePreview
            ? 'border-white/[0.08] bg-white/[0.01]'
            : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.03]'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {!imagePreview ? (
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/70 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Upload className="w-6 h-6 text-violet-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-white/90">
                Drag and drop your design or{' '}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="text-violet-400 hover:text-violet-300 font-bold underline underline-offset-2 hover:no-underline transition-colors"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-white/40">PNG, JPEG or WebP (max 20MB)</p>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[10px] text-white/50 font-medium">
              <Clipboard className="w-3 h-3 text-violet-400" />
              <span>Tip: Paste screenshot directly using Ctrl+V / Cmd+V</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
            {/* Visual Frame */}
            <div className="relative rounded-xl overflow-hidden border border-white/[0.08] max-h-[360px] max-w-full flex items-center justify-center shadow-2xl shadow-black/50">
              <img
                src={imagePreview}
                alt="Figma Screenshot Preview"
                className="max-h-[340px] max-w-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                <span className="px-3 py-1 text-xs text-white bg-black/60 rounded-full font-medium border border-white/[0.08] backdrop-blur-md">
                  Uploaded Screen
                </span>
              </div>
            </div>

            {/* Float Action Clear */}
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-lg bg-black/75 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all hover:scale-105 active:scale-95"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {imagePreview && (
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

          {/* Generate Action Button */}
          <button
            onClick={() => onGenerate(selectedContext)}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>Convert Design to React Code</span>
            <ArrowRight className="w-4 h-4 text-white animate-pulse" />
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import UploadSection from '@/components/UploadSection';
import LoadingState from '@/components/LoadingState';
import PreviewPane from '@/components/PreviewPane';
import CodeEditor from '@/components/CodeEditor';
import { parseGenerationResponse, getApiUrl } from '@/lib/utils';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [generatedLanguage, setGeneratedLanguage] = useState<string>('react');
  const [currentContext, setCurrentContext] = useState<string>('generic');
  const [codeCache, setCodeCache] = useState<Record<string, { code: string; explanation: string }>>({});

  const handleImageSelected = (base64Image: string) => {
    setUploadedImage(base64Image);
    setError(null);
  };

  const handleGenerate = async (context: string, language: string = 'react', textPrompt?: string) => {
    if (!uploadedImage && !textPrompt) return;
    if (!user) {
      setError('You must be signed in to convert designs to React components.');
      return;
    }

    setGeneratedLanguage(language);
    setCurrentContext(context);

    // If code for this language is already generated, load instantly from cache (unless a new prompt is specified)
    if (codeCache[language] && !textPrompt) {
      setGeneratedCode(codeCache[language].code);
      setExplanation(codeCache[language].explanation);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedCode('');
    setExplanation('');

    try {
      const response = await fetch(getApiUrl('/api/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage || null,
          context: context,
          model: selectedModel,
          language: language,
          prompt: textPrompt,
        }),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(`Server returned an invalid response (Status ${response.status}). Please check your server log.`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect to design parser server.');
      }

      const { code, explanation: generatedExplanation } = parseGenerationResponse(data.rawOutput);
      setGeneratedCode(code);
      setExplanation(generatedExplanation);
      
      // Save code and explanation to cache
      setCodeCache((prev) => ({
        ...prev,
        [language]: { code, explanation: generatedExplanation },
      }));
      
      // Satisfying Hackathon celebration
      triggerConfetti();
    } catch (err: unknown) {
      console.error(err);
      const errObj = err as Error | null;
      setError(errObj?.message || 'An error occurred while generating your component. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Confetti bursts
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setGeneratedCode('');
    setExplanation('');
    setError(null);
    setCodeCache({}); // Clear code cache on new design
  };

  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
    // Update the cache dynamically to ensure in-place edits are persisted when switching tabs
    setCodeCache((prev) => {
      if (!prev[generatedLanguage]) return prev;
      return {
        ...prev,
        [generatedLanguage]: { ...prev[generatedLanguage], code: newCode },
      };
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#06070a] text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Visual Stars Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />

      {/* Main Header */}
      <Header />

      <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full relative z-10">
        {!generatedCode ? (
          // Setup and Upload Mode
          <div className="flex-1 flex flex-col justify-center py-8">
            {error && (
              <div className="mb-6 flex items-start space-x-3 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-200 max-w-2xl mx-auto animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider">Parsing Failed</h4>
                  <p className="text-xs text-red-400/90 leading-relaxed font-mono">{error}</p>
                </div>
              </div>
            )}

            {isLoading ? (
              <LoadingState />
            ) : (
              <UploadSection
                onImageSelected={handleImageSelected}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            )}
          </div>
        ) : (
          // Split Screen Code Editor and Visual Sandbox Preview Mode
          <div className="flex-1 flex flex-col space-y-4 h-[calc(100vh-140px)] animate-fade-in">
            {/* Top Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-white/[0.04] space-y-3 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-bold text-white/70 hover:text-white transition-all active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Upload New Design</span>
                </button>

                {/* Workspace Target Language Dropdown Selector */}
                <div className="flex items-center space-x-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-2.5 py-1 text-slate-300">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider select-none">
                    Target:
                  </label>
                  <select
                    value={generatedLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      handleGenerate(currentContext, newLang);
                    }}
                    disabled={isLoading}
                    className="bg-transparent border-none text-[11px] font-extrabold text-violet-400 focus:outline-none cursor-pointer pr-1"
                  >
                    <optgroup label="Frontend Web Frameworks" className="bg-[#0c0d14] text-white font-semibold">
                      <option value="react">React TSX</option>
                      <option value="vue">Vue 3 SFC</option>
                      <option value="svelte">Svelte Component</option>
                      <option value="htmlcss">Vanilla HTML/CSS</option>
                    </optgroup>
                    <optgroup label="Python Layouts" className="bg-[#0c0d14] text-white font-semibold">
                      <option value="python_tkinter">Python Tkinter</option>
                      <option value="python_pyqt">Python PyQt5</option>
                    </optgroup>
                    <optgroup label="Mobile SDKs" className="bg-[#0c0d14] text-white font-semibold">
                      <option value="flutter">Flutter Dart</option>
                      <option value="swiftui">iOS SwiftUI</option>
                      <option value="kotlin">Kotlin Compose</option>
                    </optgroup>
                    <optgroup label="System / Desktop Native" className="bg-[#0c0d14] text-white font-semibold">
                      <option value="rust">Rust egui</option>
                      <option value="java">Java Swing</option>
                      <option value="csharp">C# WPF XAML</option>
                      <option value="cpp">C++ Qt Widget</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Success! {generatedLanguage === 'react' ? 'React' : generatedLanguage.toUpperCase().replace('_', ' ')} Code Active</span>
                </div>
              </div>
            </div>

            {/* Split Screen Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
              {/* Left Sandbox Preview */}
              <div className="h-full min-h-0">
                <PreviewPane code={generatedCode} language={generatedLanguage} />
              </div>

              {/* Right Code Editor */}
              <div className="h-full min-h-0">
                <CodeEditor 
                  code={generatedCode} 
                  onChange={handleCodeChange} 
                  explanation={explanation} 
                  selectedModel={selectedModel}
                  language={generatedLanguage}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

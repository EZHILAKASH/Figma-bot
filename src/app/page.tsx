'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Header from '@/components/Header';
import UploadSection from '@/components/UploadSection';
import LoadingState from '@/components/LoadingState';
import PreviewPane from '@/components/PreviewPane';
import CodeEditor from '@/components/CodeEditor';
import { extractCodeFromResponse } from '@/lib/utils';
import { ArrowLeft, Sparkles, RefreshCw, AlertCircle, Cpu } from 'lucide-react';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (base64Image: string) => {
    setUploadedImage(base64Image);
    setError(null);
  };

  const handleGenerate = async (context: string) => {
    if (!uploadedImage) return;

    setIsLoading(true);
    setError(null);
    setGeneratedCode('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          context: context,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect to design parser server.');
      }

      const extractedCode = extractCodeFromResponse(data.rawOutput);
      setGeneratedCode(extractedCode);
      
      // Satisfying Hackathon celebration
      triggerConfetti();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating your component. Please try again.');
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
    setError(null);
  };

  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
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
              />
            )}
          </div>
        ) : (
          // Split Screen Code Editor and Visual Sandbox Preview Mode
          <div className="flex-1 flex flex-col space-y-4 h-[calc(100vh-140px)] animate-fade-in">
            {/* Top Workspace Bar */}
            <div className="flex items-center justify-between pb-2">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-bold text-white/70 hover:text-white transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Upload New Design</span>
              </button>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Success! React Code Generated</span>
                </div>
              </div>
            </div>

            {/* Split Screen Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
              {/* Left Sandbox Preview */}
              <div className="h-full min-h-0">
                <PreviewPane code={generatedCode} />
              </div>

              {/* Right Code Editor */}
              <div className="h-full min-h-0">
                <CodeEditor code={generatedCode} onChange={handleCodeChange} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

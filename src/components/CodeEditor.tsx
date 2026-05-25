import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download, RefreshCw, FileCode, BookOpen, Compass } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  explanation?: string;
}

export default function CodeEditor({ code, onChange, explanation }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'explanation'>('code');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code to clipboard', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/typescript-jsx' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedComponent.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Safe inline formatter for backticks `code` and bold **text**
  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-xs text-violet-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // High-fidelity custom markdown parser for the explanation tab
  const renderExplanation = (markdownText: string) => {
    if (!markdownText) return null;
    
    const lines = markdownText.split('\n');
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-210px)] select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;
          
          // Handle Headings (e.g. ## Title)
          if (trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('# ')) {
            const text = trimmed.replace(/^#+\s+/, '');
            return (
              <h3 key={idx} className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mt-6 mb-2 border-b border-white/[0.04] pb-2 uppercase tracking-wider flex items-center space-x-2">
                <Compass className="w-4 h-4 text-violet-400 mr-1.5 inline-block" />
                <span>{text}</span>
              </h3>
            );
          }
          
          // Handle Bold lists: - **Item**: text or * **Item**: text
          if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
            const match = trimmed.match(/^[-*]\s+\*\*(.*?)\*\*:(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start space-x-2.5 pl-3 leading-relaxed">
                  <span className="text-violet-400 mt-1.5 flex-shrink-0 text-xs">•</span>
                  <p className="text-slate-300 text-sm">
                    <strong className="text-white font-bold">{match[1]}:</strong>
                    <span className="text-slate-300/90 pl-1">{parseInlineStyles(match[2])}</span>
                  </p>
                </div>
              );
            }
          }
          
          // Handle Standard lists
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const text = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start space-x-2.5 pl-3 leading-relaxed">
                <span className="text-fuchsia-400 mt-1.5 flex-shrink-0 text-xs">•</span>
                <p className="text-slate-300/90 text-sm">{parseInlineStyles(text)}</p>
              </div>
            );
          }
          
          // Standard text paragraph
          return (
            <p key={idx} className="text-slate-300/80 text-sm leading-relaxed pl-1">
              {parseInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black/20 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Bar Actions & Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex-shrink-0 min-h-[52px]">
        {/* Workspace Selector Tabs */}
        <div className="flex items-center space-x-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 select-none">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'code'
                ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                : 'border border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>React Code</span>
          </button>
          
          {explanation && (
            <button
              onClick={() => setActiveTab('explanation')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'explanation'
                  ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                  : 'border border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>AI Explanation</span>
            </button>
          )}
        </div>

        {/* Global actions */}
        <div className="flex items-center space-x-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.06] text-white/60 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/80 to-fuchsia-500/80 hover:from-violet-600 hover:to-fuchsia-500 border border-violet-500/30 hover:border-violet-500/40 text-xs font-bold text-white transition-all active:scale-95 shadow-md shadow-violet-500/5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Editor or Explanation Viewport */}
      {activeTab === 'code' ? (
        <div className="flex-1 min-h-[350px] relative bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            language="typescript"
            theme="vs-dark"
            value={code}
            onChange={(val) => onChange(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "JetBrains Mono, Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
              lineHeight: 20,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              padding: { top: 16, bottom: 16 },
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            loading={
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white/40">
                <RefreshCw className="w-4 h-4 animate-spin mr-2 text-violet-400" />
                Initializing Editor...
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex-1 min-h-[350px] bg-[#0b0c10] flex flex-col border-t border-white/[0.04]">
          {renderExplanation(explanation || '')}
        </div>
      )}
    </div>
  );
}

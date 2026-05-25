import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download, RefreshCw, FileCode } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex flex-col h-full bg-black/20 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Bar Actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center space-x-2 text-white/50 text-[11px] font-bold tracking-wide uppercase">
          <FileCode className="w-3.5 h-3.5 text-violet-400" />
          <span>React TSX Code</span>
        </div>

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

      {/* Editor viewport */}
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
    </div>
  );
}

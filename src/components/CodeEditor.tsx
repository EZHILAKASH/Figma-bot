import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download, RefreshCw, FileCode, BookOpen, Compass, MessageSquare, Send, Sparkles, AlertCircle } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  explanation?: string;
  selectedModel?: string;
  language?: string;
}

const promptChips = [
  { label: 'Simplify Grid Layout', text: 'How can I simplify the grid layout in my component using the cleanest Tailwind classes?' },
  { label: 'Explain Spacing/Padding', text: 'Can you explain the current spacing/padding system in my component and how to make it more cohesive?' },
  { label: 'Make Container Glassmorphic', text: 'Suggest the simplest code changes to make the main container of my component glassmorphic.' },
  { label: 'Check UI Mobile A11y', text: 'Is my component fully accessible and responsive on mobile viewports? Suggest any simple improvements.' }
];

function ChatCodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0d14]/90 shadow-2xl relative select-text">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-mono text-white/40 select-none">
        <span>{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      {/* Code Pre */}
      <pre className="p-4 text-xs font-mono text-violet-200/90 overflow-x-auto whitespace-pre leading-relaxed">
        {code.trim()}
      </pre>
    </div>
  );
}

export default function CodeEditor({ code, onChange, explanation, selectedModel, language }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'explanation' | 'assistant'>('code');

  const getMonacoLanguage = () => {
    if (!language) return 'typescript';
    if (language === 'react') return 'typescript';
    if (language === 'vue' || language === 'svelte' || language === 'htmlcss') return 'html';
    if (language.startsWith('python')) return 'python';
    if (language === 'kotlin') return 'kotlin';
    if (language === 'flutter') return 'typescript';
    if (language === 'swiftui') return 'swift';
    if (language === 'rust') return 'rust';
    if (language === 'java') return 'java';
    if (language === 'csharp') return 'xml';
    if (language === 'cpp') return 'cpp';
    return 'typescript';
  };
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hi! I am your **FrameFlow AI Assistant**! 🎨 Let's perfect your UI design and code together.

I have full, live context of the React component rendering on your screen. Here is how I can assist you:
- **Clear UI Design Doubts**: Query modern layout aesthetics, standard responsive viewport grids, WCAG color contrast, and design systems.
- **Build & Customize Code**: Direct me to write clean sections, add responsive layouts, or build custom Tailwind modules.
- **Simplest Way suggestion**: Unsure about layout complexity? Ask me for the simplest, cleanest way to achieve any layout alignment goal!

*Try clicking one of the quick suggestions below to start!*`
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'assistant') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, activeTab]);

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

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim() || isChatLoading) return;

    const newUserMsg = { role: 'user' as const, content: text };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    if (!textToSend) setUserInput('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          code: code,
          model: selectedModel,
        }),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(`Chat server returned an invalid response (Status ${response.status}).`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect to design chatbot server.');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'An error occurred while communicating with the model. Please check keys.');
    } finally {
      setIsChatLoading(false);
    }
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

  const renderBubbleText = (markdownText: string) => {
    if (!markdownText) return null;
    const lines = markdownText.split('\n');
    return (
      <div className="space-y-2 select-text text-slate-300 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;
          
          // Headings (e.g. ## Title)
          if (trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('# ')) {
            const text = trimmed.replace(/^#+\s+/, '');
            return (
              <h4 key={idx} className="text-xs font-bold text-violet-400 mt-3 mb-1 uppercase tracking-wider flex items-center">
                <Compass className="w-3.5 h-3.5 text-violet-400 mr-1 flex-shrink-0" />
                <span>{text}</span>
              </h4>
            );
          }
          
          // Bold lists
          if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
            const match = trimmed.match(/^[-*]\s+\*\*(.*?)\*\*:(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start space-x-1.5 pl-1.5">
                  <span className="text-violet-400 mt-1 flex-shrink-0 text-[10px]">•</span>
                  <p className="text-slate-300">
                    <strong className="text-white font-bold">{match[1]}:</strong>
                    <span className="text-slate-300/90 pl-1">{parseInlineStyles(match[2])}</span>
                  </p>
                </div>
              );
            }
          }
          
          // Standard lists
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const text = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start space-x-1.5 pl-1.5">
                <span className="text-fuchsia-400 mt-1 flex-shrink-0 text-[10px]">•</span>
                <p className="text-slate-300/90">{parseInlineStyles(text)}</p>
              </div>
            );
          }
          
          return (
            <p key={idx} className="text-slate-300/80">
              {parseInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderChatContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : 'tsx';
        const rawCode = match ? match[2] : part.slice(3, -3);

        return <ChatCodeBlock key={idx} code={rawCode} language={language} />;
      } else {
        return <div key={idx}>{renderBubbleText(part)}</div>;
      }
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
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              activeTab === 'code'
                ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300 font-extrabold'
                : 'border border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>
              {language === 'react' ? 'React Code'
                : language === 'vue' ? 'Vue Code'
                : language === 'svelte' ? 'Svelte Code'
                : language === 'htmlcss' ? 'HTML/CSS'
                : language === 'python_tkinter' ? 'Python Tkinter'
                : language === 'python_pyqt' ? 'Python PyQt5'
                : language === 'flutter' ? 'Flutter Code'
                : language === 'swiftui' ? 'SwiftUI Code'
                : language === 'kotlin' ? 'Kotlin Compose'
                : language === 'rust' ? 'Rust Code'
                : language === 'java' ? 'Java Swing'
                : language === 'csharp' ? 'C# WPF XAML'
                : language === 'cpp' ? 'C++ Qt Code'
                : 'Generated Code'}
            </span>
          </button>
          
          {explanation && (
            <button
              onClick={() => setActiveTab('explanation')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === 'explanation'
                  ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300 font-extrabold'
                  : 'border border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>AI Explanation</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              activeTab === 'assistant'
                ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300 font-extrabold'
                : 'border border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>
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

      {/* Editor or Explanation or Chat Assistant Viewport */}
      {activeTab === 'code' ? (
        <div className="flex-1 min-h-[350px] relative bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage={getMonacoLanguage()}
            language={getMonacoLanguage()}
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
      ) : activeTab === 'explanation' ? (
        <div className="flex-1 min-h-[350px] bg-[#0b0c10] flex flex-col border-t border-white/[0.04]">
          {renderExplanation(explanation || '')}
        </div>
      ) : (
        <div className="flex-1 min-h-[350px] bg-[#0b0c10] flex flex-col border-t border-white/[0.04] overflow-hidden">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-270px)] select-text">
            {messages.map((msg, index) => {
              const isAI = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] ${
                    isAI ? 'self-start items-start' : 'self-end items-end ml-auto'
                  } space-y-1 animate-fade-in`}
                >
                  <div className={`flex items-center space-x-1.5 text-[9px] sm:text-[10px] text-white/30 font-bold select-none ${isAI ? 'pl-1' : 'pr-1'}`}>
                    {isAI ? (
                      <>
                        <Sparkles className="w-3 h-3 text-violet-400" />
                        <span>FRAMEFLOW AI</span>
                      </>
                    ) : (
                      <span>YOU</span>
                    )}
                  </div>

                  <div
                    className={`px-4 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm shadow-lg ${
                      isAI
                        ? 'bg-violet-600/[0.04] border-violet-500/10 text-slate-200 rounded-tl-sm'
                        : 'bg-white/[0.03] border-white/[0.06] text-white rounded-tr-sm'
                    }`}
                  >
                    {isAI ? renderChatContent(msg.content) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex flex-col max-w-[80%] self-start items-start space-y-1 animate-pulse">
                <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] text-white/30 font-bold">
                  <Sparkles className="w-3 h-3 text-violet-400 animate-spin" />
                  <span>AI IS THINKING...</span>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-violet-500/10 bg-violet-600/[0.04] flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {chatError && (
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-200 text-xs flex items-start space-x-2 animate-bounce">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h5 className="font-bold">Chat Session Blocked</h5>
                  <p className="text-red-400/80 leading-relaxed font-mono text-[9px]">{chatError}</p>
                </div>
              </div>
            )}

            {/* Welcome quick suggestions chips */}
            {messages.length === 1 && !isChatLoading && (
              <div className="flex flex-col space-y-2 mt-2 select-none">
                <span className="text-[9px] font-bold text-white/30 px-1 uppercase tracking-wider">Quick Suggestions</span>
                <div className="flex flex-wrap gap-1.5">
                  {promptChips.map((chip, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(chip.text)}
                      className="px-2.5 py-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] hover:border-violet-500/20 text-[10px] text-white/70 hover:text-violet-300 font-semibold text-left transition-all active:scale-98 cursor-pointer shadow-sm select-none"
                    >
                      💡 {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Footer Input Area */}
          <div className="p-3 bg-[#08090d] border-t border-white/[0.06] flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Ask Gemini or Claude about this screen...`}
                disabled={isChatLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/40 focus:outline-none text-xs text-white placeholder-white/20 transition-all font-medium disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isChatLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 border border-violet-500/30 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/5"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Monitor, Tablet, Smartphone, AlertCircle, Copy, Check, Sparkles, Code, X } from 'lucide-react';

interface PreviewPaneProps {
  code: string;
}

interface SelectedElement {
  tagName: string;
  classes: string;
  textContent: string;
  type: 'button' | 'card' | 'input' | 'nav' | 'image' | 'generic';
}

export default function PreviewPane({ code }: PreviewPaneProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [compileError, setCompileError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // to force reload iframe
  const [status, setStatus] = useState<'idle' | 'compiling' | 'ready' | 'error'>('idle');
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'neo' | 'glass' | 'neumorph'>('current');
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Debounced code compiler
  const [debouncedCode, setDebouncedCode] = useState(code);
  const [prevCode, setPrevCode] = useState(code);

  if (code !== prevCode) {
    setPrevCode(code);
    setStatus('compiling');
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCode(code);
    }, 600);

    return () => clearTimeout(handler);
  }, [code]);

  // Handle messages sent from the iframe (e.g. runtime errors, success signals, and click intercepts)
  useEffect(() => {
    const handleIframeMessage = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.type === 'IFRAME_ERROR') {
          setCompileError(e.data.message);
          setStatus('error');
        } else if (e.data.type === 'IFRAME_READY') {
          setCompileError(null);
          setStatus('ready');
        } else if (e.data.type === 'SANDBOX_ELEMENT_CLICKED') {
          const { tagName, classes, textContent } = e.data.element;
          
          // Determine the component type
          let type: 'button' | 'card' | 'input' | 'nav' | 'image' | 'generic' = 'generic';
          const lowerClass = classes.toLowerCase();
          const lowerTag = tagName.toLowerCase();

          if (lowerTag === 'button' || lowerClass.includes('btn') || lowerClass.includes('button')) {
            type = 'button';
          } else if (lowerClass.includes('card') || (lowerClass.includes('shadow-') && (lowerClass.includes('bg-') || lowerClass.includes('border-')))) {
            type = 'card';
          } else if (lowerTag === 'input' || lowerTag === 'textarea' || lowerTag === 'select' || lowerClass.includes('input') || lowerClass.includes('form-')) {
            type = 'input';
          } else if (lowerTag === 'nav' || lowerTag === 'header' || lowerClass.includes('nav') || lowerClass.includes('header') || lowerClass.includes('navbar')) {
            type = 'nav';
          } else if (lowerTag === 'img' || lowerClass.includes('avatar') || lowerClass.includes('image')) {
            type = 'image';
          }

          setSelectedElement({ tagName, classes, textContent, type });
          setActiveTab('current');
          setCopied(false);
        }
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
    setCompileError(null);
    setStatus('compiling');
  };

  const getViewportWidth = () => {
    if (viewport === 'mobile') return 'max-w-[375px]';
    if (viewport === 'tablet') return 'max-w-[768px]';
    return 'max-w-full';
  };

  // Construct iframe content
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Load React, Babel, and Tailwind CDN -->
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        
        <script>
          // Configure Tailwind (Tailwind CDN v3 config)
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  primary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                  }
                }
              }
            }
          }
        </script>
        
        <style>
          body {
            margin: 0;
            padding: 24px;
            background-color: #0d0e12;
            color: #ffffff;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          /* Custom scrollbars inside preview */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.02);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.2);
          }
          /* Subtle outline on hover to make it feel inspectable */
          *:not(#root):not(body):not(html):hover {
            outline: 2px dashed rgba(139, 92, 246, 0.45) !important;
            outline-offset: 1px !important;
            cursor: pointer !important;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>

        <script>
          // Catch uncaught errors
          window.onerror = function(message, source, lineno, colno, error) {
            console.error(error);
            window.parent.postMessage({ 
              type: 'IFRAME_ERROR', 
              message: message + (lineno ? ' (Line ' + lineno + ')' : '')
            }, '*');
          };

          // Click handler to inspect elements and notify parent frame
          document.addEventListener('click', (e) => {
            // Prevent actual actions in the preview sandbox
            e.preventDefault();
            e.stopPropagation();

            const target = e.target;
            if (!target || target === document.body || target === document.documentElement) return;

            const tagName = target.tagName.toLowerCase();
            const classes = target.className || '';
            const textContent = (target.textContent || '').substring(0, 30).trim();

            window.parent.postMessage({
              type: 'SANDBOX_ELEMENT_CLICKED',
              element: {
                tagName: tagName,
                classes: classes,
                textContent: textContent
              }
            }, '*');
          }, true); // Use capture phase

          // Setup CommonJS environment & Lucide Icons Proxy mockup
          window.exports = {};
          
          window.require = function(moduleName) {
            if (moduleName === 'react') return window.React;
            if (moduleName === 'react-dom') return window.ReactDOM;
            if (moduleName === 'lucide-react') {
              // Return Proxy Mockup for Lucide Icons that supports ES Module interop
              const lucideProxy = new Proxy({}, {
                get: (target, name) => {
                  if (name === '__esModule') return true;
                  if (name === 'default') return lucideProxy;
                  
                  return (props) => {
                    const size = props.size || 20;
                    const strokeWidth = props.strokeWidth || 2;
                    const color = props.color || 'currentColor';
                    const className = props.className || '';
                    
                    // Render simple placeholder box inside SVG
                    return React.createElement(
                      'svg',
                      {
                        xmlns: 'http://www.w3.org/2000/svg',
                        width: size,
                        height: size,
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: color,
                        strokeWidth: strokeWidth,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        className: 'lucide lucide-' + (typeof name === 'string' ? name.toLowerCase() : '') + ' ' + className,
                        ...props
                      },
                      React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
                      React.createElement('path', { d: 'M8 12h8' }),
                      React.createElement('path', { d: 'M12 8v8' })
                    );
                  };
                }
              });
              return lucideProxy;
            }
            return {};
          };
        </script>

        <script type="text/javascript">
          // Custom compile and run routine
          function compileAndRender() {
            try {
              const codeString = ${JSON.stringify(debouncedCode)};
              
              // Transpiling TypeScript / JSX using Babel Standalone
              const compiled = Babel.transform(codeString, {
                presets: ['env', 'react', 'typescript'],
                filename: 'component.tsx'
              }).code;
              
              // Evaluate transpiled script
              const runScript = new Function(compiled);
              runScript();
              
              // Extract default export or named export
              let ComponentToRender = window.exports.default;
              if (!ComponentToRender) {
                for (const key in window.exports) {
                  if (typeof window.exports[key] === 'function') {
                    ComponentToRender = window.exports[key];
                    break;
                  }
                }
              }
              
              if (!ComponentToRender) {
                throw new Error("No default export or React component found. Ensure you exported a default function.");
              }
              
              const rootEl = document.getElementById('root');
              ReactDOM.createRoot(rootEl).render(React.createElement(ComponentToRender));
              
              // Signal successful render completion
              window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
            } catch (err) {
              window.parent.postMessage({ 
                type: 'IFRAME_ERROR', 
                message: err.message
              }, '*');
            }
          }
          
          // Wait for Babel to be ready, then transpile
          window.addEventListener('load', () => {
            setTimeout(compileAndRender, 50);
          });
        </script>
      </body>
    </html>
  `;

  const getStatusBadge = () => {
    switch (status) {
      case 'compiling':
        return (
          <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 select-none animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>COMPILING</span>
          </div>
        );
      case 'ready':
        return (
          <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 select-none animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>BLOCKED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-bold text-white/40 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span>IDLE</span>
          </div>
        );
    }
  };

  const getAlternates = () => {
    if (!selectedElement) return { current: '', neo: '', glass: '', neumorph: '' };

    const label = selectedElement.textContent || 'Element';
    const classes = selectedElement.classes;

    switch (selectedElement.type) {
      case 'button':
        return {
          current: `<button className="${classes}">\n  ${label}\n</button>`,
          neo: `<button className="px-5 py-2.5 rounded-lg bg-violet-400 border-3 border-black font-extrabold text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer">\n  ${label}\n</button>`,
          glass: `<button className="px-5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 hover:text-white font-medium backdrop-blur-md shadow-lg transition-all active:scale-98 cursor-pointer">\n  ${label}\n</button>`,
          neumorph: `<button className="px-5 py-2.5 rounded-xl bg-[#0e0f14] text-white/80 shadow-[5px_5px_10px_#050608,-5px_-5px_10px_#171820] hover:shadow-[inset_2px_2px_5px_#050608,inset_-2px_-2px_5px_#171820] transition-all duration-300 cursor-pointer">\n  ${label}\n</button>`
        };
      case 'card':
        return {
          current: `<div className="${classes}">\n  <h3>${label}</h3>\n  <p>Card Content...</p>\n</div>`,
          neo: `<div className="p-6 rounded-xl bg-white border-3 border-black text-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] transition-all">\n  <h3 className="text-lg font-black uppercase tracking-wider mb-2">${label}</h3>\n  <p className="text-sm font-semibold text-slate-700">Premium neo-brutalist card layouts for bold interfaces.</p>\n</div>`,
          glass: `<div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl relative overflow-hidden">\n  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />\n  <h3 className="text-base font-bold text-white tracking-tight mb-2">${label}</h3>\n  <p className="text-xs text-white/50 leading-relaxed">Frosted glass structures with white edge highlight gradients.</p>\n</div>`,
          neumorph: `<div className="p-6 rounded-2xl bg-[#0e0f14] shadow-[10px_10px_20px_#040507,-10px_-10px_20px_#181921] border border-white/[0.01]">\n  <h3 className="text-base font-bold text-white/90 mb-2">${label}</h3>\n  <p className="text-xs text-white/40 leading-relaxed">Soft extruded interfaces leveraging ambient, volumetric drop shadows.</p>\n</div>`
        };
      case 'input':
        return {
          current: `<input type="text" className="${classes}" placeholder="${label || 'Enter text...'}" />`,
          neo: `<input type="text" className="w-full px-4 py-3 rounded-lg bg-white border-3 border-black text-black font-semibold shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:shadow-[5px_5px_0px_0px_#000] transition-all placeholder:text-black/40" placeholder="${label || 'Enter text...'}" />`,
          glass: `<div className="relative w-full">\n  <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-violet-500/40 text-white placeholder-white/20 focus:outline-none transition-all" placeholder="${label || 'Enter text...'}" />\n</div>`,
          neumorph: `<input type="text" className="w-full px-4 py-3 rounded-xl bg-[#0b0c10] text-white/80 shadow-[inset_3px_3px_6px_#040406,inset_-3px_-3px_6px_#12141a] focus:outline-none placeholder-white/10" placeholder="${label || 'Enter text...'}" />`
        };
      case 'nav':
        return {
          current: `<nav className="${classes}">\n  <span>${label || 'Navigation'}</span>\n</nav>`,
          neo: `<nav className="flex items-center justify-between p-4 rounded-xl bg-[#fcd34d] border-3 border-black text-black font-extrabold shadow-[4px_4px_0px_0px_#000]">\n  <span className="text-sm uppercase tracking-wider">${label || 'Navigation'}</span>\n  <div className="flex space-x-3 text-xs">\n    <a href="#" className="underline">Home</a>\n    <a href="#" className="underline">Docs</a>\n  </div>\n</nav>`,
          glass: `<nav className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/[0.08] backdrop-blur-xl shadow-lg">\n  <span className="text-xs font-bold text-white tracking-wide uppercase">${label || 'Navigation'}</span>\n  <div className="flex space-x-4 text-[11px] text-white/60 font-semibold">\n    <a href="#" className="hover:text-white transition-colors">Home</a>\n    <a href="#" className="hover:text-white transition-colors">Docs</a>\n  </div>\n</nav>`,
          neumorph: `<nav className="flex items-center justify-between p-4 rounded-xl bg-[#0e0f14] shadow-[6px_6px_12px_#050608,-6px_-6px_12px_#171820]">\n  <span className="text-xs font-bold text-white/80">${label || 'Navigation'}</span>\n  <div className="flex space-x-4 text-[11px] text-white/40">\n    <a href="#" className="hover:text-white/80 transition-colors">Home</a>\n    <a href="#" className="hover:text-white/80 transition-colors">Docs</a>\n  </div>\n</nav>`
        };
      case 'image':
        return {
          current: `<img src="/api/placeholder" className="${classes}" alt="${label || 'Visual preview'}" />`,
          neo: `<div className="relative rounded-lg overflow-hidden border-3 border-black shadow-[4px_4px_0px_0px_#000]">\n  <img src="/api/placeholder" className="w-full object-cover" alt="Neo-Brutalist Visual" />\n</div>`,
          glass: `<div className="relative rounded-2xl overflow-hidden border border-white/[0.1] backdrop-blur-xl p-1 bg-white/[0.02] shadow-2xl">\n  <img src="/api/placeholder" className="rounded-xl w-full object-cover" alt="Glass Visual" />\n  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />\n</div>`,
          neumorph: `<div className="rounded-2xl overflow-hidden p-3 bg-[#0e0f14] shadow-[8px_8px_16px_#040507,-8px_-8px_16px_#181921]">\n  <img src="/api/placeholder" className="rounded-xl w-full object-cover shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]" alt="Neumorphic Visual" />\n</div>`
        };
      default:
        return {
          current: `<div className="${classes}">\n  ${label}\n</div>`,
          neo: `<div className="p-5 rounded-lg bg-[#a78bfa]/10 border-3 border-black text-black font-bold shadow-[4px_4px_0px_0px_#000]">\n  <span className="uppercase text-xs tracking-wider">${label || 'Layout Block'}</span>\n</div>`,
          glass: `<div className="p-5 rounded-xl bg-white/[0.01] border border-white/[0.06] backdrop-blur-md shadow-inner text-white/70">\n  <span className="text-xs font-medium">${label || 'Glass Layout'}</span>\n</div>`,
          neumorph: `<div className="p-5 rounded-xl bg-[#0e0f14] shadow-[inset_4px_4px_8px_#050608,inset_-4px_-4px_8px_#171820] text-white/40">\n  <span className="text-xs">${label || 'Neumorphic Block'}</span>\n</div>`
        };
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Pane Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex-shrink-0 animate-fade-in">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] font-bold text-white/50 pl-1 select-none tracking-wide uppercase">
            Visual Sandbox
          </span>
          {getStatusBadge()}
        </div>

        {/* Viewports */}
        <div className="flex items-center space-x-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewport === 'desktop' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewport === 'tablet' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'
            }`}
            title="Tablet view"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewport === 'mobile' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'
            }`}
            title="Mobile viewport"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actions */}
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center p-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] text-white/60 hover:text-white transition-all active:scale-95 cursor-pointer"
          title="Reload Sandbox"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 bg-[#090a0f] p-4 flex items-center justify-center overflow-auto relative">
        {compileError ? (
          <div className="flex flex-col items-center justify-center max-w-md p-6 rounded-xl bg-red-950/20 border border-red-500/20 text-center space-y-3 shadow-lg shadow-red-950/50 animate-fade-in z-20 animate-fade-in">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <h4 className="text-sm font-bold text-red-200">Sandbox Rendering Blocked</h4>
            <p className="text-xs text-red-400/90 leading-relaxed font-mono text-left break-words overflow-auto max-h-40 w-full p-2 bg-red-950/40 rounded-lg">
              {compileError}
            </p>
            <p className="text-[10px] text-white/30 italic">
              Fix compilation issues in the code editor on the right.
            </p>
          </div>
        ) : null}

        {/* Sandboxed Iframe Preview */}
        <div
          className={`w-full h-full rounded-xl overflow-hidden border border-white/[0.04] bg-[#0d0e12] shadow-inner transition-all duration-300 flex items-center justify-center relative ${getViewportWidth()} ${
            compileError ? 'opacity-20 blur-sm pointer-events-none' : ''
          }`}
        >
          {status === 'compiling' && (
            <div className="absolute inset-0 bg-[#0d0e12]/60 backdrop-blur-[2px] flex items-center justify-center z-10 animate-fade-in">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/85 border border-white/[0.08] text-xs font-bold text-violet-400 shadow-2xl">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                <span>Compiling changes...</span>
              </div>
            </div>
          )}
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={iframeSrcDoc}
            className="w-full h-full bg-[#0d0e12]"
            sandbox="allow-scripts allow-modals"
            title="Design Component Preview"
          />
        </div>
      </div>

      {/* Inspected Element Alternates Drawer */}
      {selectedElement && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-[#0c0d14]/95 border-t border-white/[0.08] backdrop-blur-xl shadow-2xl p-4 flex flex-col max-h-[50%] animate-fade-in">
          {/* Drawer header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-white/90">
                Interactive Inspector: <span className="text-violet-400 font-mono">&lt;{selectedElement.tagName}&gt;</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/50 border border-white/[0.06] font-semibold uppercase">
                {selectedElement.type} component
              </span>
            </div>
            
            <button
              onClick={() => setSelectedElement(null)}
              className="text-white/40 hover:text-white/80 p-1 hover:bg-white/[0.04] rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Drawer content layout */}
          <div className="flex-1 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 min-h-0">
            {/* Left side: Tabs selector */}
            <div className="w-full md:w-44 flex flex-row md:flex-col space-x-1.5 md:space-x-0 md:space-y-1.5 flex-shrink-0">
              <button
                onClick={() => { setActiveTab('current'); setCopied(false); }}
                className={`flex-1 md:flex-none flex items-center space-x-1.5 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'current' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-300 font-bold' : 'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] text-white/60 hover:text-white/80'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Selected Markup</span>
              </button>
              <button
                onClick={() => { setActiveTab('neo'); setCopied(false); }}
                className={`flex-1 md:flex-none flex items-center space-x-1.5 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'neo' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-300 font-bold' : 'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] text-white/60 hover:text-white/80'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span>Neo-Brutalist</span>
              </button>
              <button
                onClick={() => { setActiveTab('glass'); setCopied(false); }}
                className={`flex-1 md:flex-none flex items-center space-x-1.5 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'glass' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-300 font-bold' : 'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] text-white/60 hover:text-white/80'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Glassmorphism</span>
              </button>
              <button
                onClick={() => { setActiveTab('neumorph'); setCopied(false); }}
                className={`flex-1 md:flex-none flex items-center space-x-1.5 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'neumorph' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-300 font-bold' : 'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] text-white/60 hover:text-white/80'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                <span>Neumorphism</span>
              </button>
            </div>

            {/* Right side: Code viewer */}
            <div className="flex-1 flex flex-col min-h-0 bg-black/45 rounded-xl border border-white/[0.06] overflow-hidden relative group">
              {/* Copy button */}
              <button
                onClick={() => copyToClipboard(getAlternates()[activeTab])}
                className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] text-[10px] font-bold text-white/70 hover:text-white transition-all active:scale-95 cursor-pointer"
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

              {/* Code text block */}
              <pre className="flex-1 p-4 text-[10px] font-mono text-violet-200/90 leading-relaxed overflow-auto select-all max-h-[160px] whitespace-pre-wrap">
                {getAlternates()[activeTab]}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

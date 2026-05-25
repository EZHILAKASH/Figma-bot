import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Monitor, Tablet, Smartphone, AlertCircle } from 'lucide-react';

interface PreviewPaneProps {
  code: string;
}

export default function PreviewPane({ code }: PreviewPaneProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [compileError, setCompileError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // to force reload iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Debounced code compiler
  const [debouncedCode, setDebouncedCode] = useState(code);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCode(code);
      setCompileError(null);
    }, 600);

    return () => clearTimeout(handler);
  }, [code]);

  // Handle messages sent from the iframe (e.g. runtime errors)
  useEffect(() => {
    const handleIframeMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'IFRAME_ERROR') {
        setCompileError(e.data.message);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
    setCompileError(null);
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
            return true;
          };

          // Setup CommonJS environment & Lucide Icons Proxy mockup
          window.exports = {};
          
          window.require = function(moduleName) {
            if (moduleName === 'react') return window.React;
            if (moduleName === 'react-dom') return window.ReactDOM;
            if (moduleName === 'lucide-react') {
              // Return Proxy Mockup for Lucide Icons
              return new Proxy({}, {
                get: (target, name) => {
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
                        className: 'lucide lucide-' + name.toLowerCase() + ' ' + className,
                        ...props
                      },
                      React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
                      React.createElement('path', { d: 'M8 12h8' }),
                      React.createElement('path', { d: 'M12 8v8' })
                    );
                  };
                }
              });
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
                presets: ['react', 'typescript'],
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

  return (
    <div className="flex flex-col h-full bg-black/20 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
      {/* Pane Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="text-[11px] font-bold text-white/50 pl-2 select-none tracking-wide uppercase">
            Visual Sandbox
          </span>
        </div>

        {/* Viewports */}
        <div className="flex items-center space-x-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-md transition-colors ${
              viewport === 'desktop' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-md transition-colors ${
              viewport === 'tablet' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'
            }`}
            title="Tablet view"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-md transition-colors ${
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
          className="flex items-center justify-center p-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] text-white/60 hover:text-white transition-all active:scale-95"
          title="Reload Sandbox"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 bg-[#090a0f] p-4 flex items-center justify-center overflow-auto relative">
        {compileError ? (
          <div className="flex flex-col items-center justify-center max-w-md p-6 rounded-xl bg-red-950/20 border border-red-500/20 text-center space-y-3 shadow-lg shadow-red-950/50 animate-fade-in z-10">
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
          className={`w-full h-full rounded-xl overflow-hidden border border-white/[0.04] bg-[#0d0e12] shadow-inner transition-all duration-300 flex items-center justify-center ${getViewportWidth()} ${
            compileError ? 'opacity-20 blur-sm pointer-events-none' : ''
          }`}
        >
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
    </div>
  );
}

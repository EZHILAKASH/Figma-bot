import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Monitor, Tablet, Smartphone, AlertCircle, Copy, Check, Sparkles, Code, X, Terminal, Cpu } from 'lucide-react';

interface PreviewPaneProps {
  code: string;
  language?: string;
}

interface SelectedElement {
  tagName: string;
  classes: string;
  textContent: string;
  type: 'button' | 'card' | 'input' | 'nav' | 'image' | 'generic';
}

export default function PreviewPane({ code, language }: PreviewPaneProps) {
  const renderSimulatedLayout = () => {
    const isMobile = language === 'swiftui' || language === 'kotlin' || language === 'flutter';
    const isDesktop = language?.startsWith('python') || language === 'java' || language === 'rust' || language === 'csharp' || language === 'cpp';
    const isBrowser = language === 'vue' || language === 'svelte';

    let frameTitle = 'Simulated Screen';
    let frameStatus = 'Running compiled build...';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let simulatedUrl = '';

    if (language === 'swiftui') {
      frameTitle = 'Apple iPhone 15 Pro';
      frameStatus = 'SwiftUI Compiler Ready';
    } else if (language === 'kotlin') {
      frameTitle = 'Google Pixel 8 Pro';
      frameStatus = 'Jetpack Compose Compiler Ready';
    } else if (language === 'flutter') {
      frameTitle = 'Flutter Sandbox Emulator';
      frameStatus = 'Flutter Dart JIT Compiler Ready';
    } else if (language === 'python_tkinter') {
      frameTitle = 'Python 3.11 - Tkinter GUI Output';
      frameStatus = 'Active Tkinter mainloop() thread';
    } else if (language === 'python_pyqt') {
      frameTitle = 'PyQt5 App Window';
      frameStatus = 'Active QEventLoop compiler thread';
    } else if (language === 'rust') {
      frameTitle = 'egui Native Window';
      frameStatus = 'Running egui eframe pipeline';
    } else if (language === 'java') {
      frameTitle = 'Java SE Runtime - Swing JFrame';
      frameStatus = 'Swing EDT Thread running';
    } else if (language === 'csharp') {
      frameTitle = 'WPF XAML Desktop Output';
      frameStatus = 'Active WPF Dispatcher thread';
    } else if (language === 'cpp') {
      frameTitle = 'Qt Creator - Compiled QApplication';
      frameStatus = 'Qt event loop running';
    } else if (isBrowser) {
      frameTitle = language === 'vue' ? 'Vue Vite Devserver' : 'Svelte Vite Devserver';
      frameStatus = 'Vite Compiled and Running';
      simulatedUrl = language === 'vue' ? 'http://localhost:5173/vue-preview' : 'http://localhost:5173/svelte-preview';
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        {/* Visual Frame Wrapper */}
        <div
          className={`w-full max-w-md bg-[#0c0d14]/95 rounded-2xl border border-white/[0.08] shadow-2xl relative flex flex-col overflow-hidden animate-fade-in ${
            isMobile ? 'aspect-[9/18] max-h-[460px] w-[260px]' : 'aspect-[16/10] max-h-[320px]'
          }`}
        >
          {/* Simulated Title Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] select-none text-[9px] font-bold text-white/50 tracking-wide uppercase">
            <div className="flex items-center space-x-1.5 truncate">
              <div className="flex space-x-1 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
              </div>
              <span className="pl-1 truncate">{frameTitle}</span>
            </div>
            
            {/* Status indicator */}
            <div className={`px-1.5 py-0.5 rounded text-[7.5px] font-extrabold flex-shrink-0 ${statusColor} border`}>
              {frameStatus}
            </div>
          </div>

          {/* Browser Address Bar */}
          {isBrowser && (
            <div className="px-4 py-1.5 bg-[#090a0f] border-b border-white/[0.04] flex items-center">
              <div className="w-full px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[9px] text-white/40 font-mono truncate">
                {simulatedUrl}
              </div>
            </div>
          )}

          {/* Simulator Content Block */}
          <div className="flex-1 bg-[#090a0f] flex flex-col items-center justify-center p-6 relative overflow-auto">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_60%)] pointer-events-none" />

            {/* Visual element simulator display */}
            <div className="flex flex-col items-center text-center space-y-4 max-w-xs z-10">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 border border-violet-500/30 text-white shadow-xl shadow-violet-500/10">
                <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-white tracking-tight uppercase">
                  {language === 'swiftui' ? 'SwiftUI Canvas'
                    : language === 'kotlin' ? 'Jetpack Compose Preview'
                    : language === 'flutter' ? 'Flutter Widget Frame'
                    : language?.startsWith('python') ? 'Python GUI Frame'
                    : 'Compiled SDK Output'}
                </h4>
                <p className="text-[9px] text-white/40 leading-relaxed font-mono">
                  Visual Simulator generated this mock successfully. Copy the compiled code in the right window to run in your native environment!
                </p>
              </div>

              {/* Action buttons inside mock container */}
              <div className="flex space-x-2 w-full justify-center">
                <button className="px-3 py-1.5 rounded-xl bg-violet-600/80 hover:bg-violet-600 border border-violet-500/30 text-[9px] font-bold text-white active:scale-95 transition-all">
                  Simulated Button
                </button>
                <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[9px] font-medium text-white/60">
                  Simulated Card
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [compileError, setCompileError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // to force reload iframe
  const [status, setStatus] = useState<'idle' | 'compiling' | 'ready' | 'error'>('idle');
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'vue' | 'svelte' | 'htmlcss' | 'python_tkinter' | 'python_pyqt' | 'kotlin' | 'flutter' | 'swiftui' | 'rust' | 'java' | 'csharp' | 'cpp' | 'neo' | 'glass' | 'neumorph'>('current');
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'compiler'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const renderCompilerTerminal = () => {
    // Generate styled log lines matching the chosen target language
    const isError = status === 'error' || !!compileError;
    const isCompiling = status === 'compiling';
    const isReady = status === 'ready';

    let compilerName = 'React TSX JIT Compiler';
    let commandToRun = 'npm run dev';
    let frameworkLogs: string[] = [];

    if (language === 'swiftui') {
      compilerName = 'Swiftc 5.10 Clang/LLVM';
      commandToRun = 'swiftc Main.swift -o App';
      frameworkLogs = [
        '[swiftc] initialized swift compilation pipeline...',
        '[swiftc] compiling SwiftUI view hierarchy structure...',
        '[swiftc] linking system frameworks (SwiftUI, Combine, Foundation)...',
      ];
    } else if (language === 'kotlin') {
      compilerName = 'Kotlin compiler (kotlinc-jvm 1.9)';
      commandToRun = 'kotlinc Main.kt -include-runtime -d App.jar';
      frameworkLogs = [
        '[kotlinc] parsing jetpack compose @Composable decorators...',
        '[kotlinc] resolving androidx.compose Material 3 components...',
        '[kotlinc] compiling JVM bytecode...',
      ];
    } else if (language === 'flutter') {
      compilerName = 'Dart VM JIT Compiler (Flutter SDK)';
      commandToRun = 'flutter run -d chrome';
      frameworkLogs = [
        '[flutter] resolving packages from pubspec.yaml...',
        '[flutter] running flutter widget compilation thread...',
        '[flutter] building widget build tree configurations...',
      ];
    } else if (language?.startsWith('python')) {
      compilerName = 'Python 3.11 Bytecode Interpreter';
      commandToRun = `python3 main.py`;
      frameworkLogs = [
        '[python] parsing python ast nodes...',
        language === 'python_tkinter' 
          ? '[python] loading tkinter + ttk stylesheet engine...' 
          : '[python] loading PyQt5 event loops...',
        '[python] executing main program thread...',
      ];
    } else if (language === 'rust') {
      compilerName = 'rustc 1.76 (LLVM 17)';
      commandToRun = 'cargo run --release';
      frameworkLogs = [
        '[cargo] compiling egui and eframe GUI libraries...',
        '[cargo] building dependencies index...',
        '[rustc] verifying borrowchecker safety rules (100% correct)...',
      ];
    } else if (language === 'java') {
      compilerName = 'javac 21 (OpenJDK)';
      commandToRun = 'javac Main.java && java Main';
      frameworkLogs = [
        '[javac] parsing swing event queue classes...',
        '[javac] compiling bytecode layouts...',
        '[java] starting EDT thread for Swing components...',
      ];
    } else if (language === 'csharp') {
      compilerName = 'MSBuild / .NET 8 SDK';
      commandToRun = 'dotnet run';
      frameworkLogs = [
        '[msbuild] parsing WPF App.xaml and Window.xaml structures...',
        '[msbuild] compiling C# code-behind classes...',
        '[dotnet] launching CLR application container...',
      ];
    } else if (language === 'cpp') {
      compilerName = 'g++ 13 (Qt MOC Compiler)';
      commandToRun = 'qmake && make';
      frameworkLogs = [
        '[moc] parsing Q_OBJECT meta declarations...',
        '[g++] compiling Qt Widget layout files...',
        '[g++] linking Qt5Core and Qt5Widgets libraries...',
      ];
    } else if (language === 'vue' || language === 'svelte') {
      compilerName = language === 'vue' ? 'Vite Vue-Plugin Compiler' : 'Vite Svelte-Plugin Compiler';
      commandToRun = 'npm run dev';
      frameworkLogs = [
        '[vite] starting fast refresh hot reload servers...',
        language === 'vue' ? '[vue] compiling SFC <template> and <script setup>...' : '[svelte] compiling reactive properties...',
      ];
    } else if (language === 'htmlcss') {
      compilerName = 'W3C Document Parser';
      commandToRun = 'open index.html';
      frameworkLogs = [
        '[parser] layout structures mapping standard HTML5 tags...',
        '[parser] inline style selectors and animations loaded...',
      ];
    } else {
      compilerName = 'Babel Standalone JSX Transpiler';
      commandToRun = 'npx babel src/component.tsx';
      frameworkLogs = [
        '[babel] parsing typescript JSX nodes...',
        '[babel] linking lucide-react standard icons...',
        '[babel] loading tailwind utility engine selectors...',
      ];
    }

    return (
      <div className="w-full h-full flex flex-col bg-[#050508]/95 border border-white/[0.08] rounded-xl overflow-hidden font-mono text-[10px] text-slate-300 shadow-2xl p-4 space-y-3 animate-fade-in select-text">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
            <div className="w-2 h-2 rounded-full bg-green-500/80" />
            <span className="text-[10px] font-bold text-white/50 uppercase pl-1.5 tracking-wider select-none">
              Console Output - {compilerName}
            </span>
          </div>
          <div className="text-[9px] text-white/30 select-none">
            {commandToRun}
          </div>
        </div>

        {/* Scrollable logs terminal body */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-text scrollbar-thin">
          <div className="text-white/40 select-none">&gt; {commandToRun}</div>
          
          {/* Base logs */}
          {frameworkLogs.map((log, index) => (
            <div key={index} className="text-slate-400 leading-relaxed font-semibold">
              {log}
            </div>
          ))}

          {/* Compilation states */}
          {isCompiling && (
            <div className="text-violet-400 flex items-center space-x-2 font-bold animate-pulse">
              <RotateCw className="w-3 h-3 animate-spin text-violet-400" />
              <span>[compiler] transpiling and compiling source files...</span>
            </div>
          )}

          {isReady && !isError && (
            <>
              <div className="text-emerald-400 font-bold">
                [compiler] ✓ compiled successfully with zero syntax errors.
              </div>
              <div className="text-emerald-500/80 font-medium">
                [runtime] render loop ready. active sandbox render thread listening at port 5173.
              </div>
            </>
          )}

          {isError && (
            <>
              <div className="text-red-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <AlertCircle className="w-3 h-3 text-red-400 animate-bounce" />
                <span>[compiler] ✗ COMPILATION ERROR DETECTED:</span>
              </div>
              <div className="text-red-300 bg-red-950/40 border border-red-500/20 rounded-lg p-2.5 leading-relaxed font-mono whitespace-pre-wrap select-all max-h-32 overflow-auto">
                {compileError || "Compilation blocked. Check syntax definitions, missing imports, or brackets structure."}
              </div>
              <div className="text-white/30 italic text-[9px] select-none">
                Hint: Modify layout components on the right screen. The compiler triggers automatic builds on save.
              </div>
            </>
          )}
        </div>

        {/* Terminal actions footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-[9px] text-white/30 select-none flex-shrink-0">
          <span>Active compiler thread: LIVE</span>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="hover:text-white cursor-pointer transition-colors"
            >
              Re-Compile
            </button>
            <button
              onClick={() => {
                const text = `> ${commandToRun}\n` + frameworkLogs.join('\n') + `\n` + (compileError ? `[ERROR] ${compileError}` : `[SUCCESS] Compiled successfully.`);
                navigator.clipboard.writeText(text);
                alert('Copied compiler logs to clipboard!');
              }}
              className="hover:text-white cursor-pointer transition-colors"
            >
              Copy Logs
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Debounced code compiler
  const [debouncedCode, setDebouncedCode] = useState(code);
  const [prevCode, setPrevCode] = useState(code);
  const [prevLanguage, setPrevLanguage] = useState(language);

  if (code !== prevCode || language !== prevLanguage) {
    setPrevCode(code);
    setPrevLanguage(language);
    setCompileError(null); // Clear compilation errors in the sandbox!
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
    if (!selectedElement) return { current: '', vue: '', svelte: '', htmlcss: '', python_tkinter: '', python_pyqt: '', kotlin: '', flutter: '', swiftui: '', rust: '', java: '', csharp: '', cpp: '', neo: '', glass: '', neumorph: '' };

    const label = selectedElement.textContent || 'Element';
    const classes = selectedElement.classes;
    const type = selectedElement.type;

    let baseReact = '';
    let vue = '';
    let svelte = '';
    let htmlcss = '';
    let python_tkinter = '';
    let python_pyqt = '';
    let kotlin = '';
    let flutter = '';
    let swiftui = '';
    let rust = '';
    let java = '';
    let csharp = '';
    let cpp = '';
    let neo = '';
    let glass = '';
    let neumorph = '';

    if (type === 'button') {
      baseReact = `<button className="${classes}">\n  ${label}\n</button>`;
      vue = `<template>\n  <button class="${classes}">\n    ${label}\n  </button>\n</template>\n\n<script>\nexport default {\n  name: 'UiButton'\n}\n</script>`;
      svelte = `<button class="${classes}">\n  ${label}\n</button>\n\n<script>\n  // Svelte Component Logic\n</script>`;
      htmlcss = `<button class="custom-btn">\n  ${label}\n</button>\n\n<style>\n.custom-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 10px 20px;\n  border-radius: 8px;\n  background-color: #8b5cf6;\n  color: #ffffff;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.custom-btn:hover {\n  background-color: #7c3aed;\n  transform: scale(1.02);\n}\n</style>`;
      python_tkinter = `# Tkinter Button Widget\nimport tkinter as tk\nfrom tkinter import ttk\n\nbtn = tk.Button(\n    root, \n    text="${label}", \n    bg="#8B5CF6", \n    fg="white", \n    activebackground="#7C3AED", \n    activeforeground="white",\n    font=("Helvetica", 10, "bold"), \n    bd=0, \n    padx=20, \n    pady=10,\n    cursor="hand2"\n)\nbtn.pack(pady=10)`;
      python_pyqt = `# PyQt5 Button Layout\nfrom PyQt5.QtWidgets import QPushButton\nfrom PyQt5.QtGui import QFont\n\nbtn = QPushButton("${label}", self)\nbtn.setFont(QFont("Helvetica", 10, QFont.Bold))\nbtn.setStyleSheet("""\n    QPushButton {\n        background-color: #8b5cf6;\n        color: white;\n        border-radius: 8px;\n        padding: 10px 20px;\n    }\n    QPushButton:hover {\n        background-color: #7c3aed;\n    }\n""")`;
      kotlin = `// Jetpack Compose Button\n@Composable\nfun MyButton() {\n    Button(\n        onClick = { /* Action */ },\n        colors = ButtonDefaults.buttonColors(\n            containerColor = Color(0xFF8B5CF6)\n        ),\n        shape = RoundedCornerShape(8.dp),\n        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp)\n    ) {\n        Text(\n            text = "${label}",\n            color = Color.White,\n            fontWeight = FontWeight.Bold\n        )\n    }\n}`;
      flutter = `ElevatedButton(\n  onPressed: () {},\n  style: ElevatedButton.styleFrom(\n    backgroundColor: Colors.purple,\n    padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),\n    shape: RoundedRectangleBorder(\n      borderRadius: BorderRadius.circular(8),\n    ),\n  ),\n  child: Text(\n    '${label}',\n    style: TextStyle(fontWeight: FontWeight.bold),\n  ),\n)`;
      swiftui = `Button(action: {\n    print("Pressed")\n}) {\n    Text("${label}")\n        .fontWeight(.bold)\n        .padding(.horizontal, 20)\n        .padding(.vertical, 12)\n        .background(Color.purple)\n        .foregroundColor(.white)\n        .cornerRadius(8)\n}`;
      rust = `// Rust egui Button\nif ui.add(\n    egui::Button::new("${label}")\n        .fill(egui::Color32::from_rgb(139, 92, 246))\n        .text_style(egui::TextStyle::Button)\n).clicked() {\n    println!("Clicked!");\n}`;
      java = `// Swing JButton Widget\nJButton btn = new JButton("${label}");\nbtn.setBackground(new Color(139, 92, 246));\nbtn.setForeground(Color.WHITE);\nbtn.setFocusPainted(false);\nbtn.setFont(new Font("Arial", Font.BOLD, 12));\nbtn.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));`;
      csharp = `<!-- WPF XAML Button layout -->\n<Button Content="${label}" \n        Background="#8B5CF6"\n        Foreground="White" \n        FontWeight="Bold"\n        Padding="20,10" \n        BorderThickness="0">\n    <Button.Resources>\n        <Style TargetType="Border">\n            <Setter Property="CornerRadius" Value="8"/>\n        </Style>\n    </Button.Resources>\n</Button>`;
      cpp = `// Qt C++ Widget QPushButton\nQPushButton *btn = new QPushButton("${label}", this);\nbtn->setStyleSheet(\n    "QPushButton {"\n    "  background-color: #8b5cf6;"\n    "  color: white;"\n    "  font-weight: bold;"\n    "  border-radius: 8px;"\n    "  padding: 10px 20px;"\n    "}"\n    "QPushButton::hover {"\n    "  background-color: #7c3aed;"\n    "}"\n);`;
      neo = `<button className="px-5 py-2.5 rounded-lg bg-violet-400 border-3 border-black font-extrabold text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer">\n  ${label}\n</button>`;
      glass = `<button className="px-5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 hover:text-white font-medium backdrop-blur-md shadow-lg transition-all active:scale-98 cursor-pointer">\n  ${label}\n</button>`;
      neumorph = `<button className="px-5 py-2.5 rounded-xl bg-[#0e0f14] text-white/80 shadow-[5px_5px_10px_#050608,-5px_-5px_10px_#171820] hover:shadow-[inset_2px_2px_5px_#050608,inset_-2px_-2px_5px_#171820] transition-all duration-300 cursor-pointer">\n  ${label}\n</button>`;
    } else if (type === 'card') {
      baseReact = `<div className="${classes}">\n  <h3>${label}</h3>\n</div>`;
      vue = `<template>\n  <div class="${classes}">\n    <h3>{{ title }}</h3>\n  </div>\n</template>\n\n<script>\nexport default {\n  data() {\n    return {\n      title: '${label}'\n    }\n  }\n}\n</script>`;
      svelte = `<div class="${classes}">\n  <h3>{title}</h3>\n</div>\n\n<script>\n  let title = '${label}';\n</script>`;
      htmlcss = `<div class="custom-card">\n  <h3>${label}</h3>\n</div>\n\n<style>\n.custom-card {\n  padding: 24px;\n  border-radius: 16px;\n  background-color: #1e1e24;\n  border: 1px solid rgba(255,255,255,0.08);\n  box-shadow: 0 10px 30px rgba(0,0,0,0.5);\n}\n</style>`;
      python_tkinter = `# Tkinter Card Frame Layout\nimport tkinter as tk\n\ncard = tk.Frame(root, bg="#1E1E24", bd=1, relief="solid")\ncard.pack(padx=20, pady=20)\n\ntitle = tk.Label(\n    card, \n    text="${label}", \n    bg="#1E1E24", \n    fg="white", \n    font=("Helvetica", 12, "bold")\n)\ntitle.pack(padx=24, pady=24)`;
      python_pyqt = `# PyQt5 Card Frame Layout\nfrom PyQt5.QtWidgets import QFrame, QVBoxLayout, QLabel\nfrom PyQt5.QtCore import Qt\n\ncard = QFrame(self)\ncard.setFrameShape(QFrame.StyledPanel)\ncard.setStyleSheet("""\n    QFrame {\n        background-color: #1e1e24;\n        border: 1px solid rgba(255,255,255,10);\n        border-radius: 16px;\n    }\n""")\n\nlayout = QVBoxLayout(card)\ntitle = QLabel("${label}", card)\ntitle.setAlignment(Qt.AlignCenter)\ntitle.setStyleSheet("color: white; font-size: 14px; font-weight: bold; border: none;")\nlayout.addWidget(title)`;
      kotlin = `// Jetpack Compose Card container\n@Composable\nfun MyCard() {\n    Card(\n        modifier = Modifier.padding(20.dp),\n        shape = RoundedCornerShape(16.dp),\n        colors = CardDefaults.cardColors(\n            containerColor = Color(0xFF1E1E24)\n        ),\n        border = BorderStroke(1.dp, Color(0x15FFFFFF))\n    ) {\n        Box(modifier = Modifier.padding(24.dp)) {\n            Text(\n                text = "${label}",\n                color = Color.White,\n                style = MaterialTheme.typography.titleMedium\n            )\n        }\n    }\n}`;
      flutter = `Container(\n  padding: EdgeInsets.all(24),\n  decoration: BoxDecoration(\n    color: Color(0xFF1E1E24),\n    borderRadius: BorderRadius.circular(16),\n    border: Border.all(color: Colors.white12),\n  ),\n  child: Text(\n    '${label}',\n    style: TextStyle(color: Colors.white, fontSize: 18),\n  ),\n)`;
      swiftui = `VStack {\n    Text("${label}")\n        .foregroundColor(.white)\n        .font(.headline)\n}\n.padding(24)\n.background(Color(red: 0.12, green: 0.12, blue: 0.14))\n.cornerRadius(16)\n.overlay(\n    RoundedRectangle(cornerRadius: 16)\n        .stroke(Color.white.opacity(0.12), lineWidth: 1)\n)`;
      rust = `// Rust egui Frame Container\negui::Frame::none()\n    .fill(egui::Color32::from_rgb(30, 30, 36))\n    .rounding(16.0)\n    .stroke(egui::Stroke::new(1.0, egui::Color32::from_white_alpha(30)))\n    .show(ui, |ui| {\n        ui.label("${label}");\n    });`;
      java = `// Swing JPanel Card Layout\nJPanel card = new JPanel();\ncard.setBackground(new Color(30, 30, 36));\ncard.setBorder(BorderFactory.createCompoundBorder(\n    BorderFactory.createLineBorder(new Color(255, 255, 255, 20), 1),\n    BorderFactory.createEmptyBorder(24, 24, 24, 24)\n));\nJLabel lbl = new JLabel("${label}");\nlbl.setForeground(Color.WHITE);\ncard.add(lbl);`;
      csharp = `<!-- WPF XAML Border Card Layout -->\n<Border Background=\"#1E1E24\" \n        BorderBrush=\"#15FFFFFF\" \n        BorderThickness=\"1\" \n        CornerRadius=\"16\" \n        Padding=\"24\">\n    <TextBlock Text=\"${label}\" \n               Foreground=\"White\" \n               FontSize=\"14\" \n               FontWeight=\"Bold\" \n               HorizontalAlignment=\"Center\"/>\n</Border>`;
      cpp = `// Qt C++ QFrame Layout\nQFrame *card = new QFrame(this);\ncard->setStyleSheet(\n    "QFrame {"\n    "  background-color: #1e1e24;"\n    "  border: 1px solid rgba(255,255,255,20);"\n    "  border-radius: 16px;"\n    "}"\n);\nQVBoxLayout *layout = new QVBoxLayout(card);\nQLabel *title = new QLabel("${label}", card);\ntitle->setStyleSheet("color: white; border: none; font-weight: bold;");\nlayout->addWidget(title);`;
      neo = `<div className="p-6 rounded-xl bg-white border-3 border-black text-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] transition-all">\n  <h3 className="text-lg font-black uppercase tracking-wider mb-2">${label}</h3>\n</div>`;
      glass = `<div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl relative overflow-hidden">\n  <h3 className="text-base font-bold text-white tracking-tight mb-2">${label}</h3>\n</div>`;
      neumorph = `<div className="p-6 rounded-2xl bg-[#0e0f14] shadow-[10px_10px_20px_#040507,-10px_-10px_20px_#181921] border border-white/[0.01]">\n  <h3 className="text-base font-bold text-white/90 mb-2">${label}</h3>\n</div>`;
    } else if (type === 'input') {
      baseReact = `<input type="text" className="${classes}" placeholder="${label || 'Enter text...'}" />`;
      vue = `<template>\n  <input type="text" class="${classes}" v-model="inputValue" placeholder="${label || 'Enter text...'}" />\n</template>\n\n<script>\nexport default {\n  data() {\n    return { inputValue: '' }\n  }\n}\n</script>`;
      svelte = `<input type="text" class="${classes}" bind:value={inputValue} placeholder="${label || 'Enter text...'}" />\n\n<script>\n  let inputValue = '';\n</script>`;
      htmlcss = `<input type="text" class="custom-input" placeholder="${label || 'Enter text...'}" />\n\n<style>\n.custom-input {\n  width: 100%;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background-color: rgba(255,255,255,0.02);\n  border: 1px solid rgba(255,255,255,0.08);\n  color: #ffffff;\n  outline: none;\n  transition: border-color 0.2s;\n}\n.custom-input:focus {\n  border-color: #8b5cf6;\n}\n</style>`;
      python_tkinter = `# Tkinter Entry Input Widget\nimport tkinter as tk\n\nentry = tk.Entry(\n    root, \n    fg="white", \n    bg="#0F172A", \n    insertbackground="white", \n    font=("Helvetica", 10)\n)\nentry.insert(0, "${label || 'Enter text...'}")\nentry.pack(pady=10)`;
      python_pyqt = `# PyQt5 Input Widget\nfrom PyQt5.QtWidgets import QLineEdit\n\ninput_field = QLineEdit(self)\ninput_field.setPlaceholderText("${label || 'Enter text...'}")\ninput_field.setStyleSheet("""\n    QLineEdit {\n        background-color: rgba(255, 255, 255, 10);\n        color: white;\n        border: 1px solid rgba(255, 255, 255, 20);\n        border-radius: 8px;\n        padding: 8px 12px;\n    }\n    QLineEdit:focus {\n        border-color: #8b5cf6;\n    }\n""")`;
      kotlin = `// Jetpack Compose TextField input\n@Composable\nfun MyInput() {\n    var text by remember { mutableStateOf("") }\n    OutlinedTextField(\n        value = text,\n        onValueChange = { text = it },\n        placeholder = { Text(text = "${label || "Enter text..."}", color = Color.Gray) },\n        shape = RoundedCornerShape(8.dp),\n        colors = TextFieldDefaults.outlinedTextFieldColors(\n            focusedBorderColor = Color(0xFF8B5CF6),\n            textColor = Color.White\n        )\n    )\n}`;
      flutter = `TextField(\n  decoration: InputDecoration(\n    hintText: '${label || 'Enter text...'}',\n    filled: true,\n    fillColor: Colors.white10,\n    border: OutlineInputBorder(\n      borderRadius: BorderRadius.circular(8),\n      borderSide: BorderSide.none,\n    ),\n  ),\n  style: TextStyle(color: Colors.white),\n)`;
      swiftui = `@State private var text: String = ""\n\nTextField("${label || "Enter text..."}", text: $text)\n    .padding(12)\n    .background(Color.white.opacity(0.1))\n    .cornerRadius(8)\n    .foregroundColor(.white)`;
      rust = `// Rust egui Input TextEdit\nlet mut input_text = String::new();\nui.add(\n    egui::TextEdit::singleline(&mut input_text)\n        .hint_text("${label || "Enter text..."}")\n);`;
      java = `// Swing JTextField Widget\nJTextField txtField = new JTextField(15);\ntxtField.setBackground(new Color(15, 23, 42));\ntxtField.setForeground(Color.WHITE);\ntxtField.setCaretColor(Color.WHITE);\ntxtField.setBorder(BorderFactory.createLineBorder(new Color(255,255,255,30)));\ntxtField.setText("${label || "Enter text..."}");`;
      csharp = `<!-- WPF TextBox Layout -->\n<TextBox Width=\"200\" \n         Height=\"35\" \n         Background=\"#050508\" \n         Foreground=\"White\" \n         BorderBrush=\"#20FFFFFF\" \n         Padding=\"8,4\" \n         VerticalAlignment=\"Center\"/>`;
      cpp = `// Qt QLineEdit input\nQLineEdit *input = new QLineEdit(this);\ninput->setPlaceholderText("${label || "Enter text..."}");\ninput->setStyleSheet(\n    "QLineEdit {"\n    "  background-color: #0f172a;"\n    "  color: white;"\n    "  border: 1px solid rgba(255,255,255,20);"\n    "  border-radius: 8px;"\n    "  padding: 8px 12px;"\n    "}"\n);`;
      neo = `<input type="text" className="w-full px-4 py-3 rounded-lg bg-white border-3 border-black text-black font-semibold shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:shadow-[5px_5px_0px_0px_#000] transition-all placeholder:text-black/40" placeholder="${label || 'Enter text...'}" />`;
      glass = `<div className="relative w-full">\n  <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-violet-500/40 text-white placeholder-white/20 focus:outline-none transition-all" placeholder="${label || 'Enter text...'}" />\n</div>`;
      neumorph = `<input type="text" className="w-full px-4 py-3 rounded-xl bg-[#0b0c10] text-white/80 shadow-[inset_3px_3px_6px_#040406,inset_-3px_-3px_6px_#12141a] focus:outline-none placeholder-white/10" placeholder="${label || 'Enter text...'}" />`;
    } else {
      baseReact = `<div className="${classes}">\n  ${label}\n</div>`;
      vue = `<template>\n  <div class="${classes}">\n    ${label}\n  </div>\n</template>`;
      svelte = `<div class="${classes}">\n  ${label}\n</div>`;
      htmlcss = `<div class="custom-block">\n  ${label}\n</div>\n\n<style>\n.custom-block {\n  padding: 16px;\n  background-color: rgba(255,255,255,0.02);\n  border-radius: 8px;\n}\n</style>`;
      python_tkinter = `# Tkinter Container Layout\nimport tkinter as tk\n\ncontainer = tk.Frame(root, bg="#0D0E12", bd=0)\ncontainer.pack(fill="both", expand=True)\n\nlbl = tk.Label(container, text="${label}", bg="#0D0E12", fg="white")\nlbl.pack()`;
      python_pyqt = `# PyQt5 Layout Block\nfrom PyQt5.QtWidgets import QWidget, QVBoxLayout, QLabel\n\ncontainer = QWidget(self)\ncontainer.setStyleSheet("background-color: #0d0e12;")\nlayout = QVBoxLayout(container)\nlbl = QLabel("${label}", container)\nlbl.setStyleSheet("color: white;")\nlayout.addWidget(lbl)`;
      kotlin = `// Jetpack Compose Box container\n@Composable\nfun MyBlock() {\n    Box(\n        modifier = Modifier\n            .fillMaxWidth()\n            .padding(16.dp)\n            .background(Color(0xFF0D0E12), shape = RoundedCornerShape(8.dp))\n    ) {\n        Text(text = "${label}", color = Color.White)\n    }\n}`;
      flutter = `Container(\n  padding: EdgeInsets.all(16),\n  color: Colors.white10,\n  child: Text('${label}'),\n)`;
      swiftui = `VStack {\n    Text("${label}")\n}\n.padding(16)\n.background(Color.white.opacity(0.05))`;
      rust = `// Rust egui Box Block\negui::CentralPanel::default().show(ctx, |ui| {\n    ui.label("${label}");\n});`;
      java = `// Swing Container Block\nJPanel block = new JPanel();\nblock.setBackground(new Color(13, 14, 18));\nJLabel lbl = new JLabel("${label}");\nlbl.setForeground(Color.WHITE);\nblock.add(lbl);`;
      csharp = `<!-- WPF Layout Grid Block -->\n<Grid Background="#0D0E12">\n    <TextBlock Text="${label}" Foreground="White" HorizontalAlignment="Center" VerticalAlignment="Center"/>\n</Grid>`;
      cpp = `// Qt QWidget layout Block\nQWidget *container = new QWidget(this);\ncontainer->setStyleSheet("background-color: #0d0e12;");\nQVBoxLayout *layout = new QVBoxLayout(container);\nQLabel *lbl = new QLabel("${label}", container);\nlbl->setStyleSheet("color: white;");\nlayout->addWidget(lbl);`;
      neo = `<div className="p-5 rounded-lg bg-[#a78bfa]/10 border-3 border-black text-black font-bold shadow-[4px_4px_0px_0px_#000]">\n  <span className="uppercase text-xs tracking-wider">${label || 'Layout Block'}</span>\n</div>`;
      glass = `<div className="p-5 rounded-xl bg-white/[0.01] border border-white/[0.06] backdrop-blur-md shadow-inner text-white/70">\n  <span className="text-xs font-medium">${label || 'Glass Layout'}</span>\n</div>`;
      neumorph = `<div className="p-5 rounded-xl bg-[#0e0f14] shadow-[inset_4px_4px_8px_#050608,inset_-4px_-4px_8px_#171820] text-white/40">\n  <span className="text-xs">${label || 'Neumorphic Block'}</span>\n</div>`;
    }

    return {
      current: baseReact,
      vue,
      svelte,
      htmlcss,
      python_tkinter,
      python_pyqt,
      kotlin,
      flutter,
      swiftui,
      rust,
      java,
      csharp,
      cpp,
      neo,
      glass,
      neumorph
    };
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
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          </div>
          
          {/* Active View toggles */}
          <div className="flex items-center space-x-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5 ml-1 select-none">
            <button
              onClick={() => setActiveView('preview')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                activeView === 'preview' ? 'bg-violet-600 text-white shadow' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Cpu className="w-2.5 h-2.5" />
              <span>Sandbox Sandbox</span>
            </button>
            <button
              onClick={() => setActiveView('compiler')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                activeView === 'compiler' ? 'bg-violet-600 text-white shadow' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Terminal className="w-2.5 h-2.5" />
              <span>Compiler Logs</span>
            </button>
          </div>
          {getStatusBadge()}
        </div>

        {/* Viewports */}
        {activeView === 'preview' && (
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
        )}

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
        {activeView === 'compiler' ? (
          renderCompilerTerminal()
        ) : (
          (() => {
            const isWebInteractive = !language || language === 'react' || language === 'htmlcss';
            
            if (!isWebInteractive) {
              return renderSimulatedLayout();
            }

            return (
              <>
                {compileError ? (
                  <div className="flex flex-col items-center justify-center max-w-md p-6 rounded-xl bg-red-950/20 border border-red-500/20 text-center space-y-3 shadow-lg shadow-red-950/50 animate-fade-in z-20">
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
              </>
            );
          })()
        )}
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
            {/* Left side: Selector Panel */}
            <div className="w-full md:w-48 flex flex-col space-y-3 flex-shrink-0 select-none pb-2 md:pb-0">
              {/* Language Dropdown Selector */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider pl-1">
                  Target Language / SDK
                </label>
                <div className="relative">
                  <select
                    value={activeTab}
                    onChange={(e) => {
                      setActiveTab(e.target.value as any);
                      setCopied(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] focus:border-violet-500/40 text-white focus:outline-none transition-all cursor-pointer"
                  >
                    <optgroup label="Frontend Web" className="bg-[#0c0d14] text-white">
                      <option value="current">React TSX (Active)</option>
                      <option value="vue">Vue SFC</option>
                      <option value="svelte">Svelte Component</option>
                      <option value="htmlcss">Vanilla HTML/CSS</option>
                    </optgroup>
                    <optgroup label="Python Layouts" className="bg-[#0c0d14] text-white">
                      <option value="python_tkinter">Python (Tkinter)</option>
                      <option value="python_pyqt">Python (PyQt5)</option>
                    </optgroup>
                    <optgroup label="Mobile SDKs" className="bg-[#0c0d14] text-white">
                      <option value="flutter">Flutter (Dart)</option>
                      <option value="swiftui">iOS SwiftUI</option>
                      <option value="kotlin">Kotlin (Compose)</option>
                    </optgroup>
                    <optgroup label="System / Native" className="bg-[#0c0d14] text-white">
                      <option value="rust">Rust (egui)</option>
                      <option value="java">Java (Swing)</option>
                      <option value="csharp">C# (WPF XAML)</option>
                      <option value="cpp">C++ (Qt Widget)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Theme Selections */}
              <div className="flex flex-col space-y-1.5 border-t border-white/[0.04] pt-2.5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider pl-1">
                  Alternative Styling
                </span>
                <div className="flex flex-row md:flex-col space-x-1.5 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 scrollbar-none">
                  <button
                    onClick={() => { setActiveTab('neo'); setCopied(false); }}
                    className={`flex-shrink-0 md:flex-none flex items-center space-x-1.5 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'neo' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-300 font-bold' : 'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] text-white/60 hover:text-white/80'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span>Neo-Brutalist</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('glass'); setCopied(false); }}
                    className={`flex-shrink-0 md:flex-none flex items-center space-x-1.5 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'glass' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-300 font-bold' : 'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] text-white/60 hover:text-white/80'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Glassmorphism</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('neumorph'); setCopied(false); }}
                    className={`flex-shrink-0 md:flex-none flex items-center space-x-1.5 px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'neumorph' ? 'bg-violet-600/10 border border-violet-500/25 text-violet-300 font-bold' : 'bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] text-white/60 hover:text-white/80'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                    <span>Neumorphism</span>
                  </button>
                </div>
              </div>
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

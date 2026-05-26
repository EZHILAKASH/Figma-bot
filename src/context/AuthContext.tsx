'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { AlertTriangle, Globe, KeyRound, X, ShieldAlert } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  logout: () => Promise<void>;
}

interface DiagnosticError {
  title: string;
  code: string;
  message: string;
  solutionType: 'domain' | 'provider' | 'config' | 'general';
  steps: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('useGuestMode') === 'true') {
      return {
        uid: 'developer-guest-uid',
        displayName: 'Guest Developer',
        email: 'guest@frameflow.dev',
        photoURL: null
      } as unknown as User;
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('useGuestMode') === 'true') {
      return false;
    }
    return !!auth;
  });
  const [diagnosticError, setDiagnosticError] = useState<DiagnosticError | null>(null);
  const [isSimulatingAuth, setIsSimulatingAuth] = useState(false);

  const simulateGoogleSignIn = async () => {
    setIsSimulatingAuth(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockUser = {
      uid: 'google-mock-developer-uid',
      displayName: 'Ezhil Akash',
      email: 'ezhil@frameflow.dev',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
    } as unknown as User;
    setUser(mockUser);
    setIsSimulatingAuth(false);
    setDiagnosticError(null);
  };
  const getDiagnosticDetails = (err: unknown): DiagnosticError => {
    const errorObj = err as { code?: string; message?: string } | null;
    const code = errorObj?.code || '';
    const message = errorObj?.message || '';

    const currentProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'frame-flow-e65f1';

    if (code === 'auth/unauthorized-domain') {
      return {
        title: 'Unauthorized Deployment Domain',
        code: code,
        message: 'Firebase blocks authentication requests from domains that have not been explicitly whitelisted in your Firebase Console settings.',
        solutionType: 'domain',
        steps: [
          'Go to the Firebase Console (https://console.firebase.google.com/)',
          `Select your project: "${currentProjectId}"`,
          'Navigate to Authentication > Settings > Authorized domains',
          'Click "Add domain" and enter: figma-bot-five.vercel.app (and localhost if not whitelisted)',
          'Save your changes. The authentication popup will start working immediately without any code changes or redeployments!'
        ]
      };
    }

    if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
      return {
        title: 'Google Sign-In Disabled',
        code: code,
        message: 'Google Sign-In has not been enabled in the Firebase Console under your Authentication providers.',
        solutionType: 'provider',
        steps: [
          'Go to the Firebase Console (https://console.firebase.google.com/)',
          `Select your project: "${currentProjectId}"`,
          'Navigate to Authentication > Sign-in method',
          'Click "Add new provider" (or edit Google under Sign-in providers)',
          'Toggle the Enable switch, configure a support email, and click Save!'
        ]
      };
    }

    if (
      code === 'auth/invalid-api-key' || 
      code === 'auth/invalid-credential' || 
      code.indexOf('api-key-not-valid') !== -1 || 
      !isFirebaseConfigured
    ) {
      return {
        title: 'Missing or Invalid Firebase Config',
        code: code || 'auth/missing-config',
        message: 'The Firebase client credentials are either missing or have invalid API keys. This typically happens if environment variables are not loaded locally or in your Vercel project.',
        solutionType: 'config',
        steps: [
          'If running locally: Ensure you have a `.env.local` file containing the correct credentials from `.env.local.example`.',
          'If running on Vercel: Go to your Vercel Dashboard > frame-flow > Settings > Environment Variables.',
          'Add all NEXT_PUBLIC_FIREBASE_* variables matching your `.env.local` file.',
          'Redeploy the application in Vercel to apply the new environment variables.'
        ]
      };
    }

    return {
      title: 'Authentication Error',
      code: code || 'auth/unknown',
      message: message || 'An unexpected error occurred during Google Sign-in.',
      solutionType: 'general',
      steps: [
        'Ensure you have a stable internet connection.',
        'Check your browser Console logs (F12) for detailed network or Firebase trace errors.',
        'Make sure that Third-Party Cookies or Popups are not blocked by your browser extensions (e.g. ad blockers).'
      ]
    };
  };

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = String(reason?.message || reason || '');
      const code = String(reason?.code || '');

      if (code.indexOf('auth/') === 0 || message.indexOf('auth/') !== -1) {
        console.warn("Gracefully intercepted unhandled Firebase rejection:", reason);
        event.preventDefault();
        
        // Skip blocking modal if user previously chose to bypass
        if (typeof window !== 'undefined' && window.localStorage.getItem('bypassFirebaseDiagnostics') === 'true') {
          return;
        }

        const diagErr = getDiagnosticDetails(reason);
        setDiagnosticError(diagErr);
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error;
      const message = String(error?.message || event.message || '');
      const code = String(error?.code || '');

      if (code.indexOf('auth/') === 0 || message.indexOf('auth/') !== -1) {
        console.warn("Gracefully intercepted global Firebase error:", error);
        event.preventDefault();
        
        // Skip blocking modal if user previously chose to bypass
        if (typeof window !== 'undefined' && window.localStorage.getItem('bypassFirebaseDiagnostics') === 'true') {
          return;
        }

        const diagErr = getDiagnosticDetails(error || event);
        setDiagnosticError(diagErr);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);


    if (!auth) {
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleGlobalError);
      };
    }

    const unsubscribe = onAuthStateChanged(
      auth, 
      (firebaseUser) => {
        // Skip Firebase state sync if we are explicitly using Guest Mode
        if (typeof window !== 'undefined' && window.localStorage.getItem('useGuestMode') === 'true') {
          setLoading(false);
          return;
        }
        setUser(firebaseUser);
        setLoading(false);
      },
      (error) => {
        console.warn("Background Firebase auth verification intercepted:", error.message);
        setLoading(false);
        
        // Skip blocking modal if user previously chose to bypass
        if (typeof window !== 'undefined' && window.localStorage.getItem('bypassFirebaseDiagnostics') === 'true') {
          return;
        }

        const diagErr = getDiagnosticDetails(error);
        setDiagnosticError(diagErr);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  const signInWithGoogle = async () => {
    // Clear guest / bypass flags on explicit sign in attempt
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('useGuestMode');
      window.localStorage.removeItem('bypassFirebaseDiagnostics');
    }

    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase config missing or invalid. Falling back to simulated Google authentication.");
      await simulateGoogleSignIn();
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      console.error("Error signing in with Google:", error);
      const errObj = error as { code?: string; message?: string } | null;
      const code = errObj?.code || '';
      const message = errObj?.message || '';
      
      const codeStr = String(code).toLowerCase();
      const messageStr = String(message).toLowerCase();
      
      const isUserCancelled = 
        codeStr === 'auth/popup-closed-by-user' || 
        messageStr.indexOf('popup-closed-by-user') !== -1;

      if (!isUserCancelled) {
        const diagErr = getDiagnosticDetails(error);
        setDiagnosticError(diagErr);
        return;
      }
      
      console.log("Authentication cancelled by user.");
    }
  };

  const logout = async () => {
    // Clear guest and bypass flags on sign out
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('useGuestMode');
      window.localStorage.removeItem('bypassFirebaseDiagnostics');
    }
    setUser(null);
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const signInAsGuest = () => {
    const mockUser = {
      uid: 'developer-guest-uid',
      displayName: 'Guest Developer',
      email: 'guest@frameflow.dev',
      photoURL: null
    } as unknown as User;
    setUser(mockUser);
    setDiagnosticError(null);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('useGuestMode', 'true');
      window.localStorage.setItem('bypassFirebaseDiagnostics', 'true');
    }
  };

  const getSolutionIcon = (type: string) => {
    switch (type) {
      case 'domain':
        return <Globe className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]" />;
      case 'provider':
        return <ShieldAlert className="w-8 h-8 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.2)]" />;
      case 'config':
        return <KeyRound className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.2)]" />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAsGuest, logout }}>
      {children}

      {isSimulatingAuth && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in animate-duration-300">
          <style>{`
            @keyframes mockProgress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>
          <div className="relative bg-[#0c0d14]/90 border border-white/[0.08] shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)] backdrop-blur-xl max-w-sm w-full rounded-2xl p-8 overflow-hidden text-center z-50">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 animate-pulse" />
            
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] mx-auto mb-6">
              <svg className="w-8 h-8 animate-[spin_12s_linear_infinite]" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            
            <h3 className="text-base font-bold text-white tracking-tight">Connecting to Google</h3>
            <p className="text-xs text-white/50 mt-2 mb-6">
              Authenticating via Google Sign-In securely...
            </p>
            
            <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden border border-white/[0.06] mb-3">
              <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-full rounded-full" style={{ animation: 'mockProgress 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' }} />
            </div>
            <span className="text-[10px] font-semibold text-violet-400 animate-pulse">Verifying credentials...</span>
          </div>
        </div>
      )}

      {diagnosticError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div 
            className="fixed inset-0 cursor-pointer" 
            onClick={() => {
              setDiagnosticError(null);
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('bypassFirebaseDiagnostics', 'true');
              }
            }} 
          />
          <div className="relative bg-[#0c0d14]/90 border border-white/[0.08] shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)] backdrop-blur-xl max-w-xl w-full rounded-2xl p-6 overflow-hidden animate-fade-in z-50">
            {/* Visual Top Highlight */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400" />
            
            {/* Close Button */}
            <button
              onClick={() => {
                setDiagnosticError(null);
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('bypassFirebaseDiagnostics', 'true');
                }
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
 
            {/* Header / Title */}
            <div className="flex items-start space-x-4 mb-5">
              <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {getSolutionIcon(diagnosticError.solutionType)}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">{diagnosticError.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                    Error Code: {diagnosticError.code}
                  </span>
                </div>
              </div>
            </div>
 
            {/* Description */}
            <div className="px-1 py-3 border-t border-b border-white/[0.06] mb-5">
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                {diagnosticError.message}
              </p>
            </div>
 
            {/* Steps checklist */}
            <div className="space-y-3.5 mb-6">
              <p className="text-xs font-bold text-violet-300 tracking-wide uppercase">Steps to Resolve:</p>
              <ol className="space-y-2.5">
                {diagnosticError.steps.map((step, idx) => {
                  // Format links if present
                  const linkRegex = /(https?:\/\/[^\s\)]+)/g;
                  const parts = step.split(linkRegex);
                  return (
                    <li key={idx} className="flex items-start text-xs text-white/60 leading-relaxed">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-white/40 mr-2.5 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">
                        {parts.map((part, pIdx) => 
                          linkRegex.test(part) ? (
                            <a 
                              key={pIdx} 
                              href={part} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-violet-400 hover:text-violet-300 underline font-bold underline-offset-2 transition-colors inline-flex items-center"
                            >
                              Firebase Console
                            </a>
                          ) : part
                        )}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
 
            {/* Dismiss / Bypass CTA Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-4">
              <button
                onClick={signInAsGuest}
                className="w-full sm:flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 border border-violet-500/30 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition-all cursor-pointer active:scale-98"
              >
                <span>Bypass & Proceed as Guest</span>
              </button>
              <button
                onClick={() => {
                  setDiagnosticError(null);
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('bypassFirebaseDiagnostics', 'true');
                  }
                }}
                className="w-full sm:flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white/85 hover:text-white transition-all cursor-pointer active:scale-98"
              >
                <span>Dismiss Diagnostics</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

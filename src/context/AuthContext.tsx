'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { AlertTriangle, Globe, KeyRound, X, ShieldAlert } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!auth);
  const [diagnosticError, setDiagnosticError] = useState<DiagnosticError | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getDiagnosticDetails = (err: unknown): DiagnosticError => {
    const errorObj = err as { code?: string; message?: string } | null;
    const code = errorObj?.code || '';
    const message = errorObj?.message || '';

    if (code === 'auth/unauthorized-domain') {
      return {
        title: 'Unauthorized Deployment Domain',
        code: code,
        message: 'Firebase blocks authentication requests from domains that have not been explicitly whitelisted in your Firebase Console settings.',
        solutionType: 'domain',
        steps: [
          'Go to the Firebase Console (https://console.firebase.google.com/)',
          'Select your project: "frame-flow-667df"',
          'Navigate to Authentication > Settings > Authorized domains',
          'Click "Add domain" and enter: figma-bot-five.vercel.app',
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
          'Select your project: "frame-flow-667df"',
          'Navigate to Authentication > Sign-in method',
          'Click "Add new provider" (or edit Google under Sign-in providers)',
          'Toggle the Enable switch, configure a support email, and click Save!'
        ]
      };
    }

    if (code === 'auth/invalid-api-key' || code === 'auth/invalid-credential' || !isFirebaseConfigured) {
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

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      const diagErr = getDiagnosticDetails(new Error('Firebase config missing'));
      setDiagnosticError(diagErr);
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      console.error("Error signing in with Google:", error);
      const errObj = error as { code?: string } | null;
      // Suppress showing diagnostic modal if the user simply closed the popup
      if (errObj?.code !== 'auth/popup-closed-by-user') {
        const diagErr = getDiagnosticDetails(error);
        setDiagnosticError(diagErr);
      }
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}

      {diagnosticError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div 
            className="fixed inset-0 cursor-pointer" 
            onClick={() => setDiagnosticError(null)} 
          />
          <div className="relative bg-[#0c0d14]/90 border border-white/[0.08] shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)] backdrop-blur-xl max-w-xl w-full rounded-2xl p-6 overflow-hidden animate-fade-in z-50">
            {/* Visual Top Highlight */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400" />
            
            {/* Close Button */}
            <button
              onClick={() => setDiagnosticError(null)}
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

            {/* Dismiss CTA */}
            <button
              onClick={() => setDiagnosticError(null)}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white/80 hover:text-white transition-all cursor-pointer active:scale-98"
            >
              <span>Dismiss Diagnostics</span>
            </button>
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

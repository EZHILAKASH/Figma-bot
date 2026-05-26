'use client';

import React, { useState } from 'react';
import { Code2, LogIn, LogOut, User, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
          <Code2 className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-black">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            Frame<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-extrabold ml-1">Flow</span>
            <span className="ml-2.5 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-md bg-white/[0.06] text-white/70 border border-white/[0.08]">
              MVP v1.0
            </span>
          </h1>
          <p className="text-[11px] text-white/40 font-medium">AI-Powered Screen-to-React Converter</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {loading ? (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/40">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
            <span>Connecting...</span>
          </div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-medium text-white/80 hover:text-white transition-all active:scale-98 cursor-pointer select-none"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Profile'}
                  className="w-6 h-6 rounded-full border border-white/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <User className="w-3 h-3" />
                </div>
              )}
              <span className="hidden sm:inline max-w-[100px] truncate">
                {user.displayName?.split(' ')[0] || 'Account'}
              </span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/[0.08] bg-[#0c0d14]/95 backdrop-blur-xl p-1.5 shadow-xl shadow-black/40 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.displayName || 'User Account'}</p>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                    }}
                    className="flex w-full items-center space-x-2 px-3 py-2 text-left rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-xs font-semibold text-white shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

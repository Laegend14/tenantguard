'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LogIn, LogOut, Check, Sparkles } from 'lucide-react';

interface AuthContextType {
  isSignedIn: boolean;
  user: {
    fullName: string;
    email: string;
    borough: string;
  } | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string; email: string; borough: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tenantguard-auth-status');
    if (saved === 'signed-in') {
      setIsSignedIn(true);
      setUser({
        fullName: 'Alex Rivera',
        email: 'alex.rivera@nyctenant.org',
        borough: 'Brooklyn',
      });
    }
  }, []);

  const signIn = () => {
    setIsSignedIn(true);
    setUser({
      fullName: 'Alex Rivera',
      email: 'alex.rivera@nyctenant.org',
      borough: 'Brooklyn',
    });
    localStorage.setItem('tenantguard-auth-status', 'signed-in');
  };

  const signOut = () => {
    setIsSignedIn(false);
    setUser(null);
    localStorage.removeItem('tenantguard-auth-status');
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}

export function Show({ when, children }: { when: 'signed-in' | 'signed-out'; children: React.ReactNode }) {
  const { isSignedIn } = useAuthContext();
  if (when === 'signed-in' && isSignedIn) return <>{children}</>;
  if (when === 'signed-out' && !isSignedIn) return <>{children}</>;
  return null;
}

export function SignInButton({ children, mode }: { children?: React.ReactNode; mode?: string }) {
  const { signIn } = useAuthContext();
  return (
    <div onClick={signIn} className="inline-block cursor-pointer">
      {children || <button className="btn-pill-primary text-xs px-3.5 py-1.5">Sign In</button>}
    </div>
  );
}

export function SignUpButton({ children }: { children?: React.ReactNode }) {
  const { signIn } = useAuthContext();
  return (
    <div onClick={signIn} className="inline-block cursor-pointer">
      {children || <button className="btn-pill-primary text-xs px-3.5 py-1.5">Sign Up</button>}
    </div>
  );
}

export function UserButton({ appearance }: { appearance?: any }) {
  const { user, signOut } = useAuthContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--primary-purple)] transition-colors text-xs font-semibold text-[var(--text-primary)]"
        aria-label="User profile menu"
      >
        <div className="w-5 h-5 rounded-full bg-[var(--primary-purple)] text-white flex items-center justify-center text-[10px] font-bold">
          {user?.fullName?.charAt(0) || 'A'}
        </div>
        <span className="hidden sm:inline">{user?.fullName || 'Alex R.'}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
            <div className="text-xs font-bold text-[var(--text-primary)]">{user?.fullName}</div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</div>
          </div>
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

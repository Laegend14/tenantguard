'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatbotDrawer } from '@/components/ChatbotDrawer';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-main)]">
      {/* Modern Left Sidebar */}
      <Sidebar onOpenChat={() => setIsChatOpen(true)} />
      
      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full">
        <main className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>

        {/* Global Floating TenantGuard AI Assistant Button */}
        <div className="fixed bottom-5 right-5 z-30">
          <button
            onClick={() => setIsChatOpen(true)}
            className="btn-pill-primary shadow-lg px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 group"
            title="Open TenantGuard AI Legal Assistant"
          >
            <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
            <span>Ask Legal AI</span>
          </button>
        </div>

        {/* Global Chatbot Drawer */}
        <ChatbotDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Minimal Footer */}
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-main)] py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-primary)]">TenantGuard NYC</span>
              <span>•</span>
              <span>Built for LexHack 2026 (Civic Tech Track)</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/eviction-defense" className="hover:text-[var(--primary-purple)] transition-colors">
                Eviction Defense
              </Link>
              <Link href="/security-deposit" className="hover:text-[var(--primary-purple)] transition-colors">
                Deposit Recovery
              </Link>
              <Link href="/hpd-lookup" className="hover:text-[var(--primary-purple)] transition-colors">
                HPD Violations
              </Link>
              <Link href="/dashboard" className="hover:text-[var(--primary-purple)] transition-colors">
                Dashboard
              </Link>
            </div>

            <div className="text-center md:text-right text-[11px] max-w-md">
              Informational civic tool grounded in NY HSTPA 2019, RPAPL § 711 & GOL § 7-108. Not an attorney substitute.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

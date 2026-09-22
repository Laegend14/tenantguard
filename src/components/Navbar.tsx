'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { 
  ShieldAlert, 
  Coins, 
  Search, 
  LayoutDashboard, 
  Menu, 
  X,
  FileText,
  Sparkles
} from 'lucide-react';
import { SignInButton, SignUpButton, Show, UserButton } from '@/components/AuthWrapper';

export function Navbar({ onOpenChat }: { onOpenChat?: () => void }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/eviction-defense', label: 'Eviction Defense', icon: ShieldAlert, badge: 'RPAPL 711' },
    { href: '/security-deposit', label: 'Deposit Recovery', icon: Coins, badge: 'GOL 7-108' },
    { href: '/hpd-lookup', label: 'Building Lookup', icon: Search, badge: 'NYC HPD' },
    { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 relative flex-shrink-0">
            <Image 
              src="/logo.svg" 
              alt="TenantGuard Logo" 
              width={36} 
              height={36} 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
                Tenant<span className="text-[var(--primary-purple)]">Guard</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[var(--badge-bg)] text-[var(--badge-text)]">
                NYC
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] -mt-0.5">
              AI Housing Rights & Enforcement
            </span>
          </div>
        </Link>

        {/* Desktop Menu Bar (Explore the App) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--primary-purple)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.badge && !isActive && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] font-mono">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: AI Assistant, Theme Toggle & Clerk Auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="btn-pill-secondary text-xs px-3 py-1.5"
              type="button"
              title="Open TenantGuard Legal AI (Live)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary-purple)]" />
              <span>Ask Legal AI</span>
            </button>
          )}

          <ThemeToggle />

          {/* Clerk Auth Integration */}
          <div className="flex items-center pl-1 border-l border-[var(--border-subtle)]">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="btn-pill-primary text-xs px-3.5 py-1.5">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-8 h-8 rounded-full border border-[var(--border-subtle)]'
                  }
                }}
              />
            </Show>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[var(--primary-purple)] text-white'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] font-mono">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            {onOpenChat && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChat();
                }}
                className="btn-pill-secondary text-xs px-3 py-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--primary-purple)]" />
                <span>Ask Legal AI</span>
              </button>
            )}

            <div>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="btn-pill-primary text-xs px-4 py-1.5">
                    Sign In
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

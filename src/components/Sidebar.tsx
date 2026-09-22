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
  Home,
  Sparkles,
  Menu,
  X,
  Scale,
  LogOut,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

export function Sidebar({ onOpenChat }: { onOpenChat?: () => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/eviction-defense', label: 'Eviction Defense', icon: ShieldAlert, badge: 'RPAPL 711' },
    { href: '/security-deposit', label: 'Deposit Recovery', icon: Coins, badge: 'GOL 7-108' },
    { href: '/hpd-lookup', label: 'Building Violations', icon: Search, badge: 'NYC HPD' },
    { href: '/dashboard', label: 'Case Vault', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image 
            src="/logo.svg" 
            alt="TenantGuard Logo" 
            width={28} 
            height={28} 
            className="w-7 h-7 object-contain"
            priority
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
                Tenant<span className="text-[var(--primary-purple)]">Guard</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)]">
                NYC
              </span>
            </div>
            <span className="text-[8px] font-bold tracking-wider text-[var(--primary-purple)] uppercase -mt-0.5">
              Defend • Recover • Enforce
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* Desktop & Mobile Slide-out Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand Identity */}
        <div>
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 group">
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
                <span className="text-[9px] font-bold tracking-wider text-[var(--primary-purple)] uppercase mt-0.5">
                  Defend • Recover • Enforce
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Menu Navigation
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--primary-purple)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[var(--badge-bg)] text-[var(--badge-text)]'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* AI Legal Assistant Button in Sidebar */}
          {onOpenChat && (
            <div className="px-3 pt-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenChat();
                }}
                className="w-full btn-pill-secondary text-xs px-3.5 py-2.5 flex items-center justify-between border-[var(--primary-purple)] text-[var(--primary-purple)] hover:bg-[var(--primary-purple-light)]"
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">Ask Legal AI</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: Theme Toggle & Real Clerk Auth Controls */}
        <div className="p-4 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--bg-surface)]">
          
          {/* Controls Bar: Theme Toggle Symbol Only */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-medium">Appearance</span>
            <ThemeToggle />
          </div>

          {/* Real Clerk Auth Integration (Not Simulated) */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <Show when="signed-out">
              <div className="space-y-2">
                <SignInButton mode="modal">
                  <button className="btn-pill-primary w-full text-xs py-2">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-pill-secondary w-full text-xs py-2">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: 'w-7 h-7 rounded-full border border-[var(--border-subtle)]'
                      }
                    }}
                  />
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[120px]">
                    My Account
                  </span>
                </div>
              </div>
            </Show>
          </div>

        </div>
      </aside>
    </>
  );
}

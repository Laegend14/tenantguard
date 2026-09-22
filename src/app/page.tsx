'use client';

import React from 'react';
import Link from 'next/link';
import { ImageSlider } from '@/components/ImageSlider';
import { 
  ShieldAlert, 
  Coins, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  FileText, 
  Sparkles,
  Lock,
  Building2,
  Clock
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      
      {/* Hero Section: Concise Problem & Solution */}
      <section className="pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Civic Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--badge-bg)] text-[var(--badge-text)] text-xs font-semibold mb-4 border border-[var(--border-subtle)]">
          <Scale className="w-3.5 h-3.5" />
          <span>New York City Housing Rights & Statutory Enforcement</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15] mb-4">
          90% of NYC Landlords Have Lawyers.{' '}
          <span className="text-[var(--primary-purple)]">
            Now You Have TenantGuard.
          </span>
        </h1>

        {/* Concise Problem & Solution Pitch */}
        <p className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-7 leading-relaxed">
          <strong>The Problem:</strong> Landlords issue defective notices with illegal fees and withhold deposits, knowing tenants can't afford legal counsel.<br />
          <strong>The Solution:</strong> Instant statutory defect detection under the 2019 HSTPA, 2x punitive damages calculation, and court-ready defense letters.
        </p>

        {/* Primary Call to Action Buttons (Pill buttons, no glow, no circle buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/eviction-defense"
            className="btn-pill-primary px-5 py-3 text-sm font-semibold"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Defend Eviction Notice</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/security-deposit"
            className="btn-pill-secondary px-5 py-3 text-sm font-semibold"
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Recover 2x Deposit</span>
          </Link>

          <Link
            href="/hpd-lookup"
            className="btn-pill-outline px-4 py-3 text-sm font-semibold hidden sm:inline-flex"
          >
            <Search className="w-4 h-4" />
            <span>Check Building Violations</span>
          </Link>
        </div>

        {/* Trust & Statutory Highlights */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>NY RPAPL § 711 (14-Day Rule)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>NY GOL § 7-108 (2x Damages)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>RPL § 238-a ($50 Late Fee Cap)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Certified Digital Notice Dispatch</span>
          </div>
        </div>

      </section>

      {/* Real Image Slider Carousel Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <ImageSlider />
      </section>

      {/* The Two Core Pillars (Problem & Solution Grid - Minimal Scrolling) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Two Weapons Against Bad-Faith Landlords
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Deterministic statutory math backed by official New York State statutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Eviction Notice Defense */}
          <div className="card-surface p-6 flex flex-col justify-between hover:border-[var(--primary-purple)] transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-purple-light)] text-[var(--primary-purple)] flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)]">
                  NY RPAPL § 711(2)
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  14-Day Demand
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                Eviction Notice Defect Shield
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Did your landlord give you a 3-day notice, slap on a $150 late fee, or text you to move out? That is illegal in New York. We spot procedural defects and generate a formal answer to stop summary proceedings.
              </p>
              
              <ul className="space-y-2 text-xs text-[var(--text-secondary)] mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Checks mandatory 14 calendar day cure window</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Flags late fees exceeding $50 or 5% cap (RPL § 238-a)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Identifies invalid non-rent additions to demands</span>
                </li>
              </ul>
            </div>

            <Link
              href="/eviction-defense"
              className="btn-pill-primary w-full text-xs font-semibold py-2.5"
            >
              <span>Scan Eviction Notice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Security Deposit Recovery */}
          <div className="card-surface p-6 flex flex-col justify-between hover:border-[var(--primary-purple)] transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <Coins className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  NY GOL § 7-108
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Strict 14-Day Clock
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                Security Deposit 2x Forfeiture Engine
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Moved out and your landlord hasn't sent an itemized receipt within 14 days? Under NY law, they forfeit 100% of the deposit and owe up to 2x statutory punitive damages in NYC Small Claims Court.
              </p>
              
              <ul className="space-y-2 text-xs text-[var(--text-secondary)] mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Automatic forfeiture calculation after 14 calendar days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>2x statutory punitive damages multiplier</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Generates official Pre-Action Demand & Small Claims Kit</span>
                </li>
              </ul>
            </div>

            <Link
              href="/security-deposit"
              className="btn-pill-primary w-full text-xs font-semibold py-2.5"
            >
              <span>Calculate Deposit Recovery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Quick Explore App Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="card-surface p-6 sm:p-8 bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-surface-elevated)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-[var(--primary-purple)] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Suite Civic Platform</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Explore TenantGuard Dashboard & Live Tools
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg">
              Check building violations on NYC Open Data, consult our TenantGuard AI legal assistant, and track your active cases.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hpd-lookup"
              className="btn-pill-secondary text-xs px-4 py-2.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>HPD Building Lookup</span>
            </Link>
            <Link
              href="/dashboard"
              className="btn-pill-primary text-xs px-4 py-2.5"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

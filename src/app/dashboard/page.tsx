'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Coins, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Send, 
  Truck, 
  ExternalLink,
  Plus, 
  ArrowRight, 
  ShieldCheck,
  Database,
  MessageSquare,
  DollarSign,
  Search,
  Mail,
  RefreshCw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { DocumentModal } from '@/components/DocumentModal';
import { logPaymentRecord } from '@/lib/firebase';

interface HistoryItem {
  id: string;
  type: 'ai_chat' | 'payment' | 'eviction_audit' | 'deposit_claim' | 'hpd_lookup' | 'certified_dispatch';
  title: string;
  summary: string;
  timestamp: string;
  metadata?: Record<string, any>;
  status?: string;
  amount?: string;
  ref?: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const paymentItem = searchParams.get('item');
  const caseParam = searchParams.get('case');

  const [activeModalDoc, setActiveModalDoc] = useState<{
    title: string;
    content: string;
    ref: string;
    tenant: string;
    landlord: string;
    type: string;
  } | null>(null);

  const [historyTab, setHistoryTab] = useState<string>('all');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<HistoryItem | null>(null);

  // Load history from Firebase endpoint
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.history) {
        setHistoryItems(data.history);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // If redirected from Stripe checkout with success, auto-log payment into Firebase
  useEffect(() => {
    if (paymentSuccess && paymentItem) {
      const isCertified = paymentItem === 'certified_mail';
      const itemName = isCertified ? 'USPS Certified Mail Dispatch' : 'NYC Small Claims Pro Filing Kit';
      const itemAmount = isCertified ? '$14.99' : '$29.00';
      const refId = `cs_stripe_${Date.now().toString().slice(-6)}`;
      
      logPaymentRecord(itemName, itemAmount, refId).then(() => {
        fetchHistory();
      });
    }
  }, [paymentSuccess, paymentItem]);

  const demoCases = [
    {
      id: 'TG-HSTPA-910284',
      title: 'Defective 5-Day Rent Demand Challenge',
      type: 'Eviction Defense (RPAPL § 711)',
      landlord: 'Empire Metropolitan Properties LLC',
      status: 'DISPATCHED_DIGITAL_NOTICE',
      deadline: 'Sept 28, 2026 (7 Days Remaining)',
      urgency: 'high',
      amountDisputed: '$2,800.00',
      violationsFound: ['Notice < 14 Days (RPAPL § 711)', '$150 Late Fee Exceeds Cap (RPL § 238-a)'],
      sampleLetter: `NOTICE OF STATUTORY DEFECT AND FORMAL ANSWER TO DEFECTIVE RENT DEMAND\nPURSUANT TO NEW YORK RPAPL § 711 & RPL § 238-a\n\nTO: Empire Metropolitan Properties LLC\nFROM: Alex Rivera\nPremises: 422 St. Marks Ave, Apt 3B, Brooklyn, NY\n\nPLEASE BE ADVISED that the purported Notice of Rent Demand dated Sept 18, 2026 contains fatal statutory defects under New York law.\n1. Notice period provided was only 5 days, violating the mandatory 14-day requirement under RPAPL § 711(2).\n2. Demanded late fee of $150 violates the statutory cap of $50 under RPL § 238-a.\n\nYou are demanded to rescind this defective notice immediately.`
    },
    {
      id: 'TG-GOL-742910',
      title: 'Security Deposit 14-Day Forfeiture Claim',
      type: 'Deposit Recovery (NY GOL § 7-108)',
      landlord: 'Midtown West Asset Management Group',
      status: 'PRE_ACTION_DEMAND_READY',
      deadline: 'Passed (Statutory Forfeiture Triggered)',
      urgency: 'resolved_claim',
      amountDisputed: '$3,200.00 Base ($9,600.00 with 2x Punitive Damages)',
      violationsFound: ['14-Day Forfeiture Triggered', 'Statutory 2x Punitive Damages Claimable'],
      sampleLetter: `PRE-ACTION DEMAND FOR RETURN OF SECURITY DEPOSIT\nNOTICE OF COMPLETE STATUTORY FORFEITURE & INTENT TO SUE FOR 2X PUNITIVE DAMAGES\nPURSUANT TO NEW YORK GENERAL OBLIGATIONS LAW § 7-108\n\nTO: Midtown West Asset Management Group\nFROM: Morgan Chen\n\nOver 20 days have passed since keys were surrendered without an itemized statement. Under NY GOL § 7-108(1-a)(e), you have forfeited all rights to retain any portion of the $3,200.00 deposit. Full statutory claim including 2x punitive damages is $9,600.00.`
    }
  ];

  const filteredHistory = historyTab === 'all' 
    ? historyItems 
    : historyItems.filter(item => item.type === historyTab);

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'ai_chat':
        return { label: 'AI Chat', icon: MessageSquare, bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' };
      case 'payment':
        return { label: 'Payment', icon: DollarSign, bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'eviction_audit':
        return { label: 'Notice Audit', icon: ShieldAlert, bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' };
      case 'deposit_claim':
        return { label: 'Deposit Claim', icon: Coins, bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' };
      case 'hpd_lookup':
        return { label: 'HPD Lookup', icon: Search, bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' };
      case 'certified_dispatch':
        return { label: 'Certified Mail', icon: Mail, bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' };
      default:
        return { label: 'Activity', icon: Clock, bg: 'bg-gray-500/10', text: 'text-gray-600' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--badge-text)] text-xs font-semibold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Tenant Case Vault & Tracking Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            My Housing Defense Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Realtime Firebase history tracking statutory deadlines, AI queries, payments, and generated court packets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/eviction-defense"
            className="btn-pill-primary text-xs px-3.5 py-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Notice Audit</span>
          </Link>
          <Link
            href="/security-deposit"
            className="btn-pill-secondary text-xs px-3.5 py-2"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>New Deposit Claim</span>
          </Link>
        </div>
      </div>

      {/* Stripe Payment Notification (if redirected from checkout) */}
      {paymentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <strong className="text-sm font-bold">Payment & Order Confirmed!</strong>
            <p>
              Your order for <strong>{paymentItem === 'certified_mail' ? 'USPS Certified Mail Dispatch' : 'NYC Small Claims Pro Filing Kit'}</strong> has been processed via Stripe and synced to your <strong>Firebase Payment Vault</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE POSTAL & CERTIFIED NOTICE TRACKER CARD */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-purple)] text-white flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                USPS Certified Mail & Digital Notice Tracker
              </h3>
              <p className="text-[11px] font-mono text-[var(--text-muted)]">
                Tracking Barcode: 9407 1118 9956 2104 3982 11
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 self-start sm:self-auto">
            IN TRANSIT • EXPECTED DELIVERY IN 2 DAYS
          </span>
        </div>

        {/* Multi-step progress track */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-emerald-500/30">
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Order Placed</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Processed via Stripe</p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-emerald-500/30">
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Letter Printed</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Certified barcoded label</p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--primary-purple)]">
            <div className="flex items-center gap-1.5 text-[var(--primary-purple)] font-bold mb-1">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>3. In Transit (USPS)</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Departed Metro NY P&DC</p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] opacity-70">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>4. Return Receipt</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Signature pending</p>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* FIREBASE REALTIME ACTIVITY & APP USAGE HISTORY CENTER                  */}
      {/* ====================================================================== */}
      <div className="card-surface p-6 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Firebase Realtime Activity & Dispute History
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                  <span>Active Firestore Sync</span>
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Persistent audit log of AI consultations, Stripe payments, notice scans, and certified mail dispatches.
              </p>
            </div>
          </div>

          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="btn-pill-outline text-xs px-3 py-1.5 self-start sm:self-auto flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${loadingHistory ? 'animate-spin' : ''}`} />
            <span>Sync Records</span>
          </button>
        </div>

        {/* History Category Tabs */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[var(--border-subtle)]">
          {[
            { id: 'all', label: 'All Activity', count: historyItems.length },
            { id: 'ai_chat', label: 'AI Chats', count: historyItems.filter(i => i.type === 'ai_chat').length },
            { id: 'payment', label: 'Payments', count: historyItems.filter(i => i.type === 'payment').length },
            { id: 'eviction_audit', label: 'Notice Audits', count: historyItems.filter(i => i.type === 'eviction_audit').length },
            { id: 'deposit_claim', label: 'Deposit Claims', count: historyItems.filter(i => i.type === 'deposit_claim').length },
            { id: 'certified_dispatch', label: 'Certified Mail', count: historyItems.filter(i => i.type === 'certified_dispatch').length },
            { id: 'hpd_lookup', label: 'HPD Lookups', count: historyItems.filter(i => i.type === 'hpd_lookup').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHistoryTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                historyTab === tab.id
                  ? 'bg-[var(--primary-purple)] text-white shadow-sm'
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                historyTab === tab.id ? 'bg-white/20 text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* History List */}
        {loadingHistory ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            <Sparkles className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--primary-purple)]" />
            Loading records from Firebase Activity Vault...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            No history recorded in this category yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const badge = getBadgeForType(item.type);
              const Icon = badge.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(selectedRecord?.id === item.id ? null : item)}
                  className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--primary-purple)] transition-all cursor-pointer space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-1.5 rounded-lg ${badge.bg} ${badge.text}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                          <span>{new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          {item.ref && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{item.ref}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {item.amount && (
                        <span className="text-xs font-bold font-mono text-[var(--primary-purple)]">
                          {item.amount}
                        </span>
                      )}
                      {item.status && (
                        <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--badge-text)]">
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] pl-9">
                    {item.summary}
                  </p>

                  {/* Expanded Metadata Viewer if selected */}
                  {selectedRecord?.id === item.id && item.metadata && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] pl-9 space-y-2">
                      <p className="text-[11px] font-bold text-[var(--text-primary)]">
                        Firestore Payload Details:
                      </p>
                      <div className="bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(item.metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTIVE CASE DISPUTE PACKETS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Active Dispute Letters & Court Kits
        </h2>

        <div className="space-y-4">
          {demoCases.map((c) => (
            <div
              key={c.id}
              className="card-surface p-5 sm:p-6 space-y-4 hover:border-[var(--primary-purple)] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)]">
                      {c.id}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      {c.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                    {c.title}
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-[var(--primary-purple)]">
                    {c.amountDisputed}
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {c.deadline}
                  </span>
                </div>
              </div>

              {/* Violations List */}
              <div className="flex flex-wrap gap-2 text-xs">
                {c.violationsFound.map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium text-[11px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{v}</span>
                  </span>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-[var(--text-muted)]">
                  Landlord: <strong>{c.landlord}</strong>
                </span>

                <button
                  onClick={() =>
                    setActiveModalDoc({
                      title: c.title,
                      content: c.sampleLetter,
                      ref: c.id,
                      tenant: 'Protected Tenant',
                      landlord: c.landlord,
                      type: c.type,
                    })
                  }
                  type="button"
                  className="btn-pill-primary text-xs px-4 py-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View & Dispatch Letter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Active Document */}
      {activeModalDoc && (
        <DocumentModal
          isOpen={true}
          onClose={() => setActiveModalDoc(null)}
          title={activeModalDoc.title}
          letterContent={activeModalDoc.content}
          caseRef={activeModalDoc.ref}
          tenantName={activeModalDoc.tenant}
          landlordName={activeModalDoc.landlord}
          documentType={activeModalDoc.type}
        />
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

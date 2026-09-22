'use client';

import React, { useState } from 'react';
import { 
  Coins, 
  Sparkles, 
  Calendar, 
  FileText, 
  Scale, 
  ArrowRight, 
  AlertCircle,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  calculateSecurityDepositRecovery, 
  SecurityDepositInput, 
  SecurityDepositResult 
} from '@/lib/ny-housing-engine';
import { DocumentModal } from '@/components/DocumentModal';
import { logDepositClaim } from '@/lib/firebase';

export default function SecurityDepositPage() {
  const [formData, setFormData] = useState<SecurityDepositInput>({
    tenantName: 'Morgan Chen',
    tenantNewAddress: '789 Grand St, Apt 2F, Brooklyn, NY 11211',
    landlordName: 'Hudson & East River Real Estate Management LLC',
    landlordAddress: '270 Park Avenue, 14th Floor, New York, NY 10017',
    apartmentAddress: '154 Franklin Street, Apt 4B',
    borough: 'Brooklyn',
    moveOutDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 22 days ago (> 14 days)
    forwardingAddressDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    depositAmount: 3200,
    hasReceivedItemizedDeduction: false,
  });

  const [result, setResult] = useState<SecurityDepositResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = calculateSecurityDepositRecovery(formData);
    setResult(res);

    try {
      logDepositClaim(
        formData.landlordName,
        formData.depositAmount,
        res.totalPotentialRecovery,
        res.isForfeited
      );
    } catch {}

    if (res.isForfeited) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#8B5CF6', '#10B981', '#FBBF24']
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const loadPresetOverdueDeposit = () => {
    const updated: SecurityDepositInput = {
      tenantName: 'Taylor Washington',
      tenantNewAddress: '312 W 14th Street, Apt 5C, New York, NY 10014',
      landlordName: 'Midtown West Asset Management Group',
      landlordAddress: '550 Madison Ave, New York, NY 10022',
      apartmentAddress: '410 W 48th St, Apt 3A',
      borough: 'Manhattan',
      moveOutDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      forwardingAddressDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      depositAmount: 2850,
      hasReceivedItemizedDeduction: false,
    };
    setFormData(updated);
    setTimeout(() => {
      const res = calculateSecurityDepositRecovery(updated);
      setResult(res);
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#8B5CF6', '#10B981', '#FBBF24']
        });
      } catch (e) {}
    }, 50);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>NY General Obligations Law § 7-108 Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            NYC Security Deposit 14-Day Forfeiture Engine
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Calculate your legal claim and statutory 2x punitive damages for untimely deposit withholding.
          </p>
        </div>

        <div>
          <button
            onClick={loadPresetOverdueDeposit}
            type="button"
            className="btn-pill-secondary text-xs px-3.5 py-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load NYC 25-Day Overdue Demo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <form onSubmit={handleCalculate} className="lg:col-span-7 card-surface p-6 space-y-5">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Tenancy & Move-Out Details
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              NYC landlords have exactly 14 calendar days from surrender of premises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={formData.tenantName}
                onChange={e => setFormData({ ...formData, tenantName: e.target.value })}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                NYC Borough of Apartment
              </label>
              <select
                value={formData.borough}
                onChange={e => setFormData({ ...formData, borough: e.target.value as any })}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
              >
                <option value="Manhattan">Manhattan</option>
                <option value="Brooklyn">Brooklyn</option>
                <option value="Queens">Queens</option>
                <option value="Bronx">Bronx</option>
                <option value="Staten Island">Staten Island</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Former Rental Address
            </label>
            <input
              type="text"
              value={formData.apartmentAddress}
              onChange={e => setFormData({ ...formData, apartmentAddress: e.target.value })}
              className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Your Current Forwarding Address
            </label>
            <input
              type="text"
              value={formData.tenantNewAddress}
              onChange={e => setFormData({ ...formData, tenantNewAddress: e.target.value })}
              className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Landlord / Management Name
              </label>
              <input
                type="text"
                value={formData.landlordName}
                onChange={e => setFormData({ ...formData, landlordName: e.target.value })}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Landlord Address
              </label>
              <input
                type="text"
                value={formData.landlordAddress}
                onChange={e => setFormData({ ...formData, landlordAddress: e.target.value })}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
                required
              />
            </div>
          </div>

          {/* Statutory Timing & Amount */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Statutory 14-Day Clock Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Date Keys Surrendered (Move-Out)
                </label>
                <input
                  type="date"
                  value={formData.moveOutDate}
                  onChange={e => setFormData({ ...formData, moveOutDate: e.target.value })}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Original Deposit Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.depositAmount}
                  onChange={e => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] font-bold text-[var(--primary-purple)]"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasReceivedItemizedDeduction}
                  onChange={e => setFormData({ ...formData, hasReceivedItemizedDeduction: e.target.checked })}
                  className="mt-0.5 rounded text-[var(--primary-purple)] focus:ring-0"
                />
                <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  I received a written, itemized receipt detailing deductions from my landlord within 14 days of moving out. (Leave unchecked if landlord ghosted or missed the 14-day statutory deadline).
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-pill-primary w-full py-3 text-xs font-semibold"
          >
            <Coins className="w-4 h-4" />
            <span>Calculate Statutory Forfeiture & Damages</span>
          </button>
        </form>

        {/* Calculation Result Column */}
        <div className="lg:col-span-5 space-y-5">
          {result ? (
            <div className="card-surface p-6 space-y-5 animate-in fade-in duration-300">
              
              {/* Forfeiture Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                result.isForfeited 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {result.isForfeited ? 'COMPLETE STATUTORY FORFEITURE' : 'WITHIN 14-DAY WINDOW'}
                  </h4>
                  <p className="text-xs leading-relaxed">
                    {result.isForfeited
                      ? `It has been ${result.daysElapsed} days since surrender. Under NY GOL § 7-108, the landlord has forfeited 100% of their right to withhold any deposit portion.`
                      : `${result.countdownDaysRemaining} days remaining in the landlord's statutory 14-day compliance window.`}
                  </p>
                </div>
              </div>

              {/* Financial Claim Breakdown Box */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Total Legal Claim Breakdown
                </h4>

                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Original Base Deposit Owed:</span>
                  <span className="font-semibold text-[var(--text-primary)]">${result.originalDeposit.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400">
                  <span>Statutory 2x Punitive Damages (GOL § 7-108):</span>
                  <span className="font-semibold">+${result.punitiveDamagesAmount.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Total Action Claim:</span>
                  <span className="text-xl font-extrabold text-[var(--primary-purple)]">
                    ${result.totalPotentialRecovery.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Small Claims Venue */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <Building className="w-3.5 h-3.5 text-[var(--primary-purple)]" />
                  <span>NYC Small Claims Venue:</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                  {result.smallClaimsBoroughCourt} (Claims up to $10,000 eligible).
                </p>
              </div>

              {/* Document Modal Trigger */}
              <button
                onClick={() => setIsModalOpen(true)}
                type="button"
                className="btn-pill-primary w-full py-3 text-xs font-semibold"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Pre-Action Demand Letter</span>
              </button>

            </div>
          ) : (
            <div className="card-surface p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Ready for Deposit Analysis
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                Enter your move-out date and deposit amount to check if statutory forfeiture has triggered.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Document Modal */}
      {result && (
        <DocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Pre-Action Demand for Return of Security Deposit (NY GOL § 7-108)"
          letterContent={result.formalDemandLetter}
          caseRef={`NY-GOL-${Date.now().toString().slice(-6)}`}
          tenantName={formData.tenantName}
          landlordName={formData.landlordName}
          documentType="Security Deposit Demand (2x Statutory Penalty)"
        />
      )}

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  Send, 
  ArrowRight,
  Info,
  Scale,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  analyzeEvictionNotice, 
  EvictionNoticeInput, 
  EvictionAnalysisResult 
} from '@/lib/ny-housing-engine';
import { DocumentModal } from '@/components/DocumentModal';
import { logNoticeAudit } from '@/lib/firebase';

export default function EvictionDefensePage() {
  const [formData, setFormData] = useState<EvictionNoticeInput>({
    tenantName: 'Alex Rivera',
    tenantAddress: '422 St. Marks Ave, Apt 3B',
    borough: 'Brooklyn',
    landlordName: 'Empire Metropolitan Properties LLC',
    landlordAddress: '150 Broadway, Suite 800, New York, NY 10038',
    noticeType: '14_day_rent_demand',
    dateServed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysGiven: 5, // Defective notice scenario (< 14 days)
    monthlyRent: 2800,
    baseRentDemanded: 2800,
    lateFeesIncluded: 150, // Defective fee scenario (> $50 cap)
    otherFeesIncluded: 75, // Non-rent charges scenario
    serviceMethod: 'conspicuous_nail_mail'
  });

  const [result, setResult] = useState<EvictionAnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnalyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = analyzeEvictionNotice(formData);
    setResult(res);
    try {
      logNoticeAudit(
        formData.landlordName, 
        res.violations.map(v => v.title), 
        formData.daysGiven, 
        formData.baseRentDemanded
      );
    } catch {}
  };

  const loadPresetDefectiveNotice = () => {
    setFormData({
      tenantName: 'Jordan Taylor',
      tenantAddress: '185 E 109th St, Apt 4A',
      borough: 'Manhattan',
      landlordName: 'Gotham Skyline Holdings Management',
      landlordAddress: '350 5th Avenue, New York, NY 10118',
      noticeType: '14_day_rent_demand',
      dateServed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysGiven: 3, // Highly defective!
      monthlyRent: 3100,
      baseRentDemanded: 3100,
      lateFeesIncluded: 200, // Illegal late fee ($200 > $50)
      otherFeesIncluded: 120, // Illegal non-rent surcharge
      serviceMethod: 'text_or_email_only' // Illegal service
    });
    // Run analysis immediately on preset load
    setTimeout(() => {
      const res = analyzeEvictionNotice({
        tenantName: 'Jordan Taylor',
        tenantAddress: '185 E 109th St, Apt 4A',
        borough: 'Manhattan',
        landlordName: 'Gotham Skyline Holdings Management',
        landlordAddress: '350 5th Avenue, New York, NY 10118',
        noticeType: '14_day_rent_demand',
        dateServed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysGiven: 3,
        monthlyRent: 3100,
        baseRentDemanded: 3100,
        lateFeesIncluded: 200,
        otherFeesIncluded: 120,
        serviceMethod: 'text_or_email_only'
      });
      setResult(res);
    }, 50);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--badge-text)] text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>NY RPAPL § 711 & RPL § 238-a Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            NYC Eviction Notice Defect Scanner
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Detect fatal procedural and statutory flaws under the 2019 Housing Stability & Tenant Protection Act (HSTPA).
          </p>
        </div>

        {/* Demo Preset Trigger */}
        <div>
          <button
            onClick={loadPresetDefectiveNotice}
            type="button"
            className="btn-pill-secondary text-xs px-3.5 py-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary-purple)]" />
            <span>Load NYC Defect Demo Scenario</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Input Form Column */}
        <form onSubmit={handleAnalyze} className="lg:col-span-7 card-surface p-6 space-y-5">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Notice Details & Claims
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Enter the exact terms and numbers stated on your landlord's notice.
            </p>
          </div>

          {/* Tenant & Landlord Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={formData.tenantName}
                onChange={e => setFormData({ ...formData, tenantName: e.target.value })}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-purple)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                NYC Borough
              </label>
              <select
                value={formData.borough}
                onChange={e => setFormData({ ...formData, borough: e.target.value as any })}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-purple)]"
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
              Your Apartment Address
            </label>
            <input
              type="text"
              value={formData.tenantAddress}
              onChange={e => setFormData({ ...formData, tenantAddress: e.target.value })}
              className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-purple)]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Landlord / Managing Agent Name
              </label>
              <input
                type="text"
                value={formData.landlordName}
                onChange={e => setFormData({ ...formData, landlordName: e.target.value })}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-purple)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Date Served / Received
              </label>
              <input
                type="date"
                value={formData.dateServed}
                onChange={e => setFormData({ ...formData, dateServed: e.target.value })}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-purple)]"
                required
              />
            </div>
          </div>

          {/* Statutory Notice Checks */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Statutory Notice Demands
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Days Given to Pay/Vacate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.daysGiven}
                    onChange={e => setFormData({ ...formData, daysGiven: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-purple)]"
                    min="1"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[11px] text-[var(--text-muted)]">days</span>
                </div>
                {formData.daysGiven < 14 && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    ⚠️ NY requires 14 full days under RPAPL § 711
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  How was it delivered?
                </label>
                <select
                  value={formData.serviceMethod}
                  onChange={e => setFormData({ ...formData, serviceMethod: e.target.value as any })}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-purple)]"
                >
                  <option value="conspicuous_nail_mail">Affixed to Door & Mailed ("Nail & Mail")</option>
                  <option value="personal">Hand Delivered to Me (Personal)</option>
                  <option value="text_or_email_only">Text Message or Email Only</option>
                  <option value="regular_mail">Regular Mail in Mailbox Only</option>
                </select>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Monthly Rent ($)
                </label>
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={e => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Base Rent Demanded ($)
                </label>
                <input
                  type="number"
                  value={formData.baseRentDemanded}
                  onChange={e => setFormData({ ...formData, baseRentDemanded: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Late Fees Added ($)
                </label>
                <input
                  type="number"
                  value={formData.lateFeesIncluded}
                  onChange={e => setFormData({ ...formData, lateFeesIncluded: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
                />
                {formData.lateFeesIncluded > 50 && (
                  <p className="text-[10px] text-rose-500 mt-1">
                    Exceeds NY $50 cap!
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-pill-primary w-full py-3 text-xs font-semibold"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Notice for NYC Statutory Defects</span>
          </button>
        </form>

        {/* Results & Violations Column */}
        <div className="lg:col-span-5 space-y-5">
          {result ? (
            <div className="card-surface p-6 space-y-5 animate-in fade-in duration-300">
              
              {/* Header Status */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Audit Findings
                  </h3>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {result.violations.length} statutory defect(s) detected
                  </span>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.hasDefects 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {result.hasDefects ? 'DEFECTIVE NOTICE' : 'COMPLIANT NOTICE'}
                </div>
              </div>

              {/* Defense Strength Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)] font-medium">Defense Leverage Score:</span>
                  <span className="font-bold text-[var(--primary-purple)]">{result.defenseScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primary-purple)] transition-all duration-500" 
                    style={{ width: `${result.defenseScore}%` }} 
                  />
                </div>
              </div>

              {/* List of Detected Violations */}
              <div className="space-y-3">
                {result.violations.map(v => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {v.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)]">
                        {v.statute}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {v.description}
                    </p>
                    <div className="text-[11px] font-semibold text-[var(--text-muted)]">
                      Impact: {v.legalImpact}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Trigger */}
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  type="button"
                  className="btn-pill-primary w-full py-3 text-xs font-semibold"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Court-Ready Defense Letter</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="card-surface p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--badge-bg)] text-[var(--badge-text)] flex items-center justify-center mx-auto">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Ready for Statutory Audit
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                Fill out the terms on your notice and click Audit, or click "Load NYC Defect Demo Scenario" above.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Document Preview & Dispatch Modal */}
      {result && (
        <DocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Notice of Statutory Defect & Answer to Defective Rent Demand"
          letterContent={result.formalDefenseLetter}
          caseRef={`NY-HSTPA-${Date.now().toString().slice(-6)}`}
          tenantName={formData.tenantName}
          landlordName={formData.landlordName}
          documentType="Eviction Defense Notice (RPAPL § 711)"
        />
      )}

    </div>
  );
}

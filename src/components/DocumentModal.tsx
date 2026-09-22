'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Mail, 
  ShieldCheck, 
  ExternalLink, 
  Printer,
  Sparkles,
  CreditCard
} from 'lucide-react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  letterContent: string;
  caseRef: string;
  tenantName: string;
  landlordName: string;
  documentType: string;
}

export function DocumentModal({
  isOpen,
  onClose,
  title,
  letterContent,
  caseRef,
  tenantName,
  landlordName,
  documentType,
}: DocumentModalProps) {
  const [copied, setCopied] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title} - ${caseRef}</title>
            <style>
              body { font-family: 'Times New Roman', Times, serif; padding: 40px; line-height: 1.5; font-size: 13pt; color: #000; }
              pre { white-space: pre-wrap; font-family: 'Times New Roman', Times, serif; }
            </style>
          </head>
          <body>
            <pre>${letterContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDispatchDigitalNotice = async () => {
    setDispatchStatus('sending');
    try {
      const res = await fetch('/api/dispatch-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim() || undefined,
          tenantName,
          landlordName,
          subject: `[STATUTORY LEGAL NOTICE] ${title} - Case Ref #${caseRef}`,
          documentType,
          letterContent,
          caseReference: caseRef,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchStatus('sent');
        setDispatchResult(data);
      } else {
        setDispatchStatus('error');
      }
    } catch (err) {
      setDispatchStatus('error');
    }
  };

  const handleStripeCheckout = async (itemType: 'certified_mail' | 'small_claims_kit') => {
    setStripeLoading(true);
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType, caseId: caseRef }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Stripe error:', err);
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-main)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-purple)] text-white flex items-center justify-center font-bold text-xs">
              TG
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {title}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">
                Legal Audit Reference: #{caseRef} • NYC Civil Court Admissible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] transition-colors"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch & Delivery Banner */}
        {dispatchStatus === 'sent' && (
          <div className="p-3 bg-[var(--success-bg)] text-[var(--success-text)] border-b border-[var(--success-border)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Certified Digital Notice Dispatched!</strong> Dispatched to {dispatchResult?.recipient || recipientEmail || 'landlord/recipient'} with cryptographic audit ID: {dispatchResult?.emailId || 'CONFIRMED'}
              </span>
            </div>
          </div>
        )}

        {dispatchStatus === 'error' && (
          <div className="p-3 bg-[var(--danger-bg)] text-[var(--danger-text)] border-b border-[var(--danger-border)] text-xs flex items-center gap-2">
            <span>Notice could not be dispatched via Resend. Check API configuration or copy text manually.</span>
          </div>
        )}

        {/* Document Content View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--bg-surface-elevated)]">
          <div className="bg-[var(--bg-surface)] p-5 sm:p-7 rounded-xl border border-[var(--border-subtle)] font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-primary)] shadow-sm">
            {letterContent}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-main)] flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Actions: Copy & Print */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className="btn-pill-secondary text-xs px-3.5 py-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="btn-pill-secondary text-xs px-3.5 py-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          {/* Right Actions: Resend Digital Dispatch & USPS Certified Mail */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Recipient / Landlord email..."
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--primary-purple)]"
            />
            <button
              onClick={handleDispatchDigitalNotice}
              disabled={dispatchStatus === 'sending' || dispatchStatus === 'sent'}
              type="button"
              className="btn-pill-primary text-xs px-4 py-2"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>
                {dispatchStatus === 'sending'
                  ? 'Dispatching...'
                  : dispatchStatus === 'sent'
                  ? 'Notice Dispatched ✓'
                  : 'Dispatch via Certified Email (Resend)'}
              </span>
            </button>

            <button
              onClick={() => handleStripeCheckout('certified_mail')}
              disabled={stripeLoading}
              type="button"
              className="btn-pill-secondary text-xs px-3.5 py-2 border-[var(--primary-purple)]"
              title="Print, fold, stamp and mail via USPS Certified Mail with barcode"
            >
              <CreditCard className="w-3.5 h-3.5 text-[var(--primary-purple)]" />
              <span>Mail via USPS Certified ($14.99)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

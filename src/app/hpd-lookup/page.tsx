'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Scale,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { logHpdLookup } from '@/lib/firebase';

interface Violation {
  id: string;
  orderNumber: string;
  class: 'A' | 'B' | 'C';
  description: string;
  status: string;
  inspectionDate: string;
  apartment: string;
  street: string;
}

export default function HpdLookupPage() {
  const [houseNumber, setHouseNumber] = useState('142');
  const [streetName, setStreetName] = useState('Bedford Ave');
  const [borough, setBorough] = useState('Brooklyn');
  const [loading, setLoading] = useState(false);
  const [violations, setViolations] = useState<Violation[] | null>(null);
  const [source, setSource] = useState<string>('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/hpd?houseNumber=${encodeURIComponent(houseNumber)}&streetName=${encodeURIComponent(streetName)}&borough=${encodeURIComponent(borough)}`
      );
      const data = await res.json();
      setViolations(data.violations || []);
      setSource(data.source || 'NYC OpenData');
      try {
        logHpdLookup(`${houseNumber} ${streetName}`, borough, (data.violations || []).length);
      } catch {}
    } catch (err) {
      console.error('HPD search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--badge-text)] text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>NYC Open Data • HPD Housing Maintenance Code</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            NYC Building Violation Lookup
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Search open housing code violations to establish breach of Implied Warranty of Habitability (NY RPL § 235-b).
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              setHouseNumber('142');
              setStreetName('Bedford Ave');
              setBorough('Brooklyn');
              handleSearch();
            }}
            type="button"
            className="btn-pill-secondary text-xs px-3.5 py-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary-purple)]" />
            <span>Search Demo Brooklyn Building</span>
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="card-surface p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Building Number
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={e => setHouseNumber(e.target.value)}
              placeholder="e.g. 142"
              className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Street Name
            </label>
            <input
              type="text"
              value={streetName}
              onChange={e => setStreetName(e.target.value)}
              placeholder="e.g. Bedford Ave or Broadway"
              className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Borough
            </label>
            <select
              value={borough}
              onChange={e => setBorough(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="btn-pill-primary w-full py-2.5 text-xs font-semibold"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{loading ? 'Querying NYC Open Data...' : 'Query NYC Housing Violations'}</span>
        </button>
      </form>

      {/* Results View */}
      {violations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Found <strong>{violations.length}</strong> recorded HPD violation(s) for <strong>{houseNumber} {streetName}, {borough}</strong>
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)]">
              Source: {source}
            </span>
          </div>

          <div className="space-y-3">
            {violations.map((v) => {
              const isClassC = v.class === 'C';
              const isClassB = v.class === 'B';
              return (
                <div
                  key={v.id}
                  className="card-surface p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isClassC
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                          : isClassB
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        Class {v.class}: {isClassC ? 'Immediately Hazardous' : isClassB ? 'Hazardous' : 'Non-Hazardous'}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Order #{v.orderNumber} • Apt: {v.apartment}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Inspected: {v.inspectionDate}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-mono text-[var(--text-primary)] leading-relaxed">
                      {v.description}
                    </p>
                  </div>

                  <div className="text-right sm:self-center flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      {v.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legal Habitability Defense Tip */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs">
            <Scale className="w-4 h-4 text-[var(--primary-purple)] mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <strong className="text-[var(--text-primary)]">Legal Defense Leverage (NY RPL § 235-b):</strong>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Open Class C and Class B violations recorded by the city provide admissible proof of a breach of the Implied Warranty of Habitability. Tenants can assert this defense in Housing Court to request rent abatements of 10%–50% against rent demands.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

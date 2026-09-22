'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck, Scale, Landmark, Banknote } from 'lucide-react';

interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  statBadge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const slides: Slide[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1200&q=80',
    title: 'Defend Your NYC Home Against Defective Notices',
    subtitle: 'NY RPAPL § 711 strictly requires 14 calendar days written notice. Spot defects instantly.',
    statBadge: '90% of illegal notices have defects',
    icon: ShieldCheck,
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    title: 'Reclaim Your Deposit With 2x Punitive Damages',
    subtitle: 'Under NY GOL § 7-108, landlords who miss the 14-day itemization forfeit 100% of the deposit.',
    statBadge: 'Up to 2x statutory damages',
    icon: Banknote,
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    title: 'Court-Ready Defense Packets in Minutes',
    subtitle: 'Instant formal notices grounded in the 2019 Housing Stability & Tenant Protection Act.',
    statBadge: 'HSTPA 2019 Grounded',
    icon: Scale,
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    title: 'Live NYC HPD Building Code Audit',
    subtitle: 'Cross-reference open building violations and hazardous conditions directly from city data.',
    statBadge: 'Live NYC OpenData',
    icon: Landmark,
  },
];

export function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = slides[currentIndex];
  const Icon = current.icon;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
      {/* Aspect Ratio Container */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full">
        <Image
          src={current.imageUrl}
          alt={current.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover transition-opacity duration-700 ease-in-out"
        />

        {/* Deep Purple Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#130C24] via-[#130C24]/60 to-transparent" />

        {/* Content Box Overlaid at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col items-start text-white">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7C3AED]/80 backdrop-blur-md text-xs font-semibold text-white mb-2.5 border border-[#8B5CF6]/40">
            <Icon className="w-3.5 h-3.5" />
            <span>{current.statBadge}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-1.5 max-w-2xl">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl line-clamp-2">
            {current.subtitle}
          </p>
        </div>

        {/* Subtle Slide Counter (without arrow buttons) */}
        <div className="absolute top-4 right-4 bg-[#130C24]/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
          <span className="text-[11px] font-mono text-purple-200">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-3 right-6 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 transition-all rounded-full ${
                idx === currentIndex ? 'w-6 bg-[var(--primary-purple)]' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

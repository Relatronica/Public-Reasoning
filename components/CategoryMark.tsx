'use client';

import React from 'react';
import { categoryIconForCategory } from '@/lib/communities/category-icon';

interface Props {
  label?: string;
  icon?: string | null;
  hex: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Mark SVG argomento (colore + icona) per feed e anteprime. */
export default function CategoryMark({
  label,
  icon,
  hex,
  size = 'md',
  className = '',
}: Props) {
  const Icon = categoryIconForCategory({ icon, label });
  const box = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]';

  return (
    <span
      className={`inline-flex ${box} flex-shrink-0 items-center justify-center rounded-lg ring-1 ring-black/[0.04] ${className}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${hex} 16%, white)`,
        color: hex,
      }}
      title={label || 'Senza argomento'}
      aria-hidden
    >
      <Icon className={iconClass} strokeWidth={1.75} />
    </span>
  );
}

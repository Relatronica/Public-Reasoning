'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  CATEGORY_COLOR_PALETTE,
  categoryColorHex,
  resolveCategoryColor,
} from '@/lib/communities/category-colors';
import {
  CATEGORY_ICON_CATALOG,
  categoryIconLabel,
  resolveCategoryIconId,
  type CategoryIconId,
} from '@/lib/communities/category-icon';
import CategoryMark from '@/components/CategoryMark';

interface Props {
  label: string;
  color: string;
  icon?: string;
  onChange: (patch: { color?: string; icon?: CategoryIconId }) => void;
}

/** Trigger + popover per icona e colore argomento. */
export default function CategoryAppearancePickers({
  label,
  color,
  icon,
  onChange,
}: Props) {
  const resolvedColor = resolveCategoryColor(color);
  const hex = categoryColorHex(resolvedColor);
  const iconId = resolveCategoryIconId({ icon, label });
  const colorMeta =
    CATEGORY_COLOR_PALETTE.find((c) => c.className === resolvedColor) ??
    CATEGORY_COLOR_PALETTE[CATEGORY_COLOR_PALETTE.length - 1];

  return (
    <div className="flex items-center gap-2">
      <CategoryMark label={label} icon={iconId} hex={hex} size="sm" />
      <IconPicker value={iconId} hex={hex} onChange={(next) => onChange({ icon: next })} />
      <ColorPicker
        value={resolvedColor}
        hex={hex}
        label={colorMeta.label}
        onChange={(next) => onChange({ color: next })}
      />
    </div>
  );
}

function IconPicker({
  value,
  hex,
  onChange,
}: {
  value: CategoryIconId;
  hex: string;
  onChange: (id: CategoryIconId) => void;
}) {
  return (
    <PickerShell
      ariaLabel={`Icona: ${categoryIconLabel(value)}`}
      title="Scegli icona"
      trigger={
        <>
          <span className="text-[11px] text-gray-600 truncate max-w-[5.5rem]">
            {categoryIconLabel(value)}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
        </>
      }
    >
      {(close) => (
        <div className="grid grid-cols-5 gap-1 p-1.5">
          {CATEGORY_ICON_CATALOG.map((entry) => {
            const selected = entry.id === value;
            const Icon = entry.Icon;
            return (
              <button
                key={entry.id}
                type="button"
                title={entry.label}
                aria-label={entry.label}
                aria-pressed={selected}
                onClick={() => {
                  onChange(entry.id);
                  close();
                }}
                className={`relative flex items-center justify-center w-8 h-8 rounded-md transition ${
                  selected
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={selected ? undefined : { color: hex }}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                {selected && (
                  <span className="sr-only">
                    <Check className="w-3 h-3" /> selezionata
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </PickerShell>
  );
}

function ColorPicker({
  value,
  hex,
  label,
  onChange,
}: {
  value: string;
  hex: string;
  label: string;
  onChange: (className: string) => void;
}) {
  return (
    <PickerShell
      ariaLabel={`Colore: ${label}`}
      title="Scegli colore"
      trigger={
        <>
          <span
            className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 flex-shrink-0"
            style={{ backgroundColor: hex }}
            aria-hidden
          />
          <span className="text-[11px] text-gray-600">{label}</span>
          <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
        </>
      }
    >
      {(close) => (
        <div className="grid grid-cols-4 gap-1.5 p-2">
          {CATEGORY_COLOR_PALETTE.map((swatch) => {
            const selected = value === swatch.className;
            return (
              <button
                key={swatch.className}
                type="button"
                title={swatch.label}
                aria-label={swatch.label}
                aria-pressed={selected}
                onClick={() => {
                  onChange(swatch.className);
                  close();
                }}
                style={{ backgroundColor: swatch.hex }}
                className={`w-7 h-7 rounded-full border border-black/10 transition ${
                  selected
                    ? 'ring-2 ring-gray-900 ring-offset-1 scale-105'
                    : 'hover:scale-105'
                }`}
              />
            );
          })}
        </div>
      )}
    </PickerShell>
  );
}

function PickerShell({
  trigger,
  children,
  ariaLabel,
  title,
}: {
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  ariaLabel: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('touchstart', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('touchstart', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 bg-white text-left hover:bg-gray-50"
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          role="dialog"
          aria-label={title}
          className="absolute left-0 z-30 mt-1.5 min-w-[11rem] rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-900/10"
        >
          <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {title}
          </p>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

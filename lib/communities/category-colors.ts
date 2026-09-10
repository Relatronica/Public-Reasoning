/** Palette colori argomenti community (classi Tailwind + hex per anteprima affidabile). */
export const CATEGORY_COLOR_PALETTE = [
  { className: 'bg-blue-500', hex: '#3b82f6', label: 'Blu' },
  { className: 'bg-emerald-500', hex: '#10b981', label: 'Verde' },
  { className: 'bg-amber-500', hex: '#f59e0b', label: 'Ambra' },
  { className: 'bg-teal-500', hex: '#14b8a6', label: 'Teal' },
  { className: 'bg-violet-500', hex: '#8b5cf6', label: 'Viola' },
  { className: 'bg-rose-500', hex: '#f43f5e', label: 'Rosa' },
  { className: 'bg-sky-500', hex: '#0ea5e9', label: 'Sky' },
  { className: 'bg-slate-500', hex: '#64748b', label: 'Slate' },
] as const;

export type CategoryColorClass = (typeof CATEGORY_COLOR_PALETTE)[number]['className'];

const LEGACY_COLOR_MAP: Record<string, CategoryColorClass> = {
  'bg-gray-500': 'bg-slate-500',
  'bg-orange-500': 'bg-amber-500',
};

export function isCategoryColorClass(value: string): value is CategoryColorClass {
  return CATEGORY_COLOR_PALETTE.some((c) => c.className === value);
}

export function resolveCategoryColor(value: string): string {
  if (isCategoryColorClass(value)) return value;
  return LEGACY_COLOR_MAP[value] ?? 'bg-slate-500';
}

export function categoryColorHex(value: string): string {
  const resolved = resolveCategoryColor(value);
  const match = CATEGORY_COLOR_PALETTE.find((c) => c.className === resolved);
  return match?.hex ?? '#64748b';
}

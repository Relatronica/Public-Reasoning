import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Banknote,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  Cpu,
  Database,
  Eye,
  Factory,
  FileText,
  Globe2,
  Leaf,
  Link2,
  Map,
  MessagesSquare,
  Package,
  Route,
  Scale,
  Settings2,
  Shield,
  ShoppingBag,
  Tag,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';

/** Id stabili salvati su `CommunityCategory.icon`. */
export const CATEGORY_ICON_CATALOG = [
  { id: 'tag', label: 'Generico', Icon: Tag },
  { id: 'users', label: 'Persone', Icon: Users },
  { id: 'building', label: 'Edificio', Icon: Building2 },
  { id: 'route', label: 'Mobilità', Icon: Route },
  { id: 'leaf', label: 'Ambiente', Icon: Leaf },
  { id: 'banknote', label: 'Denaro', Icon: Banknote },
  { id: 'file', label: 'Documento', Icon: FileText },
  { id: 'settings', label: 'Operativo', Icon: Settings2 },
  { id: 'alert', label: 'Rischio', Icon: AlertTriangle },
  { id: 'target', label: 'Obiettivo', Icon: Target },
  { id: 'factory', label: 'Impianto', Icon: Factory },
  { id: 'shopping', label: 'Acquisti', Icon: ShoppingBag },
  { id: 'briefcase', label: 'Mandato', Icon: Briefcase },
  { id: 'package', label: 'Offerta', Icon: Package },
  { id: 'link', label: 'Partnership', Icon: Link2 },
  { id: 'compass', label: 'Metodo', Icon: Compass },
  { id: 'globe', label: 'Geografie', Icon: Globe2 },
  { id: 'check', label: 'Verifiche', Icon: CheckCircle2 },
  { id: 'cpu', label: 'Digitale', Icon: Cpu },
  { id: 'messages', label: 'Partecipazione', Icon: MessagesSquare },
  { id: 'eye', label: 'Trasparenza', Icon: Eye },
  { id: 'scale', label: 'Etica', Icon: Scale },
  { id: 'database', label: 'Dati', Icon: Database },
  { id: 'user-check', label: 'Autonomia', Icon: UserCheck },
  { id: 'map', label: 'Mappa', Icon: Map },
  { id: 'shield', label: 'Sicurezza', Icon: Shield },
] as const;

export type CategoryIconId = (typeof CATEGORY_ICON_CATALOG)[number]['id'];

const ICON_BY_ID = Object.fromEntries(
  CATEGORY_ICON_CATALOG.map((entry) => [entry.id, entry.Icon])
) as Record<CategoryIconId, LucideIcon>;

const LABEL_BY_ID = Object.fromEntries(
  CATEGORY_ICON_CATALOG.map((entry) => [entry.id, entry.label])
) as Record<CategoryIconId, string>;

type Rule = { test: RegExp; id: CategoryIconId };

const INFER_RULES: Rule[] = [
  { test: /mobilit|viabilit|trasport|traffico/, id: 'route' },
  { test: /urbanistic|territor|spazio\s*pubblic/, id: 'building' },
  { test: /ambiente|parch|ecolog|clima|green/, id: 'leaf' },
  { test: /bilancio|finanz|budget|capex|invest/, id: 'banknote' },
  { test: /hiring|assunzion|risorse\s*uman|hr\b|people/, id: 'users' },
  { test: /organizzaz/, id: 'settings' },
  { test: /policy|politic|regolament/, id: 'file' },
  { test: /make[\s-]?or[\s-]?buy|fornitor|vendor|modelli/, id: 'shopping' },
  { test: /rischio|risk/, id: 'alert' },
  { test: /sito\b|stabiliment|factory|impianto/, id: 'factory' },
  { test: /scope|perimetro|ambito/, id: 'target' },
  { test: /mandat|brief|committ/, id: 'briefcase' },
  { test: /offerta|propost|commerc/, id: 'package' },
  { test: /partnership|alliance|collabor/, id: 'link' },
  { test: /metod|process/, id: 'compass' },
  { test: /geograf|mercato|region|paes/, id: 'globe' },
  { test: /prodott|client|customer/, id: 'package' },
  { test: /verific|audit|compliance|controll/, id: 'check' },
  { test: /digital|servizi|software|ia\b|ai\b|algoritm/, id: 'cpu' },
  { test: /partecipaz|cittadin|consultaz/, id: 'messages' },
  { test: /trasparenz/, id: 'eye' },
  { test: /bias|equit[aà]|giustiz|etic/, id: 'scale' },
  { test: /consenso|privacy|dati|dato\b|gdpr/, id: 'database' },
  { test: /autonom|hitl|human[\s-]?in/, id: 'user-check' },
  { test: /mappa|map\b|luoghi/, id: 'map' },
  { test: /sicurezz|security|protezion/, id: 'shield' },
  { test: /operativ|generale/, id: 'settings' },
];

export function isCategoryIconId(value: string | null | undefined): value is CategoryIconId {
  return Boolean(value && value in ICON_BY_ID);
}

/** Inferisce un id icona dal nome argomento (fallback). */
export function inferCategoryIconId(label?: string | null): CategoryIconId {
  const key = (label ?? '').trim().toLowerCase();
  if (!key) return 'tag';
  for (const rule of INFER_RULES) {
    if (rule.test.test(key)) return rule.id;
  }
  return 'tag';
}

/** Id effettivo: esplicito se valido, altrimenti inferito dal label. */
export function resolveCategoryIconId(input: {
  icon?: string | null;
  label?: string | null;
}): CategoryIconId {
  if (isCategoryIconId(input.icon ?? undefined)) return input.icon as CategoryIconId;
  return inferCategoryIconId(input.label);
}

export function categoryIconComponent(id: CategoryIconId): LucideIcon {
  return ICON_BY_ID[id] ?? Tag;
}

export function categoryIconLabel(id: CategoryIconId): string {
  return LABEL_BY_ID[id] ?? 'Generico';
}

/** Icona Lucide per categoria (scelta editor o inferenza). */
export function categoryIconForCategory(input: {
  icon?: string | null;
  label?: string | null;
}): LucideIcon {
  return categoryIconComponent(resolveCategoryIconId(input));
}

/** @deprecated Preferire categoryIconForCategory / resolveCategoryIconId. */
export function categoryIconForLabel(label?: string | null): LucideIcon {
  return categoryIconForCategory({ label });
}

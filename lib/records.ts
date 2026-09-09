import { Community, CommunityType, RecordStatus, RecordVisibility, ReasoningRecord } from '@/types';

const ENTERPRISE_TYPES: CommunityType[] = ['ufficio', 'progetto', 'azienda', 'azienda_pubblica'];

const OPEN_STATUSES: RecordStatus[] = ['draft', 'in_session', 'pending_sponsor'];

export function isEnterpriseCommunityType(type: CommunityType): boolean {
  return ENTERPRISE_TYPES.includes(type);
}

export function defaultVisibilityForCommunity(community: Pick<Community, 'type'>): RecordVisibility {
  return isEnterpriseCommunityType(community.type) ? 'private' : 'public';
}

export function resolveVisibility(record: Pick<ReasoningRecord, 'visibility'>): RecordVisibility {
  return record.visibility ?? 'public';
}

export function isClosedStatus(status: RecordStatus): boolean {
  return status === 'closed' || status === 'published';
}

export function displayStatusLabel(status: RecordStatus): string {
  if (status === 'published' || status === 'closed') return 'Chiusa';
  if (status === 'draft') return 'Bozza';
  if (status === 'in_session') return 'In sessione';
  if (status === 'pending_sponsor') return 'In attesa dello sponsor';
  if (status === 'under_review') return 'In verifica';
  return status;
}

export function isOpenStatus(status: RecordStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

/** Visibile nel feed pubblico: non privata, non bozza aperta. */
export function isVisibleOnPublicFeed(record: ReasoningRecord): boolean {
  if (resolveVisibility(record) === 'private') return false;
  if (isOpenStatus(record.status)) return false;
  return true;
}

import { canReplyToConsultationKind } from '@/lib/org/permissions';
import {
  ConsultationRequest,
  OrganizationRole,
  ReasoningRecord,
} from '@/types';

export type ConsultationInboxItem = {
  recordId: string;
  realQuestion: string;
  communityId?: string;
  communityName?: string;
  category?: string;
  request: ConsultationRequest;
};

export function isConsultationOpen(request: ConsultationRequest): boolean {
  return request.status !== 'chiusa';
}

function matchesAssignee(
  request: ConsultationRequest,
  user: { id?: string | null; email?: string | null }
): boolean | null {
  const hasAssignee = Boolean(request.assigneeUserId || request.assigneeEmail);
  if (!hasAssignee) return null;

  const email = user.email?.toLowerCase();
  const id = user.id ?? '';
  if (request.assigneeUserId && (request.assigneeUserId === id || request.assigneeUserId === email)) {
    return true;
  }
  if (request.assigneeEmail && email && request.assigneeEmail.toLowerCase() === email) {
    return true;
  }
  return false;
}

/** Richiesta aperta a cui il ruolo/utente può rispondere (coda per ruolo o assegnata). */
export function isInAdvisorInbox(
  request: ConsultationRequest,
  role: OrganizationRole | null,
  user: { id?: string | null; email?: string | null } = {}
): boolean {
  if (!isConsultationOpen(request)) return false;
  if (!canReplyToConsultationKind(role, request.kind)) return false;

  const assignee = matchesAssignee(request, user);
  if (assignee === null) return true;
  return assignee;
}

export function collectAdvisorInbox(
  records: ReasoningRecord[],
  role: OrganizationRole | null,
  user: { id?: string | null; email?: string | null } = {}
): ConsultationInboxItem[] {
  if (!role) return [];

  const items: ConsultationInboxItem[] = [];
  for (const record of records) {
    const requests = record.consultationRequests ?? [];
    for (const request of requests) {
      if (!isInAdvisorInbox(request, role, user)) continue;
      items.push({
        recordId: record.id,
        realQuestion: record.realQuestion,
        communityId: record.publicAct?.entity?.id,
        communityName: record.publicAct?.entity?.name,
        category: record.category,
        request,
      });
    }
  }

  return items.sort(
    (a, b) =>
      new Date(b.request.createdAt).getTime() - new Date(a.request.createdAt).getTime()
  );
}

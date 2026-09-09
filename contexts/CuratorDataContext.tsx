'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { communities as staticCommunities } from '@/lib/communities';
import { publicActs as staticActs, reasoningRecords as staticRecords } from '@/lib/data';
import { actsForCommunityId, recordsForCommunityId } from '@/lib/curator/filters';
import { CuratorBootstrap } from '@/lib/curator/types';
import { isVisibleOnPublicFeed } from '@/lib/records';
import { Community, Organization, OrganizationRole, PublicAct, ReasoningRecord } from '@/types';
import { canAdminOrg, canAdvise, canClose, canCompile, canRequestConsultation } from '@/lib/org/permissions';
import { defaultOrganization } from '@/lib/org/defaults';

interface CuratorDataContextValue {
  communities: Community[];
  acts: PublicAct[];
  records: ReasoningRecord[];
  organization: Organization;
  myRole: OrganizationRole | null;
  canCompile: boolean;
  canClose: boolean;
  canAdminOrg: boolean;
  canAdvise: boolean;
  canRequestConsultation: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  recordsForCommunity: (communityId: string) => ReasoningRecord[];
  actsForCommunity: (communityId: string) => PublicAct[];
}

const CuratorDataContext = createContext<CuratorDataContextValue | null>(null);

const initialBootstrap: CuratorBootstrap = {
  communities: staticCommunities,
  acts: staticActs,
  records: staticRecords.filter(isVisibleOnPublicFeed),
  organization: defaultOrganization(),
  myRole: null,
};

export function CuratorDataProvider({ children }: { children: React.ReactNode }) {
  const [bootstrap, setBootstrap] = useState<CuratorBootstrap>(initialBootstrap);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/curator/bootstrap');
      if (res.ok) {
        const data = (await res.json()) as CuratorBootstrap;
        setBootstrap(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<CuratorDataContextValue>(
    () => ({
      communities: bootstrap.communities,
      acts: bootstrap.acts,
      records: bootstrap.records,
      organization: bootstrap.organization ?? defaultOrganization(),
      myRole: bootstrap.myRole ?? null,
      canCompile: canCompile(bootstrap.myRole),
      canClose: canClose(bootstrap.myRole),
      canAdminOrg: canAdminOrg(bootstrap.myRole),
      canAdvise: canAdvise(bootstrap.myRole),
      canRequestConsultation: canRequestConsultation(bootstrap.myRole),
      loading,
      refresh,
      recordsForCommunity: (communityId: string) =>
        recordsForCommunityId(bootstrap.records, communityId),
      actsForCommunity: (communityId: string) =>
        actsForCommunityId(bootstrap.acts, communityId),
    }),
    [bootstrap, loading, refresh]
  );

  return (
    <CuratorDataContext.Provider value={value}>{children}</CuratorDataContext.Provider>
  );
}

export function useCuratorData() {
  const ctx = useContext(CuratorDataContext);
  if (!ctx) {
    throw new Error('useCuratorData must be used within CuratorDataProvider');
  }
  return ctx;
}

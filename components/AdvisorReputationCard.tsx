'use client';

import React from 'react';
import { Award } from 'lucide-react';
import AdvisorBadges from '@/components/AdvisorBadges';
import {
  AdvisorReputation,
  reputationSummary,
} from '@/lib/records/advisor-reputation';

interface Props {
  reputation: AdvisorReputation | null;
  title?: string;
  compact?: boolean;
}

export default function AdvisorReputationCard({
  reputation,
  title = 'La tua reputazione',
  compact = false,
}: Props) {
  if (!reputation || reputation.responsesCount === 0) {
    return (
      <div className="reddit-card p-4 bg-gray-50/80 border-dashed">
        <p className="text-xs text-gray-600 leading-relaxed">
          Rispondi alle consultazioni aperte: qui compariranno badge e metriche visibili al team.
        </p>
      </div>
    );
  }

  return (
    <div className={`reddit-card ${compact ? 'p-4' : 'p-5'} space-y-2`}>
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-700" />
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <p className="text-xs text-gray-600">{reputationSummary(reputation)}</p>
      <AdvisorBadges badges={reputation.badges} size={compact ? 'sm' : 'md'} />
    </div>
  );
}

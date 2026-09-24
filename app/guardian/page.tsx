'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Link2 } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import {
  demoScenariosForPack,
  type DemoScenario,
} from '@/lib/guardian/demo-scenarios';
import type { GuardianDecision } from '@/lib/guardian/decide';
import type { LedgerEntry } from '@/lib/guardian/ledger';
import type { PendingEscalation } from '@/lib/guardian/pending';
import {
  escalateAudience,
  isGuardianPack,
  packLabel,
  resolveGuardianPack,
  type GuardianPackId,
} from '@/lib/guardian/pack';
import type { GuardianVerdict } from '@/types';
import { FeedSkeleton } from '@/components/FeedSkeleton';

type NotifyInfo = {
  channels: Array<'slack' | 'teams' | 'local'>;
  errors: Partial<Record<'slack' | 'teams', string>>;
};

type RunResult = {
  scenarioId: string;
  decision: GuardianDecision;
  entry: LedgerEntry;
  pending?: PendingEscalation | null;
  notify?: NotifyInfo | null;
  humanResolved?: boolean;
};

type ChannelStatus = {
  slack: boolean;
  teams: boolean;
  anyRemote: boolean;
};

function verdictMeta(v: GuardianVerdict, escalateLabel: string) {
  if (v === 'allow') {
    return {
      label: 'Sì',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      Icon: ShieldCheck,
    };
  }
  if (v === 'deny') {
    return {
      label: 'No',
      className: 'bg-red-50 text-red-800 border-red-200',
      Icon: ShieldAlert,
    };
  }
  return {
    label: `Chiedi a ${escalateLabel}`,
    className: 'bg-amber-50 text-amber-900 border-amber-200',
    Icon: ShieldQuestion,
  };
}

function GuardianDemoInner() {
  const { community, href } = useActiveCommunity();
  const pack: GuardianPackId = resolveGuardianPack(community.slug);
  const packOk = isGuardianPack(community.slug);
  const scenarios = useMemo(() => demoScenariosForPack(pack), [pack]);
  const audience = escalateAudience(pack);
  const label = packLabel(pack);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [integrityOk, setIntegrityOk] = useState(true);
  const [channels, setChannels] = useState<ChannelStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResults({});
    setActiveId(null);
    setError(null);
  }, [pack]);

  const refreshLedger = useCallback(async () => {
    const res = await fetch('/api/guardian/ledger');
    if (!res.ok) return;
    const data = (await res.json()) as {
      entries: LedgerEntry[];
      integrity: { ok: boolean };
    };
    setLedger(data.entries);
    setIntegrityOk(data.integrity.ok);
  }, []);

  const refreshChannels = useCallback(async () => {
    const res = await fetch('/api/guardian/pending');
    if (!res.ok) return;
    const data = (await res.json()) as { channels: ChannelStatus };
    setChannels(data.channels);
  }, []);

  useEffect(() => {
    void refreshLedger();
    void refreshChannels();
  }, [refreshLedger, refreshChannels]);

  useEffect(() => {
    const tracked = Object.entries(results).filter(
      ([, r]) => r.pending?.status === 'open' && !r.humanResolved
    );
    if (tracked.length === 0) return;

    const tick = async () => {
      const res = await fetch('/api/guardian/pending');
      if (!res.ok) return;
      const data = (await res.json()) as { pending: PendingEscalation[] };
      const byId = new Map(data.pending.map((p) => [p.id, p]));

      setResults((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [scenarioId, run] of Object.entries(prev)) {
          if (!run.pending || run.humanResolved) continue;
          const latest = byId.get(run.pending.id);
          if (latest?.status === 'resolved' && latest.resolvedAs) {
            changed = true;
            next[scenarioId] = {
              ...run,
              humanResolved: true,
              pending: latest,
              decision: {
                ...run.decision,
                verdict: latest.resolvedAs,
                reason:
                  latest.resolveNote ||
                  `Risolto da ${latest.resolvedBy ?? 'remoto'}: ${latest.resolvedAs}`,
              },
            };
          }
        }
        return changed ? next : prev;
      });
      await refreshLedger();
    };

    const id = window.setInterval(() => void tick(), 2500);
    return () => window.clearInterval(id);
  }, [results, refreshLedger]);

  async function runScenario(scenario: DemoScenario) {
    setBusy(true);
    setError(null);
    setActiveId(scenario.id);
    try {
      const res = await fetch('/api/guardian/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: scenario.action,
          pack,
          notify: true,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? `Errore ${res.status}`);
      }
      const data = (await res.json()) as {
        decision: GuardianDecision;
        entry: LedgerEntry;
        pending: PendingEscalation | null;
        notify: NotifyInfo | null;
        ledger: { integrity: { ok: boolean } };
      };
      setResults((prev) => ({
        ...prev,
        [scenario.id]: {
          scenarioId: scenario.id,
          decision: data.decision,
          entry: data.entry,
          pending: data.pending,
          notify: data.notify,
        },
      }));
      setIntegrityOk(data.ledger.integrity.ok);
      await refreshLedger();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore imprevisto');
    } finally {
      setBusy(false);
    }
  }

  async function resolvePending(
    scenario: DemoScenario,
    resolution: 'allow' | 'deny'
  ) {
    const run = results[scenario.id];
    if (!run?.pending?.id) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/guardian/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendingId: run.pending.id,
          resolution,
          resolvedBy: 'demo-ui',
          note: `Risoluzione dalla demo Guardiano (${label})`,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? `Errore ${res.status}`);
      }
      const data = (await res.json()) as {
        decision: GuardianDecision;
        entry: LedgerEntry | null;
        pending: PendingEscalation;
        ledger: { integrity: { ok: boolean } };
      };
      setResults((prev) => ({
        ...prev,
        [scenario.id]: {
          ...run,
          decision: data.decision,
          entry: data.entry ?? run.entry,
          pending: data.pending,
          humanResolved: true,
        },
      }));
      setIntegrityOk(data.ledger.integrity.ok);
      await refreshLedger();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore imprevisto');
    } finally {
      setBusy(false);
    }
  }

  async function runAll() {
    setBusy(true);
    setError(null);
    try {
      await fetch('/api/guardian/ledger', { method: 'DELETE' });
      setResults({});
      for (const scenario of scenarios) {
        setActiveId(scenario.id);
        const res = await fetch('/api/guardian/decide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: scenario.action,
            pack,
            notify: false,
          }),
        });
        if (!res.ok) throw new Error(`Errore su ${scenario.id}`);
        const data = (await res.json()) as {
          decision: GuardianDecision;
          entry: LedgerEntry;
          pending: PendingEscalation | null;
          notify: NotifyInfo | null;
        };
        setResults((prev) => ({
          ...prev,
          [scenario.id]: {
            scenarioId: scenario.id,
            decision: data.decision,
            entry: data.entry,
            pending: data.pending,
            notify: data.notify,
          },
        }));
        await new Promise((r) => setTimeout(r, 280));
      }
      await refreshLedger();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore imprevisto');
    } finally {
      setBusy(false);
      setActiveId(null);
    }
  }

  async function resetDemo() {
    setBusy(true);
    try {
      await fetch('/api/guardian/ledger', { method: 'DELETE' });
      setResults({});
      setActiveId(null);
      await refreshLedger();
    } finally {
      setBusy(false);
    }
  }

  const channelHint = channels
    ? channels.anyRemote
      ? [channels.slack ? 'Slack' : null, channels.teams ? 'Teams' : null]
          .filter(Boolean)
          .join(' + ')
      : 'solo locale (configura Slack/Teams in .env)'
    : '…';

  if (!packOk) {
    return (
      <div className="space-y-4 w-full max-w-3xl">
        <h1 className="text-xl font-semibold text-gray-900">Guardiano</h1>
        <p className="text-sm text-gray-600">
          Il guardiano runtime è disponibile nei pack con limiti machine-readable.
        </p>
        <ul className="text-sm space-y-2">
          <li>
            <Link
              href="/guardian?c=ai-governance"
              className="underline underline-offset-2 text-gray-900"
            >
              Governance IA
            </Link>
          </li>
          <li>
            <Link
              href="/guardian?c=ai-ethics"
              className="underline underline-offset-2 text-gray-900"
            >
              AI Ethics Board
            </Link>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-gray-900">
          <Shield className="w-5 h-5 text-gray-700" />
          <h1 className="text-xl font-semibold">Guardiano — {label}</h1>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Un finto agente prova a fare cose. I limiti vengono dalle schede di{' '}
          {label} (formato machine-readable). Il guardiano risponde sì, no, o
          chiedi a {audience}. Ogni risposta finisce nel registro a catena di
          hash.
        </p>
        <p className="text-xs text-gray-500">
          Pack:{' '}
          <Link
            href={href('/decisioni')}
            className="underline underline-offset-2 hover:text-gray-800"
          >
            {label}
          </Link>
          {' · '}
          Altro pack:{' '}
          <Link
            href={
              pack === 'ai-ethics'
                ? '/guardian?c=ai-governance'
                : '/guardian?c=ai-ethics'
            }
            className="underline underline-offset-2 hover:text-gray-800"
          >
            {pack === 'ai-ethics' ? 'Governance IA' : 'AI Ethics'}
          </Link>
          . Escalate → {channelHint}.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void runAll()}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Esegui tutta la demo
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void resetDemo()}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Reset registro
        </button>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-lg border ${
            integrityOk
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <Link2 className="w-3 h-3" />
          Catena {integrityOk ? 'integra' : 'rotta'} · {ledger.length} voci
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <ol className="space-y-3">
        {scenarios.map((scenario, index) => {
          const result = results[scenario.id];
          const verdict = result?.decision.verdict;
          const meta = verdict ? verdictMeta(verdict, audience) : null;
          const isActive = activeId === scenario.id;
          const mismatch =
            result &&
            !result.humanResolved &&
            result.decision.verdict !== scenario.expected
              ? scenario.expected
              : null;
          const showResolve =
            result?.pending?.status === 'open' &&
            !result.humanResolved &&
            result.decision.verdict === 'escalate';

          return (
            <li
              key={scenario.id}
              className={`rounded-xl border bg-white p-4 transition-shadow ${
                isActive ? 'border-gray-400 shadow-sm' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-400 tabular-nums">
                      {index + 1}
                    </span>
                    <h2 className="text-sm font-medium text-gray-900">{scenario.title}</h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{scenario.narrative}</p>
                  <p className="text-[11px] font-mono text-gray-400 truncate">
                    {scenario.action.action}
                    {scenario.action.resource ? ` → ${scenario.action.resource}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runScenario(scenario)}
                  className="flex-shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Prova
                </button>
              </div>

              {meta && result && (
                <div className="mt-3 space-y-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${meta.className}`}
                  >
                    <meta.Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{result.decision.reason}</p>
                  {result.decision.sourceRecordIds.length > 0 && (
                    <p className="text-[11px] text-gray-500">
                      Scheda:{' '}
                      {result.decision.sourceRecordIds.map((id) => (
                        <Link
                          key={id}
                          href={href(`/records/${id}`)}
                          className="underline underline-offset-2 hover:text-gray-800 mr-2"
                        >
                          {id.replace(/^record-(ethics-|ai-)?/, '')}
                        </Link>
                      ))}
                    </p>
                  )}
                  {result.notify && result.decision.verdict === 'escalate' && (
                    <p className="text-[11px] text-gray-500">
                      Notifica: {result.notify.channels.join(', ')}
                      {result.notify.errors.slack
                        ? ` · Slack: ${result.notify.errors.slack}`
                        : ''}
                      {result.notify.errors.teams
                        ? ` · Teams: ${result.notify.errors.teams}`
                        : ''}
                    </p>
                  )}
                  {mismatch && (
                    <p className="text-[11px] text-amber-700">
                      Atteso in demo: {mismatch} (verdetto diverso — controlla i vincoli).
                    </p>
                  )}
                  {showResolve && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void resolvePending(scenario, 'allow')}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        Approva
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void resolvePending(scenario, 'deny')}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                      >
                        Rifiuta
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] font-mono text-gray-400 truncate">
                    #{result.entry.seq} · {result.entry.hash.slice(0, 16)}…
                    {result.pending ? ` · pending ${result.pending.id.slice(0, 8)}…` : ''}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {ledger.length > 0 && (
        <section className="space-y-2 pt-2 border-t border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Registro (catena)</h2>
          <ul className="space-y-1.5">
            {[...ledger].reverse().map((entry) => {
              const m = verdictMeta(entry.decision.verdict, audience);
              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 text-[11px] text-gray-600 font-mono"
                >
                  <span className="text-gray-400 w-6 tabular-nums">#{entry.seq}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-sans font-medium ${m.className}`}
                  >
                    {m.label}
                  </span>
                  <span className="truncate">{entry.action.action}</span>
                  <span className="text-gray-400 truncate hidden sm:inline">
                    {entry.hash.slice(0, 12)}…
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function GuardianDemoPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <GuardianDemoInner />
    </Suspense>
  );
}

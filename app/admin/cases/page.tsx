'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/hooks/use-admin-store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  caseStatusBadge,
  caseStatusLabel,
  formatDate,
  formatDateTime,
  candidateStatusBadge,
} from '@/lib/badges';
import { STAGE_ORDER } from '@/lib/types';
import {
  CheckCircle2,
  Clock,
  GitBranch,
  Search,
  UserCircle,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CaseStatus } from '@/lib/types';

export default function CasesPage() {
  const { candidates, setCandidateCaseStage } = useAdminStore();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.id || '');

  const filtered = useMemo(() => {
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.id.toLowerCase().includes(query.toLowerCase()) ||
        c.occupation.toLowerCase().includes(query.toLowerCase()),
    );
  }, [candidates, query]);

  const selected = candidates.find((c) => c.id === selectedId);

  function handleAdvance(newStage: CaseStatus) {
    if (!selected) return;
    setCandidateCaseStage(selected.id, newStage);
    toast.success(`Case stage updated to "${caseStatusLabel(newStage)}" for ${selected.name}.`);
  }

  return (
    <>
      <PageHeader
        title="Case Progress Management"
        description="Track and advance candidates through the recruitment journey stages."
      />

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3 lg:p-6">
        {/* Candidate list */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search candidate cases..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 pl-9"
                />
              </div>
            </div>
            <div className="scrollbar-thin max-h-[calc(100vh-16rem)] divide-y divide-slate-50 overflow-y-auto">
              {filtered.map((c) => {
                const caseBadge = caseStatusBadge(c.caseStatus);
                const currentStageIdx = STAGE_ORDER.indexOf(c.caseStatus);
                const progressPct = Math.round(
                  (currentStageIdx / (STAGE_ORDER.length - 1)) * 100,
                );
                const isActive = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`block w-full p-3 text-left transition-colors ${
                      isActive ? 'bg-sky-50 ring-1 ring-inset ring-sky-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${c.avatarColor} text-xs font-semibold text-white`}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.id} · {c.occupation}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-500 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <span className={caseBadge.className}>{caseBadge.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Case detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-center">
              <GitBranch className="h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-900">Select a candidate</p>
              <p className="text-xs text-muted-foreground">Pick a candidate to view their case timeline</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${selected.avatarColor} text-lg font-bold text-white`}>
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selected.id} · {selected.occupation} · {selected.country}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/candidates/${selected.id}`}>
                      View Profile
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {/* Progress bar */}
                <div className="mt-4 grid grid-cols-8 gap-1">
                  {STAGE_ORDER.map((stage, idx) => {
                    const currentIdx = STAGE_ORDER.indexOf(selected.caseStatus);
                    const stageStatus =
                      idx < currentIdx ? 'completed' : idx === currentIdx ? 'current' : 'pending';
                    const stageData = selected.caseStages[idx];
                    return (
                      <div key={stage} className="text-center">
                        <div
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all ${
                            stageStatus === 'completed'
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : stageStatus === 'current'
                                ? 'border-sky-500 bg-white text-sky-600 ring-4 ring-sky-100'
                                : 'border-slate-200 bg-white text-slate-300'
                          }`}
                          title={caseStatusLabel(stage)}
                        >
                          {stageStatus === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <p
                          className={`mt-1 text-[9px] leading-tight ${
                            stageStatus === 'current'
                              ? 'font-semibold text-sky-600'
                              : stageStatus === 'completed'
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                          }`}
                        >
                          {stageData?.label.split(' ')[0]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Recruitment Journey Timeline
                </h3>
                <ol className="relative">
                  {selected.caseStages.map((stage, idx) => {
                    const isLast = idx === selected.caseStages.length - 1;
                    return (
                      <li key={stage.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {!isLast && (
                          <span
                            className={`absolute left-4 top-9 h-full w-0.5 ${
                              stage.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            stage.status === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : stage.status === 'current'
                                ? 'bg-sky-500 text-white ring-4 ring-sky-100'
                                : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {stage.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : stage.status === 'current' ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm font-semibold ${
                                stage.status === 'current'
                                  ? 'text-sky-700'
                                  : stage.status === 'completed'
                                    ? 'text-slate-900'
                                    : 'text-slate-400'
                              }`}
                            >
                              {stage.label}
                            </h4>
                            {stage.status === 'current' && (
                              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                                Current Stage
                              </span>
                            )}
                            {stage.status === 'completed' && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {stage.description}
                          </p>
                          {stage.completedAt && (
                            <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                              <UserCircle className="h-3 w-3" />
                              {formatDateTime(stage.completedAt)}
                            </p>
                          )}
                          {stage.status === 'current' && !stage.completedAt && (
                            <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-sky-600">
                              <Clock className="h-3 w-3" />
                              In progress since {formatDate(selected.registeredAt)}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Update stage */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-1 text-sm font-semibold text-slate-900">
                  Update Case Stage
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Advance or roll back the candidate&apos;s position in the recruitment pipeline.
                </p>
                {(() => {
                  const statusBadge = candidateStatusBadge(selected.status);
                  return (
                    <div className="mb-3 flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-medium text-slate-700">Current candidate status:</span>
                      <span className={statusBadge.className}>{statusBadge.label}</span>
                    </div>
                  );
                })()}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Select new stage
                    </label>
                    <Select onValueChange={(v) => handleAdvance(v as CaseStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder={caseStatusLabel(selected.caseStatus)} />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_ORDER.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {caseStatusLabel(stage)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-700"
                    onClick={() => {
                      const nextIdx = STAGE_ORDER.indexOf(selected.caseStatus) + 1;
                      if (nextIdx < STAGE_ORDER.length) {
                        handleAdvance(STAGE_ORDER[nextIdx]);
                      }
                    }}
                    disabled={selected.caseStatus === 'final_approval'}
                  >
                    Advance to Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

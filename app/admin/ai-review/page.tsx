'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/hooks/use-admin-store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  aiStatusBadge,
  formatDateTime,
  proficiencyBadge,
} from '@/lib/badges';
import { cn } from '@/lib/utils';
import {
  Award,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIReviewPage() {
  const { candidates, setCandidateAIStatus, updateAIExtracted } = useAdminStore();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(
    candidates.find((c) => c.aiStatus === 'completed')?.id || candidates[0]?.id || '',
  );

  const queue = useMemo(() => {
    return candidates
      .filter(
        (c) =>
          c.aiStatus === 'completed' ||
          c.aiStatus === 'processing' ||
          c.aiStatus === 'approved' ||
          c.aiStatus === 'rejected',
      )
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.occupation.toLowerCase().includes(query.toLowerCase()) ||
          c.aiExtracted.anzscoCode.toLowerCase().includes(query.toLowerCase()),
      );
  }, [candidates, query]);

  const selected = candidates.find((c) => c.id === selectedId);

  return (
    <>
      <PageHeader
        title="AI Review Queue"
        description="Verify AI-extracted candidate information before it becomes visible to employers."
        actions={
          <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            {candidates.filter((c) => c.aiStatus === 'completed').length} awaiting review
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3 lg:p-6">
        {/* Queue list */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 pl-9"
                />
              </div>
            </div>
            <div className="scrollbar-thin max-h-[calc(100vh-16rem)] divide-y divide-slate-50 overflow-y-auto">
              {queue.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No candidates in the AI queue.
                </p>
              ) : (
                queue.map((c) => {
                  const badge = aiStatusBadge(c.aiStatus);
                  const isActive = c.id === selectedId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        'flex w-full items-center gap-3 p-3 text-left transition-colors',
                        isActive
                          ? 'bg-violet-50 ring-1 ring-inset ring-violet-200'
                          : 'hover:bg-slate-50',
                      )}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${c.avatarColor} text-sm font-semibold text-white`}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {c.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.occupation}
                          {c.aiExtracted.anzscoCode && ` · ${c.aiExtracted.anzscoCode}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={badge.className}>{badge.label}</span>
                        {c.aiExtracted.confidenceScore > 0 && (
                          <span
                            className={cn(
                              'text-[10px] font-bold',
                              c.aiExtracted.confidenceScore >= 90
                                ? 'text-emerald-600'
                                : c.aiExtracted.confidenceScore >= 75
                                  ? 'text-amber-600'
                                  : 'text-rose-600',
                            )}
                          >
                            {c.aiExtracted.confidenceScore}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-center">
              <Brain className="h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-900">Select a candidate</p>
              <p className="text-xs text-muted-foreground">Pick a candidate from the queue to review</p>
            </div>
          ) : selected.aiStatus === 'processing' || selected.aiExtracted.confidenceScore === 0 ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center">
              <div className="relative">
                <RefreshCw className="h-10 w-10 animate-spin text-violet-500" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-900">
                AI extraction in progress
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                The AI engine is processing {selected.name}&apos;s resume. This usually takes
                20-30 seconds. The queue will refresh automatically.
              </p>
              <p className="mt-3 text-[10px] text-slate-400">
                Started {selected.aiExtracted.processedAt || 'recently'}
              </p>
            </div>
          ) : (
            <AIReviewDetail
              candidate={selected}
              onApproveAI={() => {
                setCandidateAIStatus(selected.id, 'approved');
                toast.success('AI output approved. Redacted version visible to employers.');
              }}
              onRejectAI={() => {
                setCandidateAIStatus(selected.id, 'rejected');
                toast.success('AI output rejected.');
              }}
              onReprocess={() => {
                updateAIExtracted(selected.id, 'summary', selected.aiExtracted.summary);
                toast.success('AI reprocessing requested. Please check back in a moment.');
              }}
              onUpdateField={(field, value) => {
                updateAIExtracted(selected.id, field, value);
                toast.success(`Updated ${field.replace('_', ' ')}.`);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

type CandidateRecord = import('@/lib/types').Candidate;

function AIReviewDetail({
  candidate,
  onApproveAI,
  onRejectAI,
  onReprocess,
  onUpdateField,
}: {
  candidate: CandidateRecord;
  onApproveAI: () => void;
  onRejectAI: () => void;
  onReprocess: () => void;
  onUpdateField: (field: 'summary' | 'redactedSummary' | 'occupation' | 'anzscoCode', value: string) => void;
}) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [showRedacted, setShowRedacted] = useState(false);
  const ai = candidate.aiExtracted;
  const badge = aiStatusBadge(candidate.aiStatus);

  function startEdit(field: string, value: string) {
    setEditingField(field);
    setDraftValue(value);
  }

  function saveEdit(field: 'summary' | 'redactedSummary' | 'occupation' | 'anzscoCode') {
    onUpdateField(field, draftValue);
    setEditingField(null);
    setDraftValue('');
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${candidate.avatarColor} text-lg font-bold text-white`}>
              {candidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{candidate.name}</h2>
                <span className={badge.className}>{badge.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {candidate.id} · Processed {formatDateTime(ai.processedAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={onReprocess}>
              <RefreshCw className="h-4 w-4" />
              Reprocess
            </Button>
            <Link href={`/admin/candidates/${candidate.id}`}>
              <Button variant="outline" size="sm">
                Full Profile
              </Button>
            </Link>
          </div>
        </div>
        {/* Confidence meter */}
        <div className="mt-4 rounded-lg bg-gradient-to-r from-violet-50 via-sky-50 to-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
                <TrendingUp className="h-3.5 w-3.5" />
                AI Confidence Score
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {ai.confidenceScore}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <p
                  className={cn(
                    'text-sm font-bold',
                    ai.confidenceScore >= 90
                      ? 'text-emerald-600'
                      : ai.confidenceScore >= 75
                        ? 'text-amber-600'
                        : 'text-rose-600',
                  )}
                >
                  {ai.confidenceScore >= 90 ? 'Low Risk' : ai.confidenceScore >= 75 ? 'Medium Risk' : 'High Risk'}
                </p>
              </div>
              {ai.confidenceScore < 90 && (
                <ShieldAlert className="h-6 w-6 text-amber-500" />
              )}
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                ai.confidenceScore >= 90
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : ai.confidenceScore >= 75
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-rose-400 to-rose-500',
              )}
              style={{ width: `${ai.confidenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-column: Original Resume + AI Extracted */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Original Resume */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText className="h-4 w-4 text-slate-500" />
              Original Resume
            </h3>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              SOURCE
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white shadow-sm">
                <FileText className="h-4 w-4 text-rose-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-900">
                  {candidate.documents.find((d) => d.type === 'resume')?.name || 'Resume.pdf'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Uploaded {formatDateTime(candidate.registeredAt)}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                View Original
              </Button>
            </div>
            <div className="space-y-1.5 text-xs leading-relaxed text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">{candidate.name}</span>
                <br />
                {candidate.occupation}
                <br />
                {candidate.country}
              </p>
              <div className="border-t border-slate-200 pt-2">
                <p className="mb-1 font-semibold text-slate-700">Professional Summary</p>
                <p className="text-slate-600">
                  {candidate.experienceYears} years of experience in {candidate.occupation.toLowerCase()}.
                  {candidate.skills.slice(0, 3).map((s) => ` Skilled in ${s}.`).join('')}
                </p>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <p className="mb-1 font-semibold text-slate-700">Work History</p>
                {ai.experience.slice(0, 2).map((exp, i) => (
                  <p key={i} className="mb-1">
                    {exp.role} — {exp.company} ({exp.duration})
                  </p>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-2">
                <p className="mb-1 font-semibold text-slate-700">Education</p>
                {ai.education.map((edu, i) => (
                  <p key={i}>
                    {edu.degree}, {edu.field} — {edu.institution}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Extracted */}
        <div className="rounded-xl border border-violet-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Brain className="h-4 w-4 text-violet-500" />
              AI Extracted Information
            </h3>
            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
              AI OUTPUT
            </span>
          </div>

          {/* Occupation Classification */}
          <div className="mb-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                  Occupation Classification
                </p>
                <p className="text-base font-bold text-slate-900">{ai.occupation}</p>
              </div>
              {editingField === 'occupation' ? (
                <Input
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  onBlur={() => saveEdit('occupation')}
                  className="h-8 w-40 text-xs"
                  autoFocus
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => startEdit('occupation', ai.occupation)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between rounded-md bg-white px-3 py-2">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">ANZSCO Code</p>
                {editingField === 'anzscoCode' ? (
                  <Input
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => saveEdit('anzscoCode')}
                    className="h-7 w-32 text-sm"
                    autoFocus
                  />
                ) : (
                  <p className="font-mono text-base font-bold text-violet-700">{ai.anzscoCode}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium text-muted-foreground">Occupation Title</p>
                <p className="text-xs font-medium text-slate-700">{ai.anzscoTitle}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => startEdit('anzscoCode', ai.anzscoCode)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-3">
            <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Award className="h-3.5 w-3.5" />
              Detected Skills ({ai.skills.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {ai.skills.map((skill) => {
                const prof = proficiencyBadge(skill.proficiency);
                return (
                  <span
                    key={skill.name}
                    className={cn('text-[11px]', prof.className)}
                    title={`${skill.years} years experience`}
                  >
                    {skill.name} ({skill.years}y)
                  </span>
                );
              })}
            </div>
          </div>

          {/* Education & experience compact */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-slate-50 p-2">
              <p className="font-semibold text-slate-700">{ai.experience.length} Roles</p>
              <p className="text-[10px] text-muted-foreground">
                {ai.experience[0]?.company} · +{ai.experience.length - 1}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-2">
              <p className="font-semibold text-slate-700">{ai.education.length} Qualifications</p>
              <p className="text-[10px] text-muted-foreground">
                {ai.education[0]?.degree}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI-Generated Candidate Summary
          </h3>
          {editingField === 'summary' ? (
            <div className="flex gap-1">
              <Button size="sm" className="h-7" onClick={() => saveEdit('summary')}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditingField(null)} className="h-7">
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => startEdit('summary', ai.summary)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit AI Output
            </Button>
          )}
        </div>
        {editingField === 'summary' ? (
          <Textarea
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            className="min-h-[120px] text-sm"
            autoFocus
          />
        ) : (
          <p className="text-sm leading-relaxed text-slate-700">{ai.summary}</p>
        )}
      </div>

      {/* Redacted Employer Version */}
      <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/50 to-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            {showRedacted ? <Eye className="h-4 w-4 text-sky-500" /> : <EyeOff className="h-4 w-4 text-sky-500" />}
            Redacted Employer Version
          </h3>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
              EMPLOYER VISIBLE
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowRedacted((s) => !s)}
            >
              {showRedacted ? 'Hide' : 'Preview'}
            </Button>
            {editingField !== 'redactedSummary' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => startEdit('redactedSummary', ai.redactedSummary)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        {editingField === 'redactedSummary' ? (
          <div className="space-y-2">
            <Textarea
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              className="min-h-[100px] text-sm"
              autoFocus
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={() => saveEdit('redactedSummary')}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : showRedacted ? (
          <p className="text-sm leading-relaxed text-slate-700">
            {ai.redactedSummary}
          </p>
        ) : (
          <div className="rounded-md border border-dashed border-sky-200 bg-white/50 p-4">
            <p className="text-xs text-muted-foreground">
              Click <span className="font-medium">Preview</span> to see what employers will see.
              Personal contact details, company names, and identifying information have been redacted.
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-400">
              <p>█████████ ███ — [redacted name]</p>
              <p>████████ ████████ — [redacted employer]</p>
            </div>
          </div>
        )}
      </div>

      {/* Decision buttons */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-slate-700">Decision required:</span>{' '}
          {candidate.aiStatus === 'completed'
            ? 'Review AI output and approve, edit, or reject.'
            : candidate.aiStatus === 'approved'
              ? 'AI output approved. Redacted version is now visible to employers.'
              : 'AI output was rejected.'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {candidate.aiStatus !== 'approved' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={onApproveAI}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve AI Output
            </Button>
          )}
          {candidate.aiStatus !== 'rejected' && (
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={onRejectAI}
            >
              <XCircle className="h-4 w-4" />
              Reject AI Output
            </Button>
          )}
          {candidate.aiStatus === 'approved' && (
            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approved
            </span>
          )}
          {candidate.aiStatus === 'rejected' && (
            <span className="flex items-center gap-1 rounded-md bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">
              <X className="h-3.5 w-3.5" />
              Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

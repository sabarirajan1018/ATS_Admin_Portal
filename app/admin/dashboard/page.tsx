'use client';

import Link from 'next/link';
import {
  Activity as ActivityIcon,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FolderCheck,
  Brain,
  Building2,
  Users,
  XCircle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import {
  StatCard,
  ActivityRow,
  QuickActions,
  quickActionList,
  PendingTaskCard,
} from '@/components/admin/dashboard-parts';
import { candidates, employerRequests, recentActivities } from '@/lib/mock-data';

export default function DashboardPage() {
  const totalCandidates = candidates.length;
  const pendingReviews = candidates.filter((c) => c.status === 'pending').length;
  const docsPending = candidates.reduce(
    (acc, c) => acc + c.documents.filter((d) => d.status === 'pending').length,
    0,
  );
  const aiPending = candidates.filter(
    (c) => c.aiStatus === 'completed' || c.aiStatus === 'processing',
  ).length;
  const approved = candidates.filter((c) => c.status === 'approved').length;
  const rejected = candidates.filter((c) => c.status === 'rejected').length;
  const employerPending = employerRequests.filter((r) => r.status === 'pending').length;
  const activeCases = candidates.filter(
    (c) => c.caseStatus !== 'final_approval',
  ).length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening across your recruitment pipeline today."
      />

      <div className="space-y-6 p-4 lg:p-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Candidates"
            value={totalCandidates}
            delta="+2 this week"
            trend="up"
            icon={Users}
            accent="sky"
            href="/admin/candidates"
          />
          <StatCard
            label="Pending Reviews"
            value={pendingReviews}
            delta="Needs action"
            trend="up"
            icon={ClipboardList}
            accent="amber"
            href="/admin/candidates"
          />
          <StatCard
            label="Documents Pending Approval"
            value={docsPending}
            delta="Awaiting review"
            trend="up"
            icon={FolderCheck}
            accent="amber"
            href="/admin/documents"
          />
          <StatCard
            label="AI Reviews Pending"
            value={aiPending}
            delta="In queue"
            trend="up"
            icon={Brain}
            accent="violet"
            href="/admin/ai-review"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Approved Candidates"
            value={approved}
            delta="+1 this week"
            trend="up"
            icon={CheckCircle2}
            accent="emerald"
            href="/admin/candidates"
          />
          <StatCard
            label="Rejected Candidates"
            value={rejected}
            delta="Low rate"
            trend="down"
            icon={XCircle}
            accent="rose"
            href="/admin/candidates"
          />
          <StatCard
            label="Employer Requests"
            value={employerPending}
            delta={`${employerPending} pending`}
            trend="up"
            icon={Building2}
            accent="amber"
            href="/admin/employer-requests"
          />
          <StatCard
            label="Active Cases"
            value={activeCases}
            delta="In progress"
            trend="neutral"
            icon={ActivityIcon}
            accent="slate"
            href="/admin/cases"
          />
        </div>

        {/* Priority tasks banner */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                Priority Items Requiring Attention
              </h3>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Refreshed just now
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <PendingTaskCard
              label="Documents awaiting approval"
              count={docsPending}
              href="/admin/documents"
              severity="high"
              icon={FolderCheck}
            />
            <PendingTaskCard
              label="AI outputs awaiting review"
              count={aiPending}
              href="/admin/ai-review"
              severity="high"
              icon={Sparkles}
            />
            <PendingTaskCard
              label="Candidates pending review"
              count={pendingReviews}
              href="/admin/candidates"
              severity="medium"
              icon={Users}
            />
            <PendingTaskCard
              label="Employer contact requests"
              count={employerPending}
              href="/admin/employer-requests"
              severity="medium"
              icon={Building2}
            />
          </div>
        </div>

        {/* Recent activities + Quick actions */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent Activities
                </h3>
                <Link
                  href="/admin/audit-logs"
                  className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
                >
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-slate-50 px-5">
                {recentActivities.slice(0, 6).map((a) => (
                  <ActivityRow
                    key={a.id}
                    icon={a.icon}
                    description={a.description}
                    actor={a.actor}
                    timestamp={a.timestamp}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* AI Spotlight */}
          <div className="relative overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-sky-50 p-5">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-200/40 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 shadow-sm">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  AI Engine Spotlight
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-white/70 p-3 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">
                      Overall AI Accuracy
                    </span>
                    <span className="text-lg font-bold text-violet-600">94.2%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-violet-500 to-sky-500" />
                  </div>
                </div>
                <div className="rounded-lg bg-white/70 p-3 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">
                      Avg Confidence Score
                    </span>
                    <span className="text-lg font-bold text-sky-600">88.7%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
                    <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-sky-500 to-emerald-500" />
                  </div>
                </div>
                <Link
                  href="/admin/ai-review"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Review AI Queue ({aiPending})
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
            <span className="text-xs text-muted-foreground">
              Common administrative tasks
            </span>
          </div>
          <QuickActions actions={quickActionList} />
        </div>

        {/* Approval pipeline summary */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Approval Pipeline
            </h3>
            <div className="space-y-3">
              <PipelineBar
                label="New / Pending"
                count={pendingReviews}
                total={totalCandidates}
                color="bg-amber-500"
              />
              <PipelineBar
                label="AI Processing"
                count={candidates.filter((c) => c.aiStatus === 'processing').length}
                total={totalCandidates}
                color="bg-violet-500"
              />
              <PipelineBar
                label="Admin Review"
                count={candidates.filter((c) => c.aiStatus === 'completed').length}
                total={totalCandidates}
                color="bg-sky-500"
              />
              <PipelineBar
                label="Employer Matching"
                count={candidates.filter((c) => c.caseStatus === 'employer_matching').length}
                total={totalCandidates}
                color="bg-indigo-500"
              />
              <PipelineBar
                label="Final Approval"
                count={candidates.filter((c) => c.caseStatus === 'final_approval').length}
                total={totalCandidates}
                color="bg-emerald-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Document Status Breakdown
            </h3>
            <div className="space-y-3">
              <PipelineBar
                label="Approved"
                count={
                  candidates.reduce((acc, c) => acc + c.documents.filter((d) => d.status === 'approved').length, 0)
                }
                total={
                  candidates.reduce((acc, c) => acc + c.documents.length, 0)
                }
                color="bg-emerald-500"
              />
              <PipelineBar
                label="Pending Review"
                count={
                  candidates.reduce((acc, c) => acc + c.documents.filter((d) => d.status === 'pending').length, 0)
                }
                total={
                  candidates.reduce((acc, c) => acc + c.documents.length, 0)
                }
                color="bg-amber-500"
              />
              <PipelineBar
                label="Rejected"
                count={
                  candidates.reduce((acc, c) => acc + c.documents.filter((d) => d.status === 'rejected').length, 0)
                }
                total={
                  candidates.reduce((acc, c) => acc + c.documents.length, 0)
                }
                color="bg-rose-500"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-muted-foreground">
              <ClipboardCheck className="h-4 w-4 text-slate-400" />
              Total documents under management: {candidates.reduce((acc, c) => acc + c.documents.length, 0)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PipelineBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-muted-foreground">
          {count} <span className="text-slate-300">/ {total}</span> ({pct}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

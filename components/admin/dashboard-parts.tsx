'use client';

import Link from 'next/link';
import {
  Activity as ActivityIcon,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  FolderCheck,
  type LucideIcon,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/badges';

interface StatCardProps {
  label: string;
  value: number | string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  accent: 'sky' | 'amber' | 'violet' | 'emerald' | 'rose' | 'slate';
  href?: string;
  description?: string;
}

const accentMap: Record<StatCardProps['accent'], string> = {
  sky: 'bg-sky-50 text-sky-600 ring-sky-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function StatCard({
  label,
  value,
  delta,
  trend = 'neutral',
  icon: Icon,
  accent,
  href,
  description,
}: StatCardProps) {
  const content = (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg ring-1', accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {delta && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              trend === 'up' && 'text-emerald-600',
              trend === 'down' && 'text-rose-600',
              trend === 'neutral' && 'text-slate-500',
            )}
          >
            {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5" />}
            {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors group-hover:text-sky-600">
          View details
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

interface ActivityRowProps {
  icon: 'user' | 'ai' | 'approve' | 'employer';
  description: string;
  actor: string;
  timestamp: string;
}

const activityIconMap = {
  user: { icon: Users, className: 'bg-sky-50 text-sky-600' },
  ai: { icon: Brain, className: 'bg-violet-50 text-violet-600' },
  approve: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600' },
  employer: { icon: Building2, className: 'bg-amber-50 text-amber-600' },
};

export function ActivityRow({ icon, description, actor, timestamp }: ActivityRowProps) {
  const cfg = activityIconMap[icon];
  const Icon = cfg.icon;
  return (
    <div className="flex gap-3 py-3">
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', cfg.className)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700">{description}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {actor} · {timeAgo(timestamp)}
        </p>
      </div>
    </div>
  );
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', action.accent)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {action.label}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-500" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export const quickActionList = [
  {
    label: 'Review Candidates',
    description: 'View candidate profiles awaiting admin review',
    href: '/admin/candidates',
    icon: ClipboardList,
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    label: 'Review AI Output',
    description: 'Verify AI-extracted candidate information',
    href: '/admin/ai-review',
    icon: Sparkles,
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'Manage Requests',
    description: 'Handle employer contact requests',
    href: '/admin/employer-requests',
    icon: Building2,
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Document Approval',
    description: 'Review and approve pending document uploads',
    href: '/admin/documents',
    icon: FolderCheck,
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Case Progress',
    description: 'Update candidate recruitment journey stages',
    href: '/admin/cases',
    icon: ActivityIcon,
    accent: 'bg-indigo-50 text-indigo-600',
  },
  {
    label: 'View Analytics',
    description: 'Inspect platform KPIs and trends',
    href: '/admin/analytics',
    icon: CheckCircle2,
    accent: 'bg-rose-50 text-rose-600',
  },
];

export function PendingTaskCard({
  label,
  count,
  href,
  severity,
  icon: Icon,
}: {
  label: string;
  count: number;
  href: string;
  severity: 'high' | 'medium' | 'low';
  icon: LucideIcon;
}) {
  const severityStyles = {
    high: 'border-rose-200 bg-rose-50 text-rose-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    low: 'border-sky-200 bg-sky-50 text-sky-700',
  };
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between rounded-lg border p-3 transition-colors hover:opacity-80',
        severityStyles[severity],
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-bold">
        {count}
      </span>
    </Link>
  );
}

export { FileWarning, XCircle };

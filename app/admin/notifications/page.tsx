'use client';

import { useState } from 'react';
import { useAdminStore } from '@/hooks/use-admin-store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { timeAgo, formatDateTime } from '@/lib/badges';
import {
  Bell,
  Brain,
  Building2,
  CheckCheck,
  CheckCircle2,
  FileWarning,
  Filter,
  GitBranch,
  Mail,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import type { NotificationType } from '@/lib/types';

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; accent: string; label: string }
> = {
  candidate_registered: {
    icon: UserPlus,
    accent: 'bg-sky-50 text-sky-600',
    label: 'Candidate Registration',
  },
  ai_processing_completed: {
    icon: Brain,
    accent: 'bg-violet-50 text-violet-600',
    label: 'AI Processing',
  },
  employer_request_received: {
    icon: Building2,
    accent: 'bg-amber-50 text-amber-600',
    label: 'Employer Request',
  },
  document_approval_required: {
    icon: FileWarning,
    accent: 'bg-rose-50 text-rose-600',
    label: 'Document Approval',
  },
  candidate_approved: {
    icon: CheckCircle2,
    accent: 'bg-emerald-50 text-emerald-600',
    label: 'Candidate Approval',
  },
  case_stage_updated: {
    icon: GitBranch,
    accent: 'bg-indigo-50 text-indigo-600',
    label: 'Case Update',
  },
};

const filters: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'candidate_registered', label: 'Registrations' },
  { value: 'ai_processing_completed', label: 'AI Processing' },
  { value: 'employer_request_received', label: 'Employer Requests' },
  { value: 'document_approval_required', label: 'Documents' },
];

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAdminStore();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications Center"
        description="Stay on top of platform activity with real-time notifications."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              markAllNotificationsRead();
              toast.success('All notifications marked as read.');
            }}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-4 lg:p-6">
        {/* Filter sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Categories
            </div>
            <div className="space-y-0.5">
              {filters.map((f) => {
                const count =
                  f.value === 'all'
                    ? notifications.length
                    : f.value === 'unread'
                      ? unreadCount
                      : notifications.filter((n) => n.type === f.value).length;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                      filter === f.value
                        ? 'bg-sky-50 font-medium text-sky-700'
                        : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <span>{f.label}</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        filter === f.value ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications list */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <Bell className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications to show.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((n) => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'group rounded-xl border bg-white p-4 transition-all hover:shadow-sm',
                      !n.read ? 'border-sky-200 bg-sky-50/30' : 'border-slate-200',
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', cfg.accent)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                              {!n.read && (
                                <span className="flex h-2 w-2 rounded-full bg-sky-500" />
                              )}
                            </div>
                            <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                              {cfg.label}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {timeAgo(n.timestamp)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                          {n.description}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {formatDateTime(n.timestamp)}
                          </span>
                          {!n.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => markNotificationRead(n.id)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

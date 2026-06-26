'use client';

import { useMemo, useState } from 'react';
import { useAdminStore } from '@/hooks/use-admin-store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateTime, timeAgo } from '@/lib/badges';
import {
  ChevronDown,
  Download,
  FileText,
  Filter,
  Search,
  Shield,
  Terminal,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AuditLog } from '@/lib/types';

const categoryConfig: Record<
  AuditLog['category'],
  { icon: typeof UserIcon; className: string; label: string }
> = {
  candidate: {
    icon: UserIcon,
    className: 'bg-sky-50 text-sky-600',
    label: 'Candidate',
  },
  ai: {
    icon: Terminal,
    className: 'bg-violet-50 text-violet-600',
    label: 'AI',
  },
  document: {
    icon: FileText,
    className: 'bg-emerald-50 text-emerald-600',
    label: 'Document',
  },
  employer: {
    icon: Shield,
    className: 'bg-amber-50 text-amber-600',
    label: 'Employer',
  },
  system: {
    icon: Terminal,
    className: 'bg-slate-100 text-slate-600',
    label: 'System',
  },
};

const categoryFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: 'candidate', label: 'Candidate' },
  { value: 'ai', label: 'AI' },
  { value: 'document', label: 'Document' },
  { value: 'employer', label: 'Employer' },
  { value: 'system', label: 'System' },
];

export default function AuditLogsPage() {
  const { auditLogs } = useAdminStore();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesQuery =
        log.action.toLowerCase().includes(query.toLowerCase()) ||
        log.user.toLowerCase().includes(query.toLowerCase()) ||
        log.target.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [auditLogs, query, categoryFilter]);

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Full system activity history. Every administrative action is recorded."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Audit log exported (demo only).')}
          >
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        }
      />

      <div className="space-y-4 p-4 lg:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {(['candidate', 'ai', 'document', 'employer', 'system'] as const).map((cat) => {
            const count = auditLogs.filter((l) => l.category === cat).length;
            const cfg = categoryConfig[cat];
            const Icon = cfg.icon;
            return (
              <div key={cat} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${cfg.className}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="mt-1.5 text-xl font-bold text-slate-900">{count}</p>
                <p className="text-xs text-muted-foreground">{cfg.label} actions</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by action, user, or target ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Category: <span className="font-semibold">{categoryFilters.find((c) => c.value === categoryFilter)?.label || 'All'}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {categoryFilters.map((c) => (
                <DropdownMenuItem key={c.value} onClick={() => setCategoryFilter(c.value)} className="cursor-pointer">
                  {c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Category</TableHead>
                <TableHead className="font-semibold text-slate-700">Action</TableHead>
                <TableHead className="font-semibold text-slate-700">Target</TableHead>
                <TableHead className="font-semibold text-slate-700">User</TableHead>
                <TableHead className="font-semibold text-slate-700">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                    No audit logs match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => {
                  const cfg = categoryConfig[log.category];
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${cfg.className}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{cfg.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-800">{log.action}</p>
                        <p className="text-[10px] text-slate-400">{log.id}</p>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-600">
                          {log.target}
                        </code>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-700">{log.user}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-700">{formatDateTime(log.timestamp)}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(log.timestamp)}</p>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

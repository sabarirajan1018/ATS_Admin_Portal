'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  employerRequestStatusBadge,
  formatDateTime,
  formatDate,
} from '@/lib/badges';
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  Mail,
  MapPin,
  Search,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { EmployerRequest, EmployerRequestStatus } from '@/lib/types';

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function EmployerRequestsPage() {
  const { employerRequests, candidates, setEmployerRequestStatus } = useAdminStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewRequest, setViewRequest] = useState<EmployerRequest | null>(null);

  const filtered = useMemo(() => {
    return employerRequests.filter((r) => {
      const matchesQuery =
        r.employerName.toLowerCase().includes(query.toLowerCase()) ||
        r.employerCompany.toLowerCase().includes(query.toLowerCase()) ||
        r.candidateName.toLowerCase().includes(query.toLowerCase()) ||
        r.id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [employerRequests, query, statusFilter]);

  const pendingCount = employerRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = employerRequests.filter((r) => r.status === 'approved').length;
  const rejectedCount = employerRequests.filter((r) => r.status === 'rejected').length;

  function handleAction(req: EmployerRequest, action: 'approved' | 'rejected') {
    setEmployerRequestStatus(req.id, action);
    toast.success(
      `${action === 'approved' ? 'Approved' : 'Rejected'} request from ${req.employerCompany}.`,
    );
    setViewRequest(null);
  }

  return (
    <>
      <PageHeader
        title="Employer Request Management"
        description="Manage employer access requests to candidate contact details."
      />

      <div className="space-y-4 p-4 lg:p-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard label="Pending" value={pendingCount} accent="bg-amber-50 text-amber-700" />
          <SummaryCard label="Approved" value={approvedCount} accent="bg-emerald-50 text-emerald-700" />
          <SummaryCard label="Rejected" value={rejectedCount} accent="bg-rose-50 text-rose-700" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by employer, company, candidate..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                Filter: <span className="font-semibold">{statusOptions.find((o) => o.value === statusFilter)?.label || 'All'}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {statusOptions.map((o) => (
                <DropdownMenuItem key={o.value} onClick={() => setStatusFilter(o.value)} className="cursor-pointer">
                  {o.label}
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
                <TableHead className="font-semibold text-slate-700">Employer</TableHead>
                <TableHead className="font-semibold text-slate-700">Candidate</TableHead>
                <TableHead className="font-semibold text-slate-700">Request Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                    No employer requests match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((req) => {
                  const badge = employerRequestStatusBadge(req.status);
                  const candidate = candidates.find((c) => c.id === req.candidateId);
                  return (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{req.employerName}</p>
                          <p className="text-xs text-muted-foreground">{req.employerCompany}</p>
                          <p className="text-[10px] text-slate-400">{req.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate ? (
                          <Link
                            href={`/admin/candidates/${candidate.id}`}
                            className="flex items-center gap-2"
                          >
                            {candidate.avatarColor && (
                              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${candidate.avatarColor} text-xs font-semibold text-white`}>
                                {candidate.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sky-700 hover:text-sky-800">{req.candidateName}</p>
                              <p className="text-xs text-muted-foreground">{candidate.occupation}</p>
                            </div>
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-700">{req.candidateName}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-700">{formatDate(req.requestDate)}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(req.requestDate).split(',')[1]}</p>
                      </TableCell>
                      <TableCell>
                        <span className={badge.className}>{badge.label}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setViewRequest(req)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          {req.status === 'pending' && (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleAction(req, 'approved')}
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-rose-200 text-rose-600 hover:bg-rose-50"
                                onClick={() => handleAction(req, 'rejected')}
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-sky-500" />
                  Employer Contact Request
                </DialogTitle>
                <DialogDescription>
                  Submitted {formatDateTime(viewRequest.requestDate)} ·{' '}
                  {employerRequestStatusBadge(viewRequest.status).label}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Employer */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Employer
                  </p>
                  <div className="space-y-1.5 rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{viewRequest.employerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">{viewRequest.employerCompany}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">{viewRequest.employerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Candidate */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Candidate
                  </p>
                  <div className="space-y-1.5 rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-slate-400" />
                      <Link
                        href={`/admin/candidates/${viewRequest.candidateId}`}
                        className="font-medium text-sky-700 hover:text-sky-800"
                      >
                        {viewRequest.candidateName}
                      </Link>
                      <span className="text-xs text-muted-foreground">{viewRequest.candidateId}</span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Request Message
                  </p>
                  <div className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                    &ldquo;{viewRequest.message}&rdquo;
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Request submitted {formatDateTime(viewRequest.requestDate)}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewRequest(null)}>
                  Close
                </Button>
                {viewRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleAction(viewRequest, 'rejected')}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleAction(viewRequest, 'approved')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Request
                    </Button>
                  </>
                )}
                {viewRequest.status === 'approved' && (
                  <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                    Contact details shared
                  </div>
                )}
                {viewRequest.status === 'rejected' && (
                  <div className="flex items-center gap-1.5 rounded-md bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">
                    <X className="h-3.5 w-3.5" />
                    Request denied
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accent}`}>
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-muted-foreground">Employer requests</p>
    </div>
  );
}

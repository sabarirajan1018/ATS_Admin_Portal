'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/hooks/use-admin-store';
import { PageHeader } from '@/components/admin/page-header';
import { DocumentCard } from '@/components/admin/document-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  FileCheck,
  FileText,
  FileWarning,
  Filter,
  Search,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CandidateDocument } from '@/lib/types';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const typeOptions = [
  { value: 'all', label: 'All types' },
  { value: 'resume', label: 'Resume' },
  { value: 'passport', label: 'Passport' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'experience_letter', label: 'Experience Letter' },
];

interface FlatDoc {
  candidateId: string;
  candidateName: string;
  doc: CandidateDocument;
}

export default function DocumentsPage() {
  const { candidates, setDocumentStatus, setDocumentNotes, requestReupload } = useAdminStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const allDocs = useMemo(() => {
    return candidates.flatMap((c) =>
      c.documents.map((d) => ({
        candidateId: c.id,
        candidateName: c.name,
        doc: d,
      })),
    );
  }, [candidates]);

  const filtered = useMemo(() => {
    return allDocs.filter(({ candidateName, doc }) => {
      const matchesQuery =
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        candidateName.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [allDocs, query, statusFilter, typeFilter]);

  const pendingCount = allDocs.filter((d) => d.doc.status === 'pending').length;
  const approvedCount = allDocs.filter((d) => d.doc.status === 'approved').length;
  const rejectedCount = allDocs.filter((d) => d.doc.status === 'rejected').length;
  const approvalRate = allDocs.length > 0 ? Math.round((approvedCount / allDocs.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Document Review Center"
        description="Review and manage all candidate-uploaded documents in one place."
      />

      <div className="space-y-4 p-4 lg:p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard label="Total Documents" value={allDocs.length} icon={FileText} accent="text-slate-600 bg-slate-100" />
          <SummaryCard label="Pending Review" value={pendingCount} icon={FileWarning} accent="text-amber-600 bg-amber-50" />
          <SummaryCard label="Approved" value={approvedCount} icon={FileCheck} accent="text-emerald-600 bg-emerald-50" />
          <SummaryCard label="Approval Rate" value={`${approvalRate}%`} icon={TrendingUp} accent="text-sky-600 bg-sky-50" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by document name or candidate..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <FilterDropdown label="Status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
            <FilterDropdown label="Type" value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> document{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Document grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-muted-foreground">
            No documents match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(({ candidateId, candidateName, doc }) => (
              <div key={doc.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Link
                    href={`/admin/candidates/${candidateId}`}
                    className="truncate text-xs font-medium text-sky-600 hover:text-sky-700"
                  >
                    {candidateName}
                  </Link>
                  <span className="text-[10px] text-muted-foreground">{candidateId}</span>
                </div>
                <DocumentCard
                  doc={doc}
                  showReviewActions
                  onApprove={(id) => {
                    setDocumentStatus(candidateId, id, 'approved');
                    toast.success(`Document "${doc.name}" approved.`);
                  }}
                  onReject={(id) => {
                    setDocumentStatus(candidateId, id, 'rejected');
                    toast.success(`Document "${doc.name}" rejected.`);
                  }}
                  onReupload={(id, reason) => {
                    requestReupload(candidateId, id, reason);
                    toast.success(`Re-upload requested for "${doc.name}".`);
                  }}
                  onNotesChange={(id, notes) => {
                    setDocumentNotes(candidateId, id, notes);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SummaryCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: typeof FileText; accent: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          {label}: <span className="font-semibold">{options.find((o) => o.value === value)?.label || 'All'}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)} className="cursor-pointer">
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

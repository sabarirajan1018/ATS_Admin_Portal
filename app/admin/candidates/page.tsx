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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  aiStatusBadge,
  caseStatusBadge,
  candidateStatusBadge,
} from '@/lib/badges';
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldOff,
  UserX,
  XCircle,
  Users as UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CandidateStatus } from '@/lib/types';

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

export default function CandidatesPage() {
  const { candidates, setCandidateStatus } = useAdminStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiFilter, setAiFilter] = useState('all');

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.occupation.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase()) ||
        c.id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesAi = aiFilter === 'all' || c.aiStatus === aiFilter;
      return matchesQuery && matchesStatus && matchesAi;
    });
  }, [candidates, query, statusFilter, aiFilter]);

  function handleAction(id: string, name: string, action: string) {
    switch (action) {
      case 'approve':
        setCandidateStatus(id, 'approved');
        toast.success(`Approved candidate ${name}.`);
        break;
      case 'reject':
        setCandidateStatus(id, 'rejected');
        toast.success(`Rejected candidate ${name}.`);
        break;
      case 'suspend':
        setCandidateStatus(id, 'suspended');
        toast.success(`Suspended candidate ${name}.`);
        break;
      default:
        break;
    }
  }

  return (
    <>
      <PageHeader
        title="Candidate Management"
        description="Browse, review, and manage all candidate profiles in the platform."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
              <UsersIcon className="h-4 w-4" />
              Add Candidate
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-4 lg:p-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, occupation, country, or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <FilterDropdown
              label="Status"
              value={statusFilter}
              options={statusFilters}
              onChange={setStatusFilter}
            />
            <FilterDropdown
              label="AI Status"
              value={aiFilter}
              options={[
                { value: 'all', label: 'All AI statuses' },
                { value: 'not_started', label: 'Not Started' },
                { value: 'processing', label: 'Processing' },
                { value: 'completed', label: 'Needs Review' },
                { value: 'approved', label: 'AI Approved' },
                { value: 'rejected', label: 'AI Rejected' },
              ]}
              onChange={setAiFilter}
            />
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of{' '}
            <span className="font-medium text-foreground">{candidates.length}</span> candidates
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Candidate</TableHead>
                <TableHead className="font-semibold text-slate-700">Occupation</TableHead>
                <TableHead className="font-semibold text-slate-700">Country</TableHead>
                <TableHead className="font-semibold text-slate-700">Experience</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">AI Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Case Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                    No candidates match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => {
                  const statusBadge = candidateStatusBadge(c.status);
                  const aiBadge = aiStatusBadge(c.aiStatus);
                  const caseBadge = caseStatusBadge(c.caseStatus);
                  return (
                    <TableRow key={c.id} className="group">
                      <TableCell>
                        <Link
                          href={`/admin/candidates/${c.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${c.avatarColor} text-sm font-semibold text-white`}>
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-sky-600">
                              {c.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{c.id}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-slate-900">{c.occupation}</p>
                        <p className="text-xs text-muted-foreground">{c.skills.slice(0, 2).join(', ')}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{c.country}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {c.experienceYears} yrs
                      </TableCell>
                      <TableCell>
                        <span className={statusBadge.className}>{statusBadge.label}</span>
                      </TableCell>
                      <TableCell>
                        <span className={aiBadge.className}>{aiBadge.label}</span>
                      </TableCell>
                      <TableCell>
                        <span className={caseBadge.className}>{caseBadge.label}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-sky-600"
                          >
                            <Link href={`/admin/candidates/${c.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/candidates/${c.id}`} className="cursor-pointer">
                                  <Eye className="h-4 w-4" />
                                  View Candidate
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toast.info(`Editing ${c.name} opens in the profile view.`)}
                                className="cursor-pointer"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit Candidate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleAction(c.id, c.name, 'approve')}
                                className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                                disabled={c.status === 'approved'}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction(c.id, c.name, 'reject')}
                                className="cursor-pointer text-rose-600 focus:text-rose-700"
                                disabled={c.status === 'rejected'}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction(c.id, c.name, 'suspend')}
                                className="cursor-pointer text-slate-600 focus:text-slate-700"
                                disabled={c.status === 'suspended'}
                              >
                                <ShieldOff className="h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </>
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
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

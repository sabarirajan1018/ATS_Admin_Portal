import type {
  AIStatus,
  CaseStatus,
  CandidateStatus,
  DocumentStatus,
  EmployerRequestStatus,
} from '@/lib/types';

type BadgeVariant = {
  className: string;
  label: string;
};

const base =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium';

export function candidateStatusBadge(status: CandidateStatus): BadgeVariant {
  const map: Record<CandidateStatus, BadgeVariant> = {
    active: {
      className: `${base} border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300`,
      label: 'Active',
    },
    pending: {
      className: `${base} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300`,
      label: 'Pending',
    },
    approved: {
      className: `${base} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300`,
      label: 'Approved',
    },
    rejected: {
      className: `${base} border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300`,
      label: 'Rejected',
    },
    suspended: {
      className: `${base} border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300`,
      label: 'Suspended',
    },
  };
  return map[status];
}

export function aiStatusBadge(status: AIStatus): BadgeVariant {
  const map: Record<AIStatus, BadgeVariant> = {
    not_started: {
      className: `${base} border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400`,
      label: 'Not Started',
    },
    processing: {
      className: `${base} border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300`,
      label: 'Processing',
    },
    completed: {
      className: `${base} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300`,
      label: 'Needs Review',
    },
    approved: {
      className: `${base} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300`,
      label: 'AI Approved',
    },
    rejected: {
      className: `${base} border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300`,
      label: 'AI Rejected',
    },
  };
  return map[status];
}

export function documentStatusBadge(status: DocumentStatus): BadgeVariant {
  const map: Record<DocumentStatus, BadgeVariant> = {
    pending: {
      className: `${base} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300`,
      label: 'Pending',
    },
    approved: {
      className: `${base} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300`,
      label: 'Approved',
    },
    rejected: {
      className: `${base} border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300`,
      label: 'Rejected',
    },
  };
  return map[status];
}

export function caseStatusLabel(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    profile_created: 'Profile Created',
    documents_uploaded: 'Documents Uploaded',
    ai_processing: 'AI Processing',
    admin_review: 'Admin Review',
    employer_matching: 'Employer Matching',
    contact_request: 'Contact Request',
    visa_assessment: 'Visa Assessment',
    final_approval: 'Final Approval',
  };
  return map[status];
}

export function caseStatusBadge(status: CaseStatus): BadgeVariant {
  const map: Record<CaseStatus, BadgeVariant> = {
    profile_created: {
      className: `${base} border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400`,
      label: 'Profile Created',
    },
    documents_uploaded: {
      className: `${base} border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400`,
      label: 'Documents Uploaded',
    },
    ai_processing: {
      className: `${base} border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300`,
      label: 'AI Processing',
    },
    admin_review: {
      className: `${base} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300`,
      label: 'Admin Review',
    },
    employer_matching: {
      className: `${base} border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300`,
      label: 'Employer Matching',
    },
    contact_request: {
      className: `${base} border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-300`,
      label: 'Contact Request',
    },
    visa_assessment: {
      className: `${base} border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300`,
      label: 'Visa Assessment',
    },
    final_approval: {
      className: `${base} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300`,
      label: 'Final Approval',
    },
  };
  return map[status];
}

export function employerRequestStatusBadge(
  status: EmployerRequestStatus,
): BadgeVariant {
  const map: Record<EmployerRequestStatus, BadgeVariant> = {
    pending: {
      className: `${base} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300`,
      label: 'Pending',
    },
    approved: {
      className: `${base} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300`,
      label: 'Approved',
    },
    rejected: {
      className: `${base} border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300`,
      label: 'Rejected',
    },
  };
  return map[status];
}

export function documentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    resume: 'Resume',
    passport: 'Passport',
    certificate: 'Certificate',
    experience_letter: 'Experience Letter',
    id_proof: 'ID Proof',
    qualification: 'Qualification',
  };
  return map[type] || type;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string): string {
  if (!iso) return 'never';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function proficiencyBadge(proficiency: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    beginner: {
      className: `${base} border-slate-300 bg-slate-100 text-slate-600`,
      label: 'Beginner',
    },
    intermediate: {
      className: `${base} border-sky-200 bg-sky-50 text-sky-700`,
      label: 'Intermediate',
    },
    advanced: {
      className: `${base} border-violet-200 bg-violet-50 text-violet-700`,
      label: 'Advanced',
    },
    expert: {
      className: `${base} border-emerald-200 bg-emerald-50 text-emerald-700`,
      label: 'Expert',
    },
  };
  return map[proficiency] || map.intermediate;
}

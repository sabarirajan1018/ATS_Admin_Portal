import {
  LayoutDashboard,
  Users,
  FileSearch,
  FolderCheck,
  Brain,
  GitBranch,
  Building2,
  Bell,
  ScrollText,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badgeKey?: 'pendingReviews' | 'docsPending' | 'aiPending' | 'employerRequests';
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        description: 'Platform overview and quick actions',
      },
    ],
  },
  {
    title: 'Candidates',
    items: [
      {
        label: 'Candidate Management',
        href: '/admin/candidates',
        icon: Users,
        description: 'Browse and manage all candidate profiles',
        badgeKey: 'pendingReviews',
      },
      {
        label: 'AI Review Queue',
        href: '/admin/ai-review',
        icon: Brain,
        description: 'Verify AI-extracted candidate information',
        badgeKey: 'aiPending',
      },
      {
        label: 'Case Progress',
        href: '/admin/cases',
        icon: GitBranch,
        description: 'Track candidate journey through recruitment pipeline',
      },
      {
        label: 'Document Review',
        href: '/admin/documents',
        icon: FolderCheck,
        description: 'Review and approve uploaded documents',
        badgeKey: 'docsPending',
      },
    ],
  },
  {
    title: 'Engagement',
    items: [
      {
        label: 'Employer Requests',
        href: '/admin/employer-requests',
        icon: Building2,
        description: 'Manage employer access to candidates',
        badgeKey: 'employerRequests',
      },
    ],
  },
  {
    title: 'Insights',
    items: [
      {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        description: 'Visual insights and KPIs',
      },
      {
        label: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
        description: 'System and activity notifications',
      },
      {
        label: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: ScrollText,
        description: 'Full system activity history',
      },
    ],
  },
];

export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items);

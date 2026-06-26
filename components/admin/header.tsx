'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allNavItems } from '@/lib/nav-config';
import { useBadgeCounts } from '@/hooks/use-badge-counts';
import { useAuth } from '@/lib/auth-context';
import { notifications } from '@/lib/mock-data';
import { timeAgo } from '@/lib/badges';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
  Search,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const notificationTypeIcon: Record<string, string> = {
  candidate_registered: 'UserPlus',
  ai_processing_completed: 'Brain',
  employer_request_received: 'Building2',
  document_approval_required: 'FileWarning',
  candidate_approved: 'CheckCircle2',
  case_stage_updated: 'GitBranch',
};

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const counts = useBadgeCounts();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const current = allNavItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== '/admin/dashboard' && pathname.startsWith(item.href)),
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  function handleLogout() {
    logout();
    router.replace('/');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb / title */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/dashboard"
          className="hidden text-sm text-muted-foreground hover:text-foreground lg:inline"
        >
          Admin
        </Link>
        <ChevronLeft className="hidden h-4 w-4 rotate-180 text-muted-foreground lg:inline" />
        <div>
          <h2 className="text-sm font-semibold text-slate-900 lg:text-base">
            {current?.label || 'Admin'}
          </h2>
          <p className="hidden text-xs text-muted-foreground lg:block">
            {current?.description}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="ml-auto hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search candidates, documents, employers..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            onFocus={() => router.push('/admin/candidates')}
            readOnly
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-2">
        {/* Quick badges */}
        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {counts.pendingReviews} Pending
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            {counts.aiPending} AI
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotif((s) => !s);
              setShowUser(false);
            }}
            className="relative rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotif(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-80 origin-top-right animate-fade-in rounded-xl border border-slate-200 bg-white shadow-xl lg:w-96">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h3>
                  <Link
                    href="/admin/notifications"
                    onClick={() => setShowNotif(false)}
                    className="text-xs font-medium text-sky-600 hover:text-sky-700"
                  >
                    View all
                  </Link>
                </div>
                <div className="scrollbar-thin max-h-96 divide-y divide-slate-50 overflow-y-auto">
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                        !n.read ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                      )}
                      <div className={n.read ? 'pl-5' : ''}>
                        <p className="text-sm font-medium text-slate-900">
                          {n.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.description}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {timeAgo(n.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/admin/notifications"
                  onClick={() => setShowNotif(false)}
                  className="block border-t border-slate-100 px-4 py-2.5 text-center text-xs font-medium text-sky-600 hover:bg-slate-50"
                >
                  See all {notifications.length} notifications
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => undefined}
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => {
              setShowUser((s) => !s);
              setShowNotif(false);
            }}
            className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </button>

          {showUser && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUser(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-64 origin-top-right animate-fade-in rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">{user?.role}</p>
                </div>
                <div className="p-1">
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings className="h-4 w-4 text-slate-400" />
                    Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export { notificationTypeIcon };

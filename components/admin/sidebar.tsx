'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useBadgeCounts } from '@/hooks/use-badge-counts';
import { navSections } from '@/lib/nav-config';
import { cn } from '@/lib/utils';
import { Brain, ChevronLeft, LogOut, X } from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const counts = useBadgeCounts();

  function handleLogout() {
    logout();
    router.replace('/');
  }

  const countsMap = {
    pendingReviews: counts.pendingReviews,
    docsPending: counts.docsPending,
    aiPending: counts.aiPending,
    employerRequests: counts.employerRequests,
  } as const;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">MigrateFlow</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Admin Portal
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                  const badge = item.badgeKey ? countsMap[item.badgeKey] : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                          isActive
                            ? 'bg-sky-500/10 font-medium text-white shadow-[inset_2px_0_0_0_hsl(199_89%_48%)]'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive
                              ? 'text-sky-400'
                              : 'text-slate-500 group-hover:text-slate-300',
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {badge > 0 && (
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                              isActive
                                ? 'bg-sky-500 text-white'
                                : 'bg-slate-700 text-slate-300',
                            )}
                          >
                            {badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User block */}
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || 'Administrator'}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-400"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
      aria-label="Open sidebar"
    >
      <ChevronLeft className="h-5 w-5 rotate-180" />
    </button>
  );
}

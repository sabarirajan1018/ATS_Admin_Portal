'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/admin/header';
import { RouteGuard } from '@/components/admin/route-guard';

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RouteGuard>
      <div className="min-h-screen bg-slate-50">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}

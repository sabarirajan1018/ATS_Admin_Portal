'use client';

import { useMemo } from 'react';
import { useAdminStore } from '@/hooks/use-admin-store';

export function useBadgeCounts() {
  const { candidates, employerRequests } = useAdminStore();

  return useMemo(() => {
    const pendingReviews = candidates.filter((c) => c.status === 'pending').length;
    const docsPending = candidates.reduce(
      (acc, c) => acc + c.documents.filter((d) => d.status === 'pending').length,
      0,
    );
    const aiPending = candidates.filter(
      (c) => c.aiStatus === 'completed' || c.aiStatus === 'processing',
    ).length;
    const employerPending = employerRequests.filter(
      (r) => r.status === 'pending',
    ).length;
    return { pendingReviews, docsPending, aiPending, employerRequests: employerPending };
  }, [candidates, employerRequests]);
}

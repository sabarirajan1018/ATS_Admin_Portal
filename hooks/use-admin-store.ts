'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  candidates as seedCandidates,
  employerRequests as seedEmployerRequests,
  notifications as seedNotifications,
  auditLogs as seedAuditLogs,
} from '@/lib/mock-data';
import type {
  AuditLog,
  Candidate,
  CandidateStatus,
  EmployerRequest,
  EmployerRequestStatus,
  NotificationItem,
} from '@/lib/types';

const STORAGE_KEY = 'migrateflow_admin_state_v1';

interface StoreState {
  candidates: Candidate[];
  employerRequests: EmployerRequest[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

function seed(): StoreState {
  return {
    candidates: seedCandidates,
    employerRequests: seedEmployerRequests,
    notifications: seedNotifications,
    auditLogs: seedAuditLogs,
  };
}

function load(): StoreState {
  if (typeof window === 'undefined') return seed();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoreState;
      // Merge in case seed data grew; simple check by length.
      if (
        parsed.candidates.length === seedCandidates.length &&
        parsed.employerRequests.length === seedEmployerRequests.length
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return seed();
}

function persist(state: StoreState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

let globalState: StoreState | null = null;
const subscribers = new Set<(state: StoreState) => void>();

function getState(): StoreState {
  if (!globalState) globalState = load();
  return globalState;
}

function setState(updater: (prev: StoreState) => StoreState) {
  const next = updater(getState());
  globalState = next;
  persist(next);
  subscribers.forEach((s) => s(next));
}

function addAuditLog(action: string, target: string, category: AuditLog['category'], user = 'admin.user@migrateflow.io') {
  setState((prev) => ({
    ...prev,
    auditLogs: [
      {
        id: `LOG-${Date.now()}`,
        user,
        action,
        target,
        timestamp: new Date().toISOString(),
        category,
      },
      ...prev.auditLogs,
    ],
  }));
}

export function useAdminStore() {
  const [state, setLocal] = useState<StoreState>(getState);

  useEffect(() => {
    const handler = (s: StoreState) => setLocal(s);
    subscribers.add(handler);
    return () => {
      subscribers.delete(handler);
    };
  }, []);

  const setCandidateStatus = useCallback(
    (id: string, status: CandidateStatus) => {
      const candidate = getState().candidates.find((c) => c.id === id);
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      addAuditLog(`${label} candidate ${candidate?.name || id}`, id, 'candidate');
      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === id ? { ...c, status } : c,
        ),
      }));
    },
    [],
  );

  const setCandidateAIStatus = useCallback(
    (id: string, aiStatus: Candidate['aiStatus']) => {
      const candidate = getState().candidates.find((c) => c.id === id);
      const label = aiStatus.replace('_', ' ');
      addAuditLog(`Set AI status "${label}" for ${candidate?.name || id}`, id, 'ai');
      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === id
            ? {
                ...c,
                aiStatus,
                redactedVisible: aiStatus === 'approved' ? true : c.redactedVisible,
              }
            : c,
        ),
      }));
    },
    [],
  );

  const setCandidateCaseStage = useCallback(
    (id: string, caseStatus: Candidate['caseStatus']) => {
      const candidate = getState().candidates.find((c) => c.id === id);
      const label = caseStatus.replace('_', ' ');
      addAuditLog(
        `Updated case stage to "${label}" for ${candidate?.name || id}`,
        id,
        'candidate',
      );
      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === id
            ? {
                ...c,
                caseStatus,
                caseStages: c.caseStages.map((stage, idx) => {
                  const targetIdx = [
                    'profile_created',
                    'documents_uploaded',
                    'ai_processing',
                    'admin_review',
                    'employer_matching',
                    'contact_request',
                    'visa_assessment',
                    'final_approval',
                  ].indexOf(caseStatus);
                  if (idx < targetIdx) {
                    return {
                      ...stage,
                      status: 'completed' as const,
                      completedAt: stage.completedAt || new Date().toISOString(),
                    };
                  }
                  if (idx === targetIdx) {
                    return {
                      ...stage,
                      status: 'current' as const,
                      completedAt: '',
                    };
                  }
                  return {
                    ...stage,
                    status: 'pending' as const,
                    completedAt: '',
                  };
                }),
              }
            : c,
        ),
      }));
    },
    [],
  );

  const setDocumentStatus = useCallback(
    (candidateId: string, docId: string, status: 'approved' | 'rejected', notes?: string) => {
      const candidate = getState().candidates.find((c) => c.id === candidateId);
      const doc = candidate?.documents.find((d) => d.id === docId);
      addAuditLog(
        `${status === 'approved' ? 'Approved' : 'Rejected'} document "${doc?.name || docId}"`,
        docId,
        'document',
      );
      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                documents: c.documents.map((d) =>
                  d.id === docId
                    ? {
                        ...d,
                        status,
                        adminNotes: notes !== undefined ? notes : d.adminNotes,
                      }
                    : d,
                ),
              }
            : c,
        ),
      }));
    },
    [],
  );

  const setDocumentNotes = useCallback(
    (candidateId: string, docId: string, notes: string) => {
      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                documents: c.documents.map((d) =>
                  d.id === docId ? { ...d, adminNotes: notes } : d,
                ),
              }
            : c,
        ),
      }));
    },
    [],
  );

  const requestReupload = useCallback(
    (candidateId: string, docId: string, reason: string) => {
      const candidate = getState().candidates.find((c) => c.id === candidateId);
      const doc = candidate?.documents.find((d) => d.id === docId);
      addAuditLog(
        `Requested re-upload of "${doc?.name || docId}" (${reason})`,
        docId,
        'document',
      );
      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                documents: c.documents.map((d) =>
                  d.id === docId
                    ? { ...d, status: 'rejected', adminNotes: `Re-upload requested: ${reason}` }
                    : d,
                ),
              }
            : c,
        ),
      }));
    },
    [],
  );

  const setEmployerRequestStatus = useCallback(
    (reqId: string, status: EmployerRequestStatus) => {
      const req = getState().employerRequests.find((r) => r.id === reqId);
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      addAuditLog(
        `${label} employer request from ${req?.employerCompany || reqId}`,
        reqId,
        'employer',
      );
      setState((prev) => ({
        ...prev,
        employerRequests: prev.employerRequests.map((r) =>
          r.id === reqId ? { ...r, status } : r,
        ),
      }));
    },
    [],
  );

  const updateAIExtracted = useCallback(
    (candidateId: string, field: 'summary' | 'redactedSummary' | 'occupation' | 'anzscoCode', value: string) => {
      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === candidateId
            ? { ...c, aiExtracted: { ...c.aiExtracted, [field]: value } }
            : c,
        ),
      }));
    },
    [],
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    addAuditLog('Marked all notifications as read', 'SYSTEM', 'system');
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const resetStore = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    globalState = seed();
    persist(globalState);
    setLocal(globalState);
  }, []);

  return {
    candidates: state.candidates,
    employerRequests: state.employerRequests,
    notifications: state.notifications,
    auditLogs: state.auditLogs,
    setCandidateStatus,
    setCandidateAIStatus,
    setCandidateCaseStage,
    setDocumentStatus,
    setDocumentNotes,
    requestReupload,
    setEmployerRequestStatus,
    updateAIExtracted,
    markNotificationRead,
    markAllNotificationsRead,
    resetStore,
  };
}

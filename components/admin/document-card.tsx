'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  File,
  FileText,
  FileWarning,
  RotateCw,
  StickyNote,
  X,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { documentStatusBadge, documentTypeLabel, formatDate } from '@/lib/badges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { CandidateDocument } from '@/lib/types';

const docIconMap: Record<string, typeof FileText> = {
  resume: FileText,
  passport: File,
  certificate: FileText,
  experience_letter: FileText,
  id_proof: File,
  qualification: FileText,
};

interface DocumentCardProps {
  doc: CandidateDocument;
  showReviewActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReupload?: (id: string, reason: string) => void;
  onNotesChange?: (id: string, notes: string) => void;
}

export function DocumentCard({
  doc,
  showReviewActions = false,
  onApprove,
  onReject,
  onReupload,
  onNotesChange,
}: DocumentCardProps) {
  const DocIcon = docIconMap[doc.type] || File;
  const statusBadge = documentStatusBadge(doc.status);
  const [reuploadOpen, setReuploadOpen] = useState(false);
  const [reuploadReason, setReuploadReason] = useState('');
  const [notesValue, setNotesValue] = useState(doc.adminNotes);

  function handleSaveNotes() {
    onNotesChange?.(doc.id, notesValue);
    toast.success('Admin notes saved.');
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md">
      {/* Preview area */}
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
            <DocIcon className="h-7 w-7 text-slate-500" />
          </div>
          <p className="max-w-[180px] truncate text-xs font-medium text-slate-600">
            {doc.name}
          </p>
        </div>
        <div className="absolute right-3 top-3">
          <span className={statusBadge.className}>{statusBadge.label}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{documentTypeLabel(doc.type)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Uploaded {formatDate(doc.uploadedAt)} · {doc.size}
            </p>
          </div>
        </div>

        {/* Admin notes */}
        {showReviewActions && (
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
              <StickyNote className="h-3 w-3" />
              Admin Notes
            </label>
            <Input
              placeholder="Add notes for internal use..."
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleSaveNotes}
              className="h-9 text-xs"
            />
          </div>
        )}

        {!showReviewActions && doc.adminNotes && (
          <div className="rounded-md bg-slate-50 p-2 text-xs text-muted-foreground">
            <span className="font-medium text-slate-600">Notes:</span> {doc.adminNotes}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            View
          </Button>
          {showReviewActions && (
            <>
              <Button
                variant="outline"
                size="icon"
                className={cn('h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700', doc.status === 'approved' && 'opacity-50')}
                disabled={doc.status === 'approved'}
                onClick={() => onApprove?.(doc.id)}
                title="Approve"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn('h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700', doc.status === 'rejected' && 'opacity-50')}
                disabled={doc.status === 'rejected'}
                onClick={() => onReject?.(doc.id)}
                title="Reject"
              >
                <XCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                onClick={() => setReuploadOpen(true)}
                title="Request re-upload"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {doc.status === 'pending' && (
          <p className="flex items-center gap-1 text-[10px] text-amber-600">
            <Clock className="h-3 w-3" />
            Awaiting admin review
          </p>
        )}
        {doc.status === 'rejected' && (
          <p className="flex items-center gap-1 text-[10px] text-rose-600">
            <FileWarning className="h-3 w-3" />
            Document rejected — re-upload required
          </p>
        )}
      </div>

      {/* Re-upload dialog */}
      <Dialog open={reuploadOpen} onOpenChange={setReuploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Re-upload</DialogTitle>
            <DialogDescription>
              The candidate will be notified that &quot;{doc.name}&quot; needs to be re-uploaded.
              Provide a reason to help them fix the issue.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g., Document is blurry, page 2 is missing..."
            value={reuploadReason}
            onChange={(e) => setReuploadReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReuploadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onReupload?.(doc.id, reuploadReason || 'No reason provided');
                setReuploadOpen(false);
                setReuploadReason('');
              }}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              <RotateCw className="h-4 w-4" />
              Request Re-upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

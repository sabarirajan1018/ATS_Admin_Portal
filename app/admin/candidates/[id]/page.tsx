'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminStore } from '@/hooks/use-admin-store';
import { PageHeader } from '@/components/admin/page-header';
import { DocumentCard } from '@/components/admin/document-card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Award,
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Flag,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react';
import {
  aiStatusBadge,
  caseStatusBadge,
  candidateStatusBadge,
  formatDate,
  formatDateTime,
  proficiencyBadge,
  timeAgo,
} from '@/lib/badges';
import { toast } from 'sonner';

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.id as string;
  const {
    candidates,
    setCandidateStatus,
    setDocumentStatus,
    setDocumentNotes,
    requestReupload,
    setCandidateAIStatus,
  } = useAdminStore();

  const candidate = candidates.find((c) => c.id === candidateId);
  const [activeTab, setActiveTab] = useState('personal');

  if (!candidate) {
    return (
      <>
        <PageHeader title="Candidate Not Found" />
        <div className="p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-muted-foreground">No candidate with ID {candidateId}.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/candidates">Back to Candidates</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const statusBadge = candidateStatusBadge(candidate.status);
  const aiBadge = aiStatusBadge(candidate.aiStatus);
  const caseBadge = caseStatusBadge(candidate.caseStatus);

  // Capture a narrowed reference so nested closures retain the non-undefined type.
  const c = candidate;

  function handleApprove() {
    setCandidateStatus(c.id, 'approved');
    toast.success(`${c.name} approved.`);
  }
  function handleReject() {
    setCandidateStatus(c.id, 'rejected');
    toast.success(`${c.name} rejected.`);
  }
  function handleSuspend() {
    setCandidateStatus(c.id, 'suspended');
    toast.success(`${c.name} suspended.`);
  }

  return (
    <>
      <PageHeader
        title={candidate.name}
        description={`${candidate.id} · Registered ${formatDate(candidate.registeredAt)}`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/candidates">Back</Link>
            </Button>
            {candidate.status !== 'approved' && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleApprove}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            )}
            {candidate.status !== 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={handleReject}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            )}
          </>
        }
      />

      {/* Header banner */}
      <div className="border-b border-slate-200 bg-white px-4 py-5 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${candidate.avatarColor} text-2xl font-bold text-white shadow-lg`}>
              {candidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{candidate.name}</h2>
                <span className={statusBadge.className}>{statusBadge.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {candidate.occupation} · {candidate.country}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={aiBadge.className}>{aiBadge.label}</span>
                <span className={caseBadge.className}>{caseBadge.label}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:gap-6">
            <DetailStat label="Experience" value={`${candidate.experienceYears} yrs`} icon={Briefcase} />
            <DetailStat label="Documents" value={`${candidate.documents.length}`} icon={FileText} />
            <DetailStat
              label="Confidence"
              value={
                candidate.aiExtracted.confidenceScore > 0
                  ? `${candidate.aiExtracted.confidenceScore}%`
                  : '—'
              }
              icon={TrendingUp}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3 lg:p-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal & Professional</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="ai">AI Extracted</TabsTrigger>
            </TabsList>

            {/* Personal & Professional */}
            <TabsContent value="personal" className="space-y-4">
              <InfoCard title="Personal Information" icon={Shield}>
                <InfoRow icon={Mail} label="Email" value={candidate.email} />
                <InfoRow icon={Phone} label="Phone" value={candidate.phone} />
                <InfoRow icon={MapPin} label="Country" value={candidate.country} />
                <InfoRow icon={LinkIcon} label="Candidate ID" value={candidate.id} />
              </InfoCard>

              <InfoCard title="Professional Information" icon={Briefcase}>
                <InfoRow icon={Briefcase} label="Occupation" value={candidate.occupation} />
                <InfoRow icon={TrendingUp} label="Experience" value={`${candidate.experienceYears} years`} />
                <InfoRow icon={GraduationCap} label="Education" value={candidate.education} />
                <div className="pt-2">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5" />
                    Core Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((s) => (
                      <span key={s} className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {candidate.certifications.length > 0 && (
                  <div className="pt-2">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Award className="h-3.5 w-3.5" />
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.certifications.map((c) => (
                        <span key={c} className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents" className="space-y-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Uploaded Documents ({candidate.documents.length})
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {candidate.documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      showReviewActions
                      onApprove={(id) => {
                        setDocumentStatus(candidate.id, id, 'approved');
                        toast.success(`Document "${doc.name}" approved.`);
                      }}
                      onReject={(id) => {
                        setDocumentStatus(candidate.id, id, 'rejected');
                        toast.success(`Document "${doc.name}" rejected.`);
                      }}
                      onReupload={(id, reason) => {
                        requestReupload(candidate.id, id, reason);
                        toast.success(`Re-upload requested for "${doc.name}".`);
                      }}
                      onNotesChange={(id, notes) => {
                        setDocumentNotes(candidate.id, id, notes);
                      }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* AI Extracted */}
            <TabsContent value="ai" className="space-y-4">
              {candidate.aiExtracted.confidenceScore === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm font-medium text-slate-900">AI extraction in progress</p>
                  <p className="text-xs text-muted-foreground">
                    The AI engine is processing this resume. Check back shortly.
                  </p>
                </div>
              ) : (
                <>
                  <InfoCard title="Occupation Classification" icon={Flag}>
                    <div className="rounded-lg bg-violet-50 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs uppercase text-violet-600">Detected Occupation</p>
                          <p className="mt-0.5 text-lg font-semibold text-slate-900">
                            {candidate.aiExtracted.occupation}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-violet-600">ANZSCO Code</p>
                          <p className="mt-0.5 text-lg font-semibold text-slate-900">
                            {candidate.aiExtracted.anzscoCode}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.aiExtracted.anzscoTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </InfoCard>

                  <InfoCard title="AI-Generated Summary" icon={FileText}>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {candidate.aiExtracted.summary}
                    </p>
                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600">Confidence Score</span>
                        <span className="font-bold text-violet-600">
                          {candidate.aiExtracted.confidenceScore}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-500 transition-all"
                          style={{ width: `${candidate.aiExtracted.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </InfoCard>

                  <InfoCard title="Extracted Skills" icon={Wrench}>
                    <div className="space-y-2">
                      {candidate.aiExtracted.skills.map((skill) => {
                        const prof = proficiencyBadge(skill.proficiency);
                        return (
                          <div
                            key={skill.name}
                            className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-900">{skill.name}</span>
                              <span className={prof.className}>{prof.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{skill.years} years</span>
                          </div>
                        );
                      })}
                    </div>
                  </InfoCard>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoCard title="Experience" icon={Briefcase}>
                      <div className="space-y-3">
                        {candidate.aiExtracted.experience.map((exp, i) => (
                          <div key={i} className="border-l-2 border-sky-200 pl-3">
                            <p className="text-sm font-medium text-slate-900">{exp.role}</p>
                            <p className="text-xs text-muted-foreground">{exp.company}</p>
                            <p className="text-xs text-slate-500">
                              {exp.duration} ({exp.startDate} — {exp.endDate})
                            </p>
                          </div>
                        ))}
                      </div>
                    </InfoCard>

                    <InfoCard title="Education & Certifications" icon={GraduationCap}>
                      <div className="space-y-3">
                        {candidate.aiExtracted.education.map((edu, i) => (
                          <div key={`edu-${i}`}>
                            <p className="text-sm font-medium text-slate-900">{edu.degree}, {edu.field}</p>
                            <p className="text-xs text-muted-foreground">{edu.institution}, {edu.year}</p>
                          </div>
                        ))}
                        <div className="border-t border-slate-100 pt-3">
                          {candidate.aiExtracted.certifications.map((cert, i) => (
                            <div key={`cert-${i}`} className="mb-2">
                              <p className="text-sm font-medium text-slate-900">{cert.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {cert.issuer} · Valid until {cert.validUntil}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </InfoCard>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href="/admin/ai-review">Open AI Review Queue</Link>
                    </Button>
                    {candidate.aiStatus !== 'approved' && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          setCandidateAIStatus(candidate.id, 'approved');
                          toast.success('AI output approved. Redacted version now available to employers.');
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve AI Output
                      </Button>
                    )}
                    {candidate.aiStatus !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          setCandidateAIStatus(candidate.id, 'rejected');
                          toast.success('AI output rejected.');
                        }}
                      >
                        <X className="h-4 w-4" />
                        Reject AI Output
                      </Button>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: Case timeline + quick info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Case Progress</h3>
            <ol className="relative space-y-3">
              {candidate.caseStages.map((stage, idx) => {
                const isLast = idx === candidate.caseStages.length - 1;
                return (
                  <li key={stage.id} className="relative flex gap-3 pb-3">
                    {!isLast && (
                      <span
                        className={`absolute left-3 top-6 h-full w-0.5 ${
                          stage.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'
                        }`}
                      />
                    )}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        stage.status === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : stage.status === 'current'
                            ? 'bg-sky-500 text-white ring-4 ring-sky-100'
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {stage.status === 'completed' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className={`text-sm font-medium ${stage.status === 'current' ? 'text-sky-700' : stage.status === 'completed' ? 'text-slate-700' : 'text-slate-400'}`}>
                        {stage.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                      {stage.completedAt && (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {formatDateTime(stage.completedAt)}
                        </p>
                      )}
                      {stage.status === 'current' && (
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-sky-600">
                          <Clock className="h-3 w-3" />
                          In progress · {timeAgo(stage.completedAt)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/admin/cases">Update Case Stage</Link>
            </Button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Admin Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleApprove}
                disabled={candidate.status === 'approved'}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Approve Candidate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleReject}
                disabled={candidate.status === 'rejected'}
              >
                <X className="h-4 w-4 text-rose-600" />
                Reject Candidate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleSuspend}
                disabled={candidate.status === 'suspended'}
              >
                <Shield className="h-4 w-4 text-amber-600" />
                Suspend Candidate
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4" />
                Export Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Briefcase }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: typeof Briefcase; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

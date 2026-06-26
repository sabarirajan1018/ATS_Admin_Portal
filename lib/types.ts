export type CandidateStatus =
  | 'active'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type AIStatus =
  | 'not_started'
  | 'processing'
  | 'completed'
  | 'approved'
  | 'rejected';

export type CaseStatus =
  | 'profile_created'
  | 'documents_uploaded'
  | 'ai_processing'
  | 'admin_review'
  | 'employer_matching'
  | 'contact_request'
  | 'visa_assessment'
  | 'final_approval';

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export type DocumentType =
  | 'resume'
  | 'passport'
  | 'certificate'
  | 'experience_letter'
  | 'id_proof'
  | 'qualification';

export type EmployerRequestStatus = 'pending' | 'approved' | 'rejected';

export type NotificationType =
  | 'candidate_registered'
  | 'ai_processing_completed'
  | 'employer_request_received'
  | 'document_approval_required'
  | 'candidate_approved'
  | 'case_stage_updated';

export interface Skill {
  name: string;
  years: number;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  validUntil: string;
}

export interface CandidateDocument {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadedAt: string;
  size: string;
  adminNotes: string;
  fileUrl: string;
}

export interface AIExtractedInfo {
  skills: Skill[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: Certification[];
  occupation: string;
  anzscoCode: string;
  anzscoTitle: string;
  summary: string;
  confidenceScore: number;
  redactedSummary: string;
  processedAt: string;
  extractedNames: string[];
}

export interface CaseStage {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
  completedAt: string;
  description: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  avatarColor: string;
  occupation: string;
  skills: string[];
  experienceYears: number;
  education: string;
  certifications: string[];
  status: CandidateStatus;
  aiStatus: AIStatus;
  caseStatus: CaseStatus;
  registeredAt: string;
  documents: CandidateDocument[];
  aiExtracted: AIExtractedInfo;
  caseStages: CaseStage[];
  redactedVisible: boolean;
}

export interface EmployerRequest {
  id: string;
  employerName: string;
  employerCompany: string;
  employerEmail: string;
  candidateId: string;
  candidateName: string;
  requestDate: string;
  status: EmployerRequestStatus;
  message: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'candidate' | 'ai' | 'document' | 'employer' | 'system';
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actor: string;
  icon: 'user' | 'ai' | 'approve' | 'employer';
}

export const STAGE_LABELS: Record<CaseStatus, string> = {
  profile_created: 'Profile Created',
  documents_uploaded: 'Documents Uploaded',
  ai_processing: 'AI Processing',
  admin_review: 'Admin Review',
  employer_matching: 'Employer Matching',
  contact_request: 'Contact Request',
  visa_assessment: 'Visa Assessment',
  final_approval: 'Final Approval',
};

export const STAGE_ORDER: CaseStatus[] = [
  'profile_created',
  'documents_uploaded',
  'ai_processing',
  'admin_review',
  'employer_matching',
  'contact_request',
  'visa_assessment',
  'final_approval',
];

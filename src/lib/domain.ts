import { z } from 'zod';
export const matterStatuses = [
  'open',
  'in_progress',
  'in_review',
  'client_action',
  'on_hold',
  'closed',
] as const;
export type MatterStatus = (typeof matterStatuses)[number];
export const priorities = ['low', 'medium', 'high'] as const;
export type Priority = (typeof priorities)[number];
export const taskStatuses = ['todo', 'in_progress', 'blocked', 'completed'] as const;
export type TaskStatus = (typeof taskStatuses)[number];
export type Role = 'client' | 'lawyer' | 'admin' | 'paralegal' | 'manager';
export interface SessionContext {
  organizationId: string;
  userId: string;
}
export interface Organization {
  id: string;
  name: string;
  initials: string;
  timeZone: string;
  currency: string;
}
export interface User {
  id: string;
  organizationId: string;
  name: string;
  initials: string;
  role: Role;
  title: string;
  email: string;
  timeZone: string;
  clientId?: string;
}
export interface Client {
  id: string;
  organizationId: string;
  kind: 'organization' | 'individual';
  name: string;
  initials: string;
  industry: string;
  country: string;
  contact: string;
  email: string;
  since: string;
}
export interface ReferenceItem {
  id: string;
  name: string;
}
export const validationCodes = [
  'titleMin',
  'titleMax',
  'descriptionMin',
  'descriptionMax',
  'dateRequired',
  'dateInvalid',
  'datePast',
  'commentRequired',
  'commentMax',
  'invalid',
] as const;
export type ValidationCode = (typeof validationCodes)[number];
export function validationCode(message: string): ValidationCode {
  return validationCodes.find((code) => code === message) ?? 'invalid';
}
export const matterSchema = z.object({
  title: z.string().trim().min(5, 'titleMin').max(120, 'titleMax'),
  clientId: z.string().min(1, 'invalid'),
  practiceAreaId: z.string().min(1, 'invalid'),
  jurisdictionId: z.string().min(1, 'invalid'),
  leadCounselId: z.string(),
  priority: z.enum(priorities),
  description: z.string().trim().min(20, 'descriptionMin').max(4000, 'descriptionMax'),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateRequired')
    .refine(
      (v) => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
      'dateInvalid',
    )
    .refine((v) => v >= new Date().toISOString().slice(0, 10), 'datePast'),
});
export type MatterInput = z.infer<typeof matterSchema>;
export const messageSchema = z.string().trim().min(1, 'commentRequired').max(2000, 'commentMax');
export interface Matter extends MatterInput {
  id: string;
  reference: string;
  organizationId: string;
  status: MatterStatus;
  teamIds: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Document {
  id: string;
  organizationId: string;
  matterId: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: 'draft' | 'under_review' | 'approved' | 'executed' | 'archived';
  storage: { kind: 'demo' };
}
export interface Task {
  id: string;
  organizationId: string;
  matterId: string;
  title: string;
  assigneeId: string;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
}
export interface Message {
  id: string;
  organizationId: string;
  matterId: string;
  authorId: string;
  text: string;
  createdAt: string;
}
export type Activity = {
  id: string;
  organizationId: string;
  matterId: string;
  actorId: string;
  createdAt: string;
} & (
  | { type: 'matter_created' }
  | { type: 'status_changed'; from: MatterStatus; to: MatterStatus }
  | { type: 'counsel_assigned'; userId: string }
  | { type: 'document_added'; documentId: string }
  | { type: 'message_sent' }
  | { type: 'task_updated'; taskId: string; status: TaskStatus }
);
export interface WorkspaceData {
  organization: Organization;
  currentUser: User;
  users: User[];
  clients: Client[];
  matters: Matter[];
  documents: Document[];
  tasks: Task[];
  messages: Message[];
  activities: Activity[];
  jurisdictions: ReferenceItem[];
  practiceAreas: ReferenceItem[];
}

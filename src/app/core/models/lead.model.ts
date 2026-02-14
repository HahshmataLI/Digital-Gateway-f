export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  FOLLOW_UP = 'follow-up',  // Changed from 'follow_up' to match backend
  CONVERTED = 'converted',
  CLOSED = 'closed'  // Added 'closed' from backend
}

export enum LeadSource {
  WEBSITE = 'website',
  WHATSAPP = 'whatsapp',
  WALK_IN = 'walk-in',
  REFERRAL = 'referral'
}

export interface FollowUp {
  _id?: string;
  note: string;  // Changed from 'notes' to 'note'
  date?: Date;
  nextFollowUpDate?: Date;
  createdBy?: string;
}

export interface Lead {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  courseInterested?: string;  // Changed from 'courseInterest'
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  followUps?: FollowUp[];
  assignedTo?: string;
  createdBy?: string;
  updatedBy?: string;
  lastFollowUpDate?: Date;
  nextFollowUpDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Request interfaces matching backend
export interface CreateLeadRequest {
  name: string;
  email: string;
  phone: string;
  courseInterested?: string;
  source: LeadSource;
  notes?: string;
}

export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string;
  assignedTo?: string;
}

export interface AddFollowUpRequest {
  note: string;  // Changed from 'notes' to 'note'
  nextFollowUpDate?: Date;
}
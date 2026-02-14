export interface Student {
  name: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  occupation?: string;
}

export interface Fees {
  total: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'pending' | 'partial' | 'completed';
}

export interface Document {
  type: 'id_proof' | 'qualification' | 'photo' | 'other';
  url: string;
  uploadedAt: Date;
}

export interface Enrollment {
  _id: string;
  enrollmentNumber: string;
  student: Student;
  lead?: string;
  course: string | any;
  batch?: string | any;
  enrollmentDate: Date;
  enrollmentStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  fees: Fees;
  documents?: Document[];
  enrolledBy: string | any;
  notes?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnrollmentFilter {
  status?: string;
  paymentStatus?: string;
  course?: string;
  batch?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}
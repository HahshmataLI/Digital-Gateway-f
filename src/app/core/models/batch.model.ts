export interface Schedule {
  days: string[];
  startTime: string;
  endTime: string;
  format: 'online' | 'offline' | 'hybrid';
}

export interface Capacity {
  max: number;
  enrolled: number;
  available: number;
}

export interface Material {
  title: string;
  url: string;
  uploadedAt: Date;
}

export interface Batch {
  _id: string;
  batchNumber: string;
  name: string;
  course: string | any;
  trainer: string | any;
  startDate: Date;
  endDate: Date;
  schedule: Schedule;
  capacity: Capacity;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  room?: string;
  meetingLink?: string;
  materials?: Material[];
  enrolledStudents?: string[];
  createdBy: string | any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBatchRequest {
  name: string;
  course: string;
  trainer: string;
  startDate: Date;
  endDate?: Date;
  schedule: Schedule;
  capacity: {
    max: number;
  };
  room?: string;
  meetingLink?: string;
}

export interface BatchFilter {
  course?: string;
  trainer?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}
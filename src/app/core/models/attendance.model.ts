export interface Attendance {
  _id: string;
  batch: string | any;
  enrollment: string | any;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'leave';
  markedBy: string | any;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarkAttendanceRequest {
  enrollment: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  remarks?: string;
}

export interface AttendanceFilter {
  batch?: string;
  enrollment?: string;
  startDate?: Date;
  endDate?: Date;
  date?: Date;
  page?: number;
  limit?: number;
}

export interface AttendanceSummary {
  date: Date;
  batch: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Attendance, MarkAttendanceRequest, AttendanceFilter, AttendanceSummary } from '../models/attendance.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private apiService: ApiService) {}

  // Get attendance records
  getAttendance(filter: AttendanceFilter = {}): Observable<any> {
    const params: any = {
      page: filter.page || 1,
      limit: filter.limit || 50,
      ...filter
    };
    
    if (filter.date) {
      params.date = filter.date.toISOString();
    }
    if (filter.startDate) {
      params.startDate = filter.startDate.toISOString();
    }
    if (filter.endDate) {
      params.endDate = filter.endDate.toISOString();
    }
    
    return this.apiService.get<any>('/attendance', params);
  }

  // Get attendance by batch and date
  getBatchAttendance(batchId: string, date?: Date): Observable<AttendanceSummary> {
    const params: any = {};
    if (date) {
      params.date = date.toISOString();
    }
    return this.apiService.get<ApiResponse<AttendanceSummary>>(`/batches/${batchId}/attendance`, params).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to load attendance');
      })
    );
  }

  // Mark attendance for multiple students
  markAttendance(batchId: string, attendanceData: MarkAttendanceRequest[]): Observable<any> {
    return this.apiService.post<ApiResponse<any>>(`/attendance/batch/${batchId}`, { attendance: attendanceData }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to mark attendance');
      })
    );
  }

  // Update single attendance record
  updateAttendance(attendanceId: string, data: Partial<Attendance>): Observable<Attendance> {
    return this.apiService.put<ApiResponse<Attendance>>(`/attendance/${attendanceId}`, data).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update attendance');
      })
    );
  }

  // Get attendance report
  getAttendanceReport(batchId: string, startDate: Date, endDate: Date): Observable<any> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return this.apiService.get<ApiResponse<any>>(`/attendance/report/${batchId}`, params).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to load attendance report');
      })
    );
  }
}
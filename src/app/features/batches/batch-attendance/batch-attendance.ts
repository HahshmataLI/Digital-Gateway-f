import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Batch } from '../../../core/models/batch.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { Attendance, MarkAttendanceRequest } from '../../../core/models/attendance.model';
import { BatchService } from '../../../core/services/batch.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
interface AttendanceSummary {
  date: Date;
  batch: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
  data?: Array<{
    enrollment: {
      _id: string;
      enrollmentNumber: string;
      student: {
        name: string;
        email: string;
        phone: string;
      };
    };
    attendance: Attendance | null;
  }>;
}

@Component({
  selector: 'app-batch-attendance',
  imports: [CommonModule, FormsModule, SharedModule, TagModule, TableModule],
  templateUrl: './batch-attendance.html',
  styleUrl: './batch-attendance.css',
})
export class BatchAttendance implements OnInit {
  loading = false;
  saving = false;
  batchId: string = '';
  batch: Batch | null = null;
  students: Enrollment[] = [];
  today = new Date();
  selectedDate: Date = new Date();
  
  // Attendance tracking
  attendanceRecords: Map<string, Attendance> = new Map();
  originalAttendance: Map<string, Attendance> = new Map();
  hasChanges = false;
  remarks: string = '';

  bulkStatusOptions = [
    { label: 'Present', value: 'present' },
    { label: 'Late', value: 'late' },
    { label: 'Absent', value: 'absent' },
    { label: 'Leave', value: 'leave' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private batchService: BatchService,
    private enrollmentService: EnrollmentService,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.batchId = params['id'];
        this.loadBatch(this.batchId);
        this.loadEnrolledStudents(this.batchId);
      }
    });
  }

  loadBatch(id: string): void {
    this.batchService.getBatch(id).subscribe({
      next: (batch) => {
        this.batch = batch;
      },
      error: (error) => {
        console.error('Error loading batch:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load batch details'
        });
      }
    });
  }

  loadEnrolledStudents(batchId: string): void {
    this.loading = true;
    this.enrollmentService.getEnrollments({ 
      batch: batchId,
      status: 'confirmed'
    }).subscribe({
      next: (response) => {
        this.students = response.data || [];
        this.loadAttendanceForDate();
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load enrolled students'
        });
        this.loading = false;
      }
    });
  }

  loadAttendanceForDate(): void {
    if (!this.batchId || !this.selectedDate) return;

    this.loading = true;
    this.attendanceService.getBatchAttendance(this.batchId, this.selectedDate).subscribe({
      next: (summary: AttendanceSummary) => {
        // Clear existing records
        this.attendanceRecords.clear();
        this.originalAttendance.clear();
        
        // Populate attendance records from summary data
        if (summary.data && Array.isArray(summary.data)) {
          summary.data.forEach((item: any) => {
            if (item.attendance) {
              this.attendanceRecords.set(item.enrollment._id, item.attendance);
              this.originalAttendance.set(item.enrollment._id, { ...item.attendance });
            }
          });
        }
        
        this.hasChanges = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading attendance:', error);
        // If no attendance found, initialize empty records
        this.attendanceRecords.clear();
        this.originalAttendance.clear();
        this.hasChanges = false;
        this.loading = false;
      }
    });
  }

  onDateChange(): void {
    this.loadAttendanceForDate();
  }

  previousDay(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() - 1);
    this.selectedDate = date;
    this.loadAttendanceForDate();
  }

  nextDay(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() + 1);
    if (date <= this.today) {
      this.selectedDate = date;
      this.loadAttendanceForDate();
    }
  }

  getAttendanceStatus(enrollmentId: string): string {
    const attendance = this.attendanceRecords.get(enrollmentId);
    return attendance ? attendance.status : '';
  }

  setAttendanceStatus(enrollmentId: string, status: string): void {
    const currentStatus = this.getAttendanceStatus(enrollmentId);
    
    if (currentStatus === status) {
      // Toggle off if same status
      this.attendanceRecords.delete(enrollmentId);
    } else {
      // Set new status
      const attendance: Attendance = {
        _id: '',
        enrollment: enrollmentId,
        status: status as 'present' | 'absent' | 'late' | 'leave',
        date: this.selectedDate,
        batch: this.batchId,
        markedBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.attendanceRecords.set(enrollmentId, attendance);
    }
    
    this.checkForChanges();
  }

  setAllStatus(status: string): void {
    this.students.forEach(student => {
      const attendance: Attendance = {
        _id: '',
        enrollment: student._id,
        status: status as 'present' | 'absent' | 'late' | 'leave',
        date: this.selectedDate,
        batch: this.batchId,
        markedBy: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.attendanceRecords.set(student._id, attendance);
    });
    this.checkForChanges();
  }

  getStatusCount(status: string): number {
    let count = 0;
    this.students.forEach(student => {
      if (this.getAttendanceStatus(student._id) === status) {
        count++;
      }
    });
    return count;
  }

  isStatusChanged(student: Enrollment): boolean {
    const current = this.attendanceRecords.get(student._id);
    const original = this.originalAttendance.get(student._id);
    
    if (!current && !original) return false;
    if (!current && original) return true;
    if (current && !original) return true;
    return current?.status !== original?.status;
  }

  checkForChanges(): void {
    let changed = false;
    
    this.students.forEach(student => {
      if (this.isStatusChanged(student)) {
        changed = true;
      }
    });
    
    this.hasChanges = changed;
  }

  saveAttendance(): void {
    const attendanceData: MarkAttendanceRequest[] = [];
    
    this.attendanceRecords.forEach((attendance, enrollmentId) => {
      attendanceData.push({
        enrollment: enrollmentId,
        status: attendance.status,
        remarks: this.remarks || undefined
      });
    });

    this.saving = true;
    this.attendanceService.markAttendance(this.batchId, attendanceData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance marked successfully'
        });
        
        // Update original records
        this.attendanceRecords.forEach((attendance, enrollmentId) => {
          this.originalAttendance.set(enrollmentId, { ...attendance });
        });
        
        this.hasChanges = false;
        this.saving = false;
        this.remarks = '';
      },
      error: (error) => {
        console.error('Error saving attendance:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to save attendance'
        });
        this.saving = false;
      }
    });
  }

  goBack(): void {
    if (this.hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/dashboard/batches', this.batchId]);
      }
    } else {
      this.router.navigate(['/dashboard/batches', this.batchId]);
    }
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warn';
      case 'absent': return 'danger';
      case 'leave': return 'info';
      default: return 'secondary';
    }
  }
}
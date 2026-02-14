import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Batch } from '../../../core/models/batch.model';
import { Course } from '../../../core/models/course.model';
import { User, UserRole } from '../../../core/models/user.model';
import { BatchService } from '../../../core/services/batch.service';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service'; // Changed from UserService
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-batch-form',
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './batch-form.html',
  styleUrl: './batch-form.css',
})
export class BatchForm implements OnInit {
  loading = false;
  submitting = false;
  isEditMode = false;
  batchId: string = '';
  today = new Date();

  // Form
  batchForm: FormGroup;

  // Data
  courses: Course[] = [];
  trainers: User[] = [];

  // Options
  courseOptions: any[] = [];
  trainerOptions: any[] = [];
  loadingCourses = false;
  loadingTrainers = false;

  dayOptions = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' }
  ];

  timeOptions = [
    { label: '8:00 AM', value: '08:00' },
    { label: '9:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '1:00 PM', value: '13:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '3:00 PM', value: '15:00' },
    { label: '4:00 PM', value: '16:00' },
    { label: '5:00 PM', value: '17:00' },
    { label: '6:00 PM', value: '18:00' },
    { label: '7:00 PM', value: '19:00' }
  ];

  formatOptions = [
    { label: 'Offline', value: 'offline' },
    { label: 'Online', value: 'online' },
    { label: 'Hybrid', value: 'hybrid' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private batchService: BatchService,
    private courseService: CourseService,
    private authService: AuthService, // Changed from UserService
    private messageService: MessageService
  ) {
    this.batchForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadTrainers();
    this.checkRouteMode();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      course: ['', Validators.required],
      trainer: ['', Validators.required],
      maxCapacity: [20, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      days: [[], Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      format: ['offline', Validators.required],
      room: [''],
      meetingLink: [''],
      isActive: [true]
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return { dateRange: true };
    }
    return null;
  }

  private checkRouteMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.batchId = params['id'];
        this.loadBatchData(this.batchId);
      }
    });
  }

  private loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getActiveCourses().subscribe({
      next: (response: any) => {
        this.courses = response.data || [];
        this.courseOptions = this.courses.map(course => ({
          label: `${course.code} - ${course.name}`,
          value: course._id
        }));
        this.loadingCourses = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loadingCourses = false;
      }
    });
  }

 private loadTrainers(): void {
    this.loadingTrainers = true;
    this.authService.getUsersByRole(UserRole.TRAINER).subscribe({
      next: (users) => {
        this.trainers = users;
        this.trainerOptions = this.trainers.map(trainer => ({
          label: trainer.name,
          value: trainer._id
        }));
        this.loadingTrainers = false;
      },
      error: (error) => {
        console.error('Error loading trainers:', error);
        this.loadingTrainers = false;
      }
    });
  }
  private loadBatchData(id: string): void {
    this.loading = true;
    this.batchService.getBatch(id).subscribe({
      next: (batch) => {
        this.patchFormWithBatch(batch);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading batch:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load batch details'
        });
        this.router.navigate(['/dashboard/batches']);
      }
    });
  }

  private patchFormWithBatch(batch: Batch): void {
    this.batchForm.patchValue({
      name: batch.name,
      course: typeof batch.course === 'object' ? batch.course._id : batch.course,
      trainer: typeof batch.trainer === 'object' ? batch.trainer._id : batch.trainer,
      maxCapacity: batch.capacity.max,
      startDate: new Date(batch.startDate),
      endDate: new Date(batch.endDate),
      days: batch.schedule?.days || [],
      startTime: batch.schedule?.startTime || '',
      endTime: batch.schedule?.endTime || '',
      format: batch.schedule?.format || 'offline',
      room: batch.room || '',
      meetingLink: batch.meetingLink || '',
      isActive: batch.isActive
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.batchForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  onSubmit(): void {
    if (this.batchForm.invalid) {
      this.markFormGroupTouched(this.batchForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly'
      });
      return;
    }

    this.submitting = true;

    const formValue = this.batchForm.value;
    
    const batchData: any = {
      name: formValue.name,
      course: formValue.course,
      trainer: formValue.trainer,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      schedule: {
        days: formValue.days,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        format: formValue.format
      },
      capacity: {
        max: formValue.maxCapacity
      }
    };

    if (formValue.format === 'offline') {
      batchData.room = formValue.room;
    } else if (formValue.format === 'online') {
      batchData.meetingLink = formValue.meetingLink;
    }

    if (this.isEditMode) {
      batchData.isActive = formValue.isActive;
    }

    const request = this.isEditMode
      ? this.batchService.updateBatch(this.batchId, batchData)
      : this.batchService.createBatch(batchData);

    request.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode 
            ? 'Batch updated successfully' 
            : 'Batch created successfully'
        });

        setTimeout(() => {
          this.router.navigate(['/dashboard/batches', response._id]);
        }, 500);
      },
      error: (error) => {
        console.error('Error saving batch:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to save batch'
        });
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/dashboard/batches', this.batchId]);
    } else {
      this.router.navigate(['/dashboard/batches']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { Course } from '../../../core/models/course.model';
import { Batch } from '../../../core/models/batch.model';
import { Lead } from '../../../core/models/lead.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { CourseService } from '../../../core/services/course.service';
import { BatchService } from '../../../core/services/batch.service';
import { LeadsService } from '../../../core/services/leads.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-enrollment-form',
  imports: [CommonModule, ReactiveFormsModule, SharedModule, TagModule],
  templateUrl: './enrollment-form.html',
  styleUrl: './enrollment-form.css',
})
export class EnrollmentForm  implements OnInit {
  loading = false;
  submitting = false;
  isEditMode = false;
  isFromLead = false;
  enrollmentId: string = '';
  leadId: string = '';

  // Data
  courses: Course[] = [];
  batches: Batch[] = [];
  leadData: Lead | null = null;
  selectedCourse: Course | null = null;
  selectedBatch: Batch | null = null;

  // Loading states for selects
  loadingCourses = false;
  loadingBatches = false;

  // Options
  qualificationOptions = [
    { label: 'Matriculation', value: 'matric' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Bachelor', value: 'bachelor' },
    { label: 'Master', value: 'master' },
    { label: 'PhD', value: 'phd' },
    { label: 'Diploma', value: 'diploma' },
    { label: 'Other', value: 'other' }
  ];

  courseOptions: any[] = [];
  batchOptions: any[] = [];

  // Form
  enrollmentForm: FormGroup;
  dueAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private batchService: BatchService,
    private leadService: LeadsService,
    private enrollmentService: EnrollmentService,
    private messageService: MessageService
  ) {
    this.enrollmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkRouteMode();
    this.loadCourses();
    
    // Watch for course selection changes
    this.enrollmentForm.get('course')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(courseId => {
          if (courseId) {
            this.selectedCourse = this.courses.find(c => c._id === courseId) || null;
            this.updateCourseFee();
            this.loadingBatches = true;
            return this.batchService.getBatchesByCourse(courseId);
          }
          this.selectedCourse = null;
          this.batches = [];
          this.batchOptions = [];
          this.loadingBatches = false;
          return [];
        })
      )
      .subscribe({
        next: (batches: Batch[]) => {
          this.batches = batches || [];
          this.updateBatchOptions();
          this.loadingBatches = false;
        },
        error: (error) => {
          console.error('Error loading batches:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load available batches'
          });
          this.loadingBatches = false;
        }
      });

    // Watch for discount and paid amount changes to calculate final/due amounts
    this.enrollmentForm.get('discount')?.valueChanges.subscribe(() => {
      this.calculateFinalAmount();
    });

    this.enrollmentForm.get('paidAmount')?.valueChanges.subscribe(() => {
      this.calculateDueAmount();
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Student Information
      studentName: ['', Validators.required],
      studentEmail: ['', [Validators.required, Validators.email]],
      studentPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,12}$/)]],
      studentQualification: ['', Validators.required],
      studentOccupation: [''],
      studentAddress: ['', Validators.required],

      // Course & Batch
      course: ['', Validators.required],
      batch: [''],

      // Fee Details
      courseFee: [{ value: 0, disabled: true }],
      discount: [0, [Validators.min(0)]],
      finalAmount: [{ value: 0, disabled: true }],
      paidAmount: [0, [Validators.min(0)]],
      
      // Additional
      notes: [''],
      isActive: [true]
    });
  }

  private checkRouteMode(): void {
    this.route.params.subscribe(params => {
      // Check if from lead
      if (params['leadId']) {
        this.isFromLead = true;
        this.leadId = params['leadId'];
        this.loadLeadData(this.leadId);
      }
      
      // Check if edit mode
      if (params['id']) {
        this.isEditMode = true;
        this.enrollmentId = params['id'];
        this.loadEnrollmentData(this.enrollmentId);
      }
    });
  }

  private loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getActiveCourses().subscribe({
      next: (response: any) => {
        this.courses = response.data || [];
        this.courseOptions = this.courses.map(course => ({
          label: `${course.code} - ${course.name} (Rs ${course.fees})`,
          value: course._id,
          fees: course.fees
        }));
        this.loadingCourses = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load courses'
        });
        this.loadingCourses = false;
      }
    });
  }

  private loadLeadData(leadId: string): void {
    this.loading = true;
    this.leadService.getLead(leadId).subscribe({
      next: (lead: Lead) => {
        this.leadData = lead;
        
        // Pre-fill form with lead data
        this.enrollmentForm.patchValue({
          studentName: lead.name,
          studentEmail: lead.email,
          studentPhone: lead.phone,
          notes: `Converted from lead. Original source: ${lead.source}`
        });

        // Pre-select course if lead had interest
        if (lead.courseInterested) {
          this.enrollmentForm.patchValue({
            course: lead.courseInterested
          });
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading lead:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load lead information'
        });
        this.router.navigate(['/dashboard/enrollments']);
      }
    });
  }

  private loadEnrollmentData(enrollmentId: string): void {
    this.loading = true;
    this.enrollmentService.getEnrollment(enrollmentId).subscribe({
      next: (enrollment: Enrollment) => {
        // Patch form with enrollment data
        this.enrollmentForm.patchValue({
          // Student Information
          studentName: enrollment.student.name,
          studentEmail: enrollment.student.email,
          studentPhone: enrollment.student.phone,
          studentQualification: enrollment.student.qualification,
          studentOccupation: enrollment.student.occupation,
          studentAddress: enrollment.student.address,

          // Course & Batch
          course: typeof enrollment.course === 'object' ? enrollment.course._id : enrollment.course,
          batch: typeof enrollment.batch === 'object' ? enrollment.batch?._id : enrollment.batch,

          // Fee Details
          discount: enrollment.fees.discount,
          paidAmount: enrollment.fees.paidAmount,
          
          // Additional
          notes: enrollment.notes,
          isActive: enrollment.isActive
        });

        // Set selected course and batch
        this.selectedCourse = typeof enrollment.course === 'object' ? enrollment.course : null;
        this.selectedBatch = typeof enrollment.batch === 'object' ? enrollment.batch : null;
        
        // Update course fee display
        if (this.selectedCourse) {
          this.enrollmentForm.patchValue({
            courseFee: this.selectedCourse.fees
          });
          this.calculateFinalAmount();
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading enrollment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load enrollment data'
        });
        this.router.navigate(['/dashboard/enrollments']);
      }
    });
  }

  private updateBatchOptions(): void {
    this.batchOptions = this.batches
      .filter(batch => batch.status === 'upcoming' || batch.status === 'ongoing')
      .map(batch => ({
        label: `${batch.name} - ${batch.schedule?.days?.join(', ')} ${batch.schedule?.startTime || ''} (${batch.capacity?.available || 0} seats)`,
        value: batch._id,
        capacity: batch.capacity,
        schedule: batch.schedule,
        startDate: batch.startDate
      }));
  }

  onCourseChange(): void {
    const courseId = this.enrollmentForm.get('course')?.value;
    this.selectedCourse = this.courses.find(c => c._id === courseId) || null;
    this.updateCourseFee();
    
    // Reset batch selection when course changes
    this.enrollmentForm.patchValue({ batch: '' });
    this.selectedBatch = null;
  }

  onBatchChange(): void {
    const batchId = this.enrollmentForm.get('batch')?.value;
    this.selectedBatch = this.batches.find(b => b._id === batchId) || null;
  }

  private updateCourseFee(): void {
    if (this.selectedCourse) {
      const courseFee = this.selectedCourse.fees;
      this.enrollmentForm.patchValue({
        courseFee: courseFee
      });
      
      // Reset discount if it exceeds new course fee
      const currentDiscount = this.enrollmentForm.get('discount')?.value || 0;
      if (currentDiscount > courseFee) {
        this.enrollmentForm.patchValue({ discount: 0 });
      }
      
      this.calculateFinalAmount();
    }
  }

  private calculateFinalAmount(): void {
    const courseFee = this.selectedCourse?.fees || 0;
    const discount = this.enrollmentForm.get('discount')?.value || 0;
    const finalAmount = Math.max(0, courseFee - discount);
    
    this.enrollmentForm.patchValue({
      finalAmount: finalAmount
    }, { emitEvent: false });
    
    // Validate paid amount doesn't exceed final amount
    const paidAmount = this.enrollmentForm.get('paidAmount')?.value || 0;
    if (paidAmount > finalAmount) {
      this.enrollmentForm.patchValue({ paidAmount: finalAmount });
    }
    
    this.calculateDueAmount();
  }

  private calculateDueAmount(): void {
    const finalAmount = this.enrollmentForm.get('finalAmount')?.value || 0;
    const paidAmount = this.enrollmentForm.get('paidAmount')?.value || 0;
    this.dueAmount = Math.max(0, finalAmount - paidAmount);
  }

  get finalAmount(): number {
    return this.enrollmentForm.get('finalAmount')?.value || 0;
  }

  getPaymentStatus(): string {
    const finalAmount = this.finalAmount;
    const paidAmount = this.enrollmentForm.get('paidAmount')?.value || 0;
    
    if (paidAmount === 0) return 'pending';
    if (paidAmount >= finalAmount) return 'completed';
    return 'partial';
  }

  getPaymentStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed': return 'success';
      case 'partial': return 'warn';
      case 'pending': return 'info';
      default: return 'secondary';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.enrollmentForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  onSubmit(): void {
    if (this.enrollmentForm.invalid) {
      this.markFormGroupTouched(this.enrollmentForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly'
      });
      return;
    }

    this.submitting = true;

    const formValue = this.enrollmentForm.getRawValue();
    
    const enrollmentData: any = {
      student: {
        name: formValue.studentName,
        email: formValue.studentEmail,
        phone: formValue.studentPhone,
        address: formValue.studentAddress,
        qualification: formValue.studentQualification,
        occupation: formValue.studentOccupation || ''
      },
      course: formValue.course,
      batch: formValue.batch || null,
      fees: {
        total: this.selectedCourse?.fees || 0,
        discount: formValue.discount || 0,
        finalAmount: this.finalAmount,
        paidAmount: formValue.paidAmount || 0,
        dueAmount: this.dueAmount,
        paymentStatus: this.getPaymentStatus()
      },
      enrollmentStatus: formValue.paidAmount > 0 ? 'confirmed' : 'pending',
      notes: formValue.notes,
      isActive: formValue.isActive
    };

    // Add lead reference if from lead conversion
    if (this.isFromLead && this.leadId) {
      enrollmentData.lead = this.leadId;
    }

    const request = this.isEditMode
      ? this.enrollmentService.updateEnrollment(this.enrollmentId, enrollmentData)
      : this.enrollmentService.createEnrollment(enrollmentData);

    request.subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode 
            ? 'Enrollment updated successfully' 
            : 'Enrollment created successfully'
        });

        // Navigate to the enrollment detail view
        setTimeout(() => {
          this.router.navigate(['/dashboard/enrollments', response.data._id]);
        }, 500);
      },
      error: (error) => {
        console.error('Error saving enrollment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to save enrollment'
        });
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/dashboard/enrollments', this.enrollmentId]);
    } else {
      this.router.navigate(['/dashboard/enrollments']);
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
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Enrollment } from '../../../core/models/enrollment.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-enrollment-list',
  imports: [CommonModule,RouterLink, ReactiveFormsModule, SharedModule, TagModule],
  templateUrl: './enrollment-list.html',
  styleUrl: './enrollment-list.css',
})
export class EnrollmentList  implements OnInit {
  loading = false;
  enrollments: Enrollment[] = [];
  totalRecords = 0;

  // Pagination
  currentPage = 1;
  rowsPerPage = 10;

  // Stats
  stats = {
    total: 0,
    confirmed: 0,
    pending: 0,
    revenue: 0
  };

  // Filters
  filterForm: FormGroup;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Completed', value: 'completed' }
  ];

  paymentStatusOptions = [
    { label: 'All Payments', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Partial', value: 'partial' },
    { label: 'Completed', value: 'completed' }
  ];

  constructor(
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      paymentStatus: ['']
    });
  }

  ngOnInit(): void {
    // Listen to filter changes with debounce
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadEnrollments();
      });

    // Initial load
    this.loadEnrollments();
    this.loadStats();
  }

  loadEnrollments(): void {
    this.loading = true;

    const formValue = this.filterForm.value;
    const params: any = {
      page: this.currentPage,
      limit: this.rowsPerPage
    };

    if (formValue.search?.trim()) params.search = formValue.search.trim();
    if (formValue.status) params.status = formValue.status;
    if (formValue.paymentStatus) params.paymentStatus = formValue.paymentStatus;

    this.enrollmentService.getEnrollments(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.enrollments = response.data ?? [];
          this.totalRecords = response.total ?? 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load enrollments'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

 loadStats(): void {
  this.enrollmentService.getEnrollmentStats().subscribe({
    next: (response) => {
      if (response.success) {
        this.stats = {
          total: response.data.total || 0,
          confirmed: response.data.confirmed || 0,
          pending: response.data.pendingPayment || 0,
          revenue: response.data.revenue || 0
        };
      }
    },
    error: (error) => {
      console.error('Error loading stats:', error);
    }
  });
}


  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.rowsPerPage = event.rows;
    this.loadEnrollments();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      paymentStatus: ''
    });
  }

  viewEnrollment(id: string): void {
    this.router.navigate(['/dashboard/enrollments', id]);
  }

  getPaymentStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed': return 'success';
      case 'partial': return 'warn';
      case 'pending': return 'info';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'info';
      case 'completed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }
}
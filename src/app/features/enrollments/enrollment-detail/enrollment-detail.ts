import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Enrollment } from '../../../core/models/enrollment.model';
import { Payment } from '../../../core/models/payment.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-enrollment-detail',
  imports: [CommonModule,RouterLink,SharedModule,TagModule],
  templateUrl: './enrollment-detail.html',
  styleUrl: './enrollment-detail.css',
})
export class EnrollmentDetail  implements OnInit {
  loading = false;
  enrollment: Enrollment | null = null;
  payments: Payment[] = [];
  enrollmentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enrollmentService: EnrollmentService,
    private paymentService: PaymentService, // Add this
    private messageService: MessageService,
     private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.enrollmentId = params['id'];
        this.loadEnrollment(this.enrollmentId);
        this.loadPayments(this.enrollmentId);
      }
    });
  }

  loadEnrollment(id: string): void {
    this.loading = true;
    this.enrollmentService.getEnrollment(id).subscribe({
 next: (response) => {
  if (response.success) {
    this.enrollment = response.data;
  }
  this.loading = false;
  this.cdr.detectChanges();
},

      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load enrollment details'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPayments(enrollmentId: string): void {
    this.paymentService.getPaymentsByEnrollment(enrollmentId).subscribe({
      next: (payments) => { // Direct payments array
        this.payments = payments;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
      }
    });
  }

  getLastPaymentDate(): Date | null {
    if (!this.payments || this.payments.length === 0) {
      return null;
    }
    return this.payments.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )[0]?.paymentDate || null;
  }

  viewLead(leadId: string): void {
    this.router.navigate(['/dashboard/leads', leadId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/enrollments']);
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

  getPaymentStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed':
      case 'success': return 'success';
      case 'partial': return 'warn';
      case 'pending': return 'info';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';

import { Payment } from '../../../core/models/payment.model';
import { PaymentService } from '../../../core/services/payment.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-payment-detail',
  imports: [CommonModule, SharedModule, TagModule],
  templateUrl: './payment-detail.html',
  styleUrl: './payment-detail.css',
})
export class PaymentDetail  implements OnInit {
  loading = false;
  payment: Payment | null = null;
  paymentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.paymentId = params['id'];
        this.loadPayment(this.paymentId);
      }
    });
  }

  loadPayment(id: string): void {
    this.loading = true;
    this.paymentService.getPayment(id).subscribe({
      next: (payment) => {
        this.payment = payment;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading payment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load payment details'
        });
        this.router.navigate(['/dashboard/payments']);
      }
    });
  }

  printReceipt(): void {
    this.router.navigate(['/dashboard/payments', this.paymentId, 'receipt']);
  }

  refundPayment(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to refund this payment?',
      header: 'Confirm Refund',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.paymentService.updatePayment(this.paymentId, {
          status: 'refunded',
          remarks: 'Payment refunded'
        }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Payment refunded successfully'
            });
            this.loadPayment(this.paymentId);
          },
          error: (error) => {
            console.error('Error refunding payment:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to refund payment'
            });
          }
        });
      }
    });
  }

  viewEnrollment(enrollmentId: string): void {
    this.router.navigate(['/dashboard/enrollments', enrollmentId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/payments']);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'success': return 'success';
      case 'pending': return 'info';
      case 'failed': return 'danger';
      case 'refunded': return 'warn';
      default: return 'secondary';
    }
  }

  getPaymentStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'completed': return 'success';
      case 'partial': return 'warn';
      case 'pending': return 'info';
      default: return 'secondary';
    }
  }

  getPaymentModeIcon(mode: string): string {
    switch (mode) {
      case 'cash': return 'pi pi-money-bill';
      case 'card': return 'pi pi-credit-card';
      case 'upi': return 'pi pi-mobile';
      case 'bank_transfer': return 'pi pi-building';
      case 'cheque': return 'pi pi-file';
      default: return 'pi pi-money-bill';
    }
  }
}
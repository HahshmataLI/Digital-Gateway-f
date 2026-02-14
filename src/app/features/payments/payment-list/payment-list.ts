import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Payment, PaymentFilter } from '../../../core/models/payment.model';
import { PaymentService } from '../../../core/services/payment.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-payment-list',
  imports: [CommonModule,RouterLink, ReactiveFormsModule, SharedModule, TagModule, TableModule],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.css',
})
export class PaymentList  implements OnInit {
  loading = false;
  payments: Payment[] = [];
  totalRecords = 0;

  // Pagination
  currentPage = 1;
  rowsPerPage = 10;
  
  // Sorting - UI only, not sent to API
  sortField = 'paymentDate';
  sortOrder = -1;

  // Stats
  stats = {
    totalAmount: 0,
    todayAmount: 0,
    totalCount: 0,
    avgAmount: 0
  };

  // Filters
  filterForm: FormGroup;

  paymentModeOptions = [
    { label: 'All Modes', value: '' },
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'UPI', value: 'upi' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Cheque', value: 'cheque' }
  ];

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Success', value: 'success' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' }
  ];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      paymentMode: [''],
      status: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    // Listen to filter changes with debounce
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadPayments();
      });

    // Initial load
    this.loadPayments();
    this.loadStats();
  }

  loadPayments(): void {
    this.loading = true;

    const formValue = this.filterForm.value;
    
    // Create filter object - only include properties defined in PaymentFilter
    const filter: PaymentFilter = {
      page: this.currentPage,
      limit: this.rowsPerPage
    };

    if (formValue.startDate) filter.startDate = formValue.startDate;
    if (formValue.endDate) filter.endDate = formValue.endDate;
    if (formValue.paymentMode) filter.paymentMode = formValue.paymentMode;
    if (formValue.status) filter.status = formValue.status;
    if (formValue.search?.trim()) filter.search = formValue.search.trim();

    // Sorting is handled by the API params, not in the filter object
    const params: any = {
      ...filter,
      sortBy: this.sortField,
      sortOrder: this.sortOrder === 1 ? 'asc' : 'desc'
    };

    this.paymentService.getPayments(params).subscribe({
      next: (response) => {
        this.payments = response.data ?? [];
        this.totalRecords = response.total ?? 0;
        
        // Update stats from response summary
        if (response.summary) {
          this.stats.totalAmount = response.summary.totalAmount || 0;
          this.stats.totalCount = response.summary.count || 0;
          this.stats.avgAmount = this.stats.totalCount ? 
            Math.round(this.stats.totalAmount / this.stats.totalCount) : 0;
        }
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load payments'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats(): void {
    // Load today's collection
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    this.paymentService.getPaymentSummary(startOfDay, endOfDay).subscribe({
      next: (response) => {
        this.stats.todayAmount = response.totals?.totalAmount || 0;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.rowsPerPage = event.rows;
    this.loadPayments();
  }

  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadPayments();
  }

  clearFilters(): void {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      paymentMode: '',
      status: '',
      search: ''
    });
  }

  viewPayment(id: string): void {
    this.router.navigate(['/dashboard/payments', id]);
  }

  printReceipt(id: string): void {
    this.router.navigate(['/dashboard/payments', id, 'receipt']);
  }

  retryPayment(payment: Payment): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to retry this payment?',
      header: 'Confirm Retry',
      icon: 'pi pi-refresh',
      accept: () => {
        // Navigate to payment form with pre-filled data
        const enrollmentId = typeof payment.enrollment === 'string' 
          ? payment.enrollment 
          : payment.enrollment?._id;
        this.router.navigate(['/dashboard/payments/new', enrollmentId]);
      }
    });
  }

  exportReport(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Report export feature coming soon...'
    });
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
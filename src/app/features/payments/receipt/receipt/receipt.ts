import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Receipts } from '../../../../core/models/payment.model';
import { PaymentService } from '../../../../core/services/payment.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-receipt',
  imports: [CommonModule, SharedModule],
  templateUrl: './receipt.html',
  styleUrl: './receipt.css',
})
export class Receipt implements OnInit {
  loading = false;
  receipt: Receipts | null = null;
  paymentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.paymentId = params['id'];
        this.loadReceipt(this.paymentId);
      }
    });
  }

  loadReceipt(id: string): void {
    this.loading = true;
    this.paymentService.generateReceipt(id).subscribe({
      next: (receipt) => {
        this.receipt = receipt;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading receipt:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate receipt'
        });
        this.router.navigate(['/dashboard/payments', id]);
      }
    });
  }

  printReceipt(): void {
    window.print();
  }

  downloadPDF(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'PDF download feature coming soon...'
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/payments', this.paymentId]);
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Enrollment } from '../../../core/models/enrollment.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-payment-form',
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.css',
})
export class PaymentForm  implements OnInit {
  loading = false;
  submitting = false;
  enrollmentId: string = '';
  enrollment: Enrollment | null = null;
  today = new Date();

  paymentForm: FormGroup;

  paymentModeOptions = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'UPI', value: 'upi' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Cheque', value: 'cheque' }
  ];

  showTransactionRef = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private enrollmentService: EnrollmentService,
    private paymentService: PaymentService,
    private messageService: MessageService
  ) {
    this.paymentForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['enrollmentId']) {
        this.enrollmentId = params['enrollmentId'];
        this.loadEnrollment(this.enrollmentId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      paymentDate: [new Date(), Validators.required],
      paymentMode: ['', Validators.required],
      transactionReference: [''],
      bankName: [''],
      cardLastFour: ['', [Validators.pattern(/^[0-9]{4}$/)]],
      upiId: [''],
      chequeNumber: [''],
      chequeDate: [''],
      remarks: ['']
    });
  }

  private loadEnrollment(id: string): void {
    this.loading = true;
    this.enrollmentService.getEnrollment(id).subscribe({
     next: (response) => {
  if (response.success) {
    this.enrollment = response.data;
    this.setupAmountValidator();
  }
  this.loading = false;
},

      error: (error) => {
        console.error('Error loading enrollment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load enrollment details'
        });
        this.router.navigate(['/dashboard/enrollments']);
      }
    });
  }

  private setupAmountValidator(): void {
    if (this.enrollment) {
      const amountControl = this.paymentForm.get('amount');
      amountControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.enrollment.fees.dueAmount)
      ]);
      amountControl?.updateValueAndValidity();
    }
  }

  onPaymentModeChange(): void {
    const mode = this.paymentForm.get('paymentMode')?.value;
    
    // Reset transaction reference fields
    this.paymentForm.patchValue({
      transactionReference: '',
      bankName: '',
      cardLastFour: '',
      upiId: '',
      chequeNumber: '',
      chequeDate: ''
    });

    // Set validators based on payment mode
    this.showTransactionRef = ['card', 'upi', 'bank_transfer', 'cheque'].includes(mode);
    
    if (this.showTransactionRef) {
      this.paymentForm.get('transactionReference')?.setValidators([Validators.required]);
    } else {
      this.paymentForm.get('transactionReference')?.clearValidators();
    }
    
    this.paymentForm.get('transactionReference')?.updateValueAndValidity();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    this.submitting = true;

    const formValue = this.paymentForm.value;
    
    const paymentData: any = {
      enrollment: this.enrollmentId,
      amount: formValue.amount,
      paymentDate: formValue.paymentDate,
      paymentMode: formValue.paymentMode,
      remarks: formValue.remarks,
      transactionDetails: {}
    };

    // Add transaction details based on payment mode
    switch (formValue.paymentMode) {
      case 'card':
        paymentData.transactionDetails = {
          reference: formValue.transactionReference,
          cardLastFour: formValue.cardLastFour
        };
        break;
      case 'upi':
        paymentData.transactionDetails = {
          reference: formValue.transactionReference,
          upiId: formValue.upiId
        };
        break;
      case 'bank_transfer':
        paymentData.transactionDetails = {
          reference: formValue.transactionReference,
          bankName: formValue.bankName
        };
        break;
      case 'cheque':
        paymentData.transactionDetails = {
          reference: formValue.transactionReference,
          chequeNumber: formValue.chequeNumber,
          chequeDate: formValue.chequeDate
        };
        break;
    }

    this.paymentService.createPayment(paymentData).subscribe({
      next: (payment) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment recorded successfully'
        });

        setTimeout(() => {
          this.router.navigate(['/dashboard/enrollments', this.enrollmentId]);
        }, 500);
      },
      error: (error) => {
        console.error('Error recording payment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to record payment'
        });
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/enrollments', this.enrollmentId]);
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

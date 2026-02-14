import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Payment, PaymentFilter, CreatePaymentRequest, Receipts } from '../models/payment.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  count?: number;
  summary?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private apiService: ApiService) {}

  // Get all payments with filters
  getPayments(filter: PaymentFilter | any = {}): Observable<any> {
    const params: any = {
      page: filter.page || 1,
      limit: filter.limit || 10,
      ...filter
    };
    return this.apiService.get<any>('/payments', params);
  }

  // Get single payment
  getPayment(id: string): Observable<Payment> {
    return this.apiService.get<ApiResponse<Payment>>(`/payments/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to load payment');
      })
    );
  }

  // Create new payment
  createPayment(paymentData: CreatePaymentRequest): Observable<Payment> {
    return this.apiService.post<ApiResponse<Payment>>('/payments', paymentData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to create payment');
      })
    );
  }

  // Update payment
  updatePayment(id: string, paymentData: Partial<Payment>): Observable<Payment> {
    return this.apiService.put<ApiResponse<Payment>>(`/payments/${id}`, paymentData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update payment');
      })
    );
  }

  // Delete payment
  deletePayment(id: string): Observable<any> {
    return this.apiService.delete<ApiResponse<any>>(`/payments/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Failed to delete payment');
      })
    );
  }

  // Get payments by enrollment
  getPaymentsByEnrollment(enrollmentId: string): Observable<Payment[]> {
    return this.apiService.get<ApiResponse<Payment[]>>(`/payments/enrollment/${enrollmentId}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to load payments');
      })
    );
  }

  // Generate receipt
  generateReceipt(id: string): Observable<Receipts> {
    return this.apiService.get<ApiResponse<Receipts>>(`/payments/${id}/receipt`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to generate receipt');
      })
    );
  }

  // Get payment summary
  getPaymentSummary(startDate?: Date, endDate?: Date): Observable<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    return this.apiService.get<any>('/payments/summary', params);
  }
}
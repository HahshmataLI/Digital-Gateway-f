import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Batch, BatchFilter, CreateBatchRequest } from '../models/batch.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  constructor(private apiService: ApiService) {}

  // Get all batches with filters
  getBatches(filter: BatchFilter = {}): Observable<any> {
    const params: any = {
      page: filter.page || 1,
      limit: filter.limit || 10,
      ...filter
    };
    return this.apiService.get<any>('/batches', params);
  }

  // Get single batch
  getBatch(id: string): Observable<Batch> {
    return this.apiService.get<ApiResponse<Batch>>(`/batches/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to load batch');
      })
    );
  }

  // Create new batch
  createBatch(batchData: CreateBatchRequest): Observable<Batch> {
    return this.apiService.post<ApiResponse<Batch>>('/batches', batchData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to create batch');
      })
    );
  }

  // Update batch
  updateBatch(id: string, batchData: Partial<Batch>): Observable<Batch> {
    return this.apiService.put<ApiResponse<Batch>>(`/batches/${id}`, batchData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update batch');
      })
    );
  }

  // Delete batch
  deleteBatch(id: string): Observable<any> {
    return this.apiService.delete<ApiResponse<any>>(`/batches/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Failed to delete batch');
      })
    );
  }

  // Update batch status
  updateBatchStatus(id: string, status: string): Observable<Batch> {
    return this.apiService.patch<ApiResponse<Batch>>(`/batches/${id}/status`, { status }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update batch status');
      })
    );
  }

  // Get batches by course
  getBatchesByCourse(courseId: string): Observable<Batch[]> {
    return this.apiService.get<ApiResponse<Batch[]>>(`/batches/course/${courseId}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to load batches');
      })
    );
  }

  // Enroll student in batch
  enrollStudent(batchId: string, enrollmentId: string): Observable<any> {
    return this.apiService.post<ApiResponse<any>>(`/batches/${batchId}/enroll`, { enrollmentId }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to enroll student');
      })
    );
  }

  // Get batch attendance
  getBatchAttendance(batchId: string, date?: Date): Observable<any> {
    const params: any = {};
    if (date) params.date = date.toISOString();
    
    return this.apiService.get<any>(`/batches/${batchId}/attendance`, params);
  }
}
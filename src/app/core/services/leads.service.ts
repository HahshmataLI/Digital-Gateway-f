import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Lead, 
  CreateLeadRequest, 
  UpdateLeadRequest, 
  AddFollowUpRequest, 
  LeadStatus 
} from '../models/lead.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  constructor(private apiService: ApiService) {}

  // Get all leads with pagination support
  getLeads(page: number = 1, limit: number = 10, filters?: any): Observable<any> {
    const params = { page, limit, ...filters };
    return this.apiService.get<any>('/leads', params);
  }

  // Get single lead - Fixed to handle wrapped response
  getLead(id: string): Observable<Lead> {
    return this.apiService.get<ApiResponse<Lead>>(`/leads/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to load lead');
      })
    );
  }

  // Create new lead - Fixed to handle wrapped response
  createLead(leadData: CreateLeadRequest): Observable<Lead> {
    return this.apiService.post<ApiResponse<Lead>>('/leads', leadData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to create lead');
      })
    );
  }

  // Update lead - Fixed to handle wrapped response
  updateLead(id: string, leadData: UpdateLeadRequest): Observable<Lead> {
    return this.apiService.put<ApiResponse<Lead>>(`/leads/${id}`, leadData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update lead');
      })
    );
  }

  // Update lead status
  updateLeadStatus(id: string, status: LeadStatus): Observable<Lead> {
    return this.updateLead(id, { status });
  }

  // Add follow-up to lead
  addFollowUp(id: string, followUpData: AddFollowUpRequest): Observable<Lead> {
    return this.apiService.post<ApiResponse<Lead>>(`/leads/${id}/follow-up`, followUpData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to add follow-up');
      })
    );
  }

  // Delete lead (admin only)
  deleteLead(id: string): Observable<any> {
    return this.apiService.delete<ApiResponse<any>>(`/leads/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Failed to delete lead');
      })
    );
  }

  // Get leads by source
  getLeadsBySource(source: string): Observable<Lead[]> {
    return this.apiService.get<ApiResponse<Lead[]>>(`/leads/source/${source}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to get leads by source');
      })
    );
  }
}
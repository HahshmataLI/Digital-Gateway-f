import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Enrollment, EnrollmentFilter } from '../models/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  constructor(private api: ApiService) {}

  getEnrollments(filter: EnrollmentFilter = {}): Observable<any> {
    return this.api.get('/enrollments', filter);
  }
    getEnrollmentStats(): Observable<any> {
      return this.api.get('/enrollments/stats');
    }

  getEnrollment(id: string): Observable<any> {
    return this.api.get(`/enrollments/${id}`);
  }

  createEnrollment(enrollment: Enrollment): Observable<any> {
    return this.api.post('/enrollments', enrollment);
  }

  updateEnrollment(id: string, enrollment: Enrollment): Observable<any> {
    return this.api.put(`/enrollments/${id}`, enrollment);
  }

  deleteEnrollment(id: string): Observable<any> {
    return this.api.delete(`/enrollments/${id}`);
  }

  updateEnrollmentStatus(id: string, status: string): Observable<any> {
    return this.api.patch(`/enrollments/${id}/status`, { status });
  }

  getEnrollmentByLead(leadId: string): Observable<any> {
    return this.api.get(`/enrollments/lead/${leadId}`);
  }
}
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Course, CourseFilter } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private api: ApiService) { }

  getCourses(params?: any): Observable<any> {
    return this.api.get('/courses', params || {});
  }

  getCourse(id: string): Observable<any> {
    return this.api.get(`/courses/${id}`);
  }

  createCourse(course: Course): Observable<any> {
    return this.api.post('/courses', course);
  }

  updateCourse(id: string, course: Partial<Course>): Observable<any> {
    return this.api.put(`/courses/${id}`, course);
  }

  deleteCourse(id: string): Observable<any> {
    return this.api.delete(`/courses/${id}`);
  }

  getActiveCourses(): Observable<any> {
    return this.api.get('/courses/active');
  }
}
// src/app/modules/courses/courses.routes.ts
import { Routes } from '@angular/router';

// ✅ CORRECT ORDER (static routes first, dynamic last)
export const COURSES_ROUTES: Routes = [
  {
    path: '', // matches /courses
    loadComponent: () => import('./course-list/course-list').then(m => m.CourseList)
  },
  {
    path: 'new', // matches /courses/new (static route first) ✅
    loadComponent: () => import('./course-form/course-form').then(m => m.CourseForm)
  },
  {
    path: ':id/edit', // matches /courses/123/edit (specific pattern) ✅
    loadComponent: () => import('./course-form/course-form').then(m => m.CourseForm)
  },
  {
    path: ':id', // matches /courses/123 (dynamic route LAST) ✅
    loadComponent: () => import('./course-detail/course-detail').then(m => m.CourseDetail)
  }
];
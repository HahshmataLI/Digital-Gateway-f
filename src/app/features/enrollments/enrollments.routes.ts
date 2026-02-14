import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

export const ENROLLMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./enrollment-list/enrollment-list').then(m => m.EnrollmentList),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.ACCOUNTANT] }
  },
  {
    path: 'new',
    loadComponent: () => import('./enrollment-form/enrollment-form').then(m => m.EnrollmentForm),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  },
  {
    path: 'from-lead/:leadId',
    loadComponent: () => import('./enrollment-form/enrollment-form').then(m => m.EnrollmentForm),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./enrollment-form/enrollment-form').then(m => m.EnrollmentForm),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  },
  {
    path: ':id',
    loadComponent: () => import('./enrollment-detail/enrollment-detail').then(m => m.EnrollmentDetail),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.ACCOUNTANT] }
  }
];
import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

export const BATCHES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./batch-list/batch-list').then(m => m.BatchList),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.TRAINER] }
  },
  {
    path: 'new',
    loadComponent: () => import('./batch-form/batch-form').then(m => m.BatchForm),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./batch-form/batch-form').then(m => m.BatchForm),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  },
  {
    path: ':id',
    loadComponent: () => import('./batch-detail/batch-detail').then(m => m.BatchDetail),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.TRAINER] }
  },
//   {
//     path: ':id/attendance',
//     loadComponent: () => import('./batch-attendance/batch-attendance').then(m => m.BatchAttendance),
//     data: { roles: [UserRole.ADMIN, UserRole.TRAINER] }
//   }
];
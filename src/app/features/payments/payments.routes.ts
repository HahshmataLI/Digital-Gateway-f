import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payment-list/payment-list').then(m => m.PaymentList),
    data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.COUNSELOR] }
  },
  {
    path: 'new/:enrollmentId',
    loadComponent: () => import('./payment-form/payment-form').then(m => m.PaymentForm),
    data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] }
  },
  {
    path: ':id',
    loadComponent: () => import('./payment-detail/payment-detail').then(m => m.PaymentDetail),
    data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.COUNSELOR] }
  },
  {
    path: ':id/receipt',
    loadComponent: () => import('./receipt/receipt/receipt').then(m => m.Receipt),
    data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.COUNSELOR] }
  }
];
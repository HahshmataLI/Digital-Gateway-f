import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

export const LEADS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./leads-list/leads-list/leads-list').then(m => m.LeadsList),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  },
    {
    path: ':id/edit',
    loadComponent: () => import('./leads-list/leads-listfeatures/leads/create-lead/create-lead/create-lead').then(m => m.CreateLead),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  },
  {
    path: 'new',
    loadComponent: () => import('./leads-list/leads-listfeatures/leads/create-lead/create-lead/create-lead').then(m => m.CreateLead),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  },
  {
    path: ':id',
    loadComponent: () => import('./leads-list/leads-listfeatures/leads/create-lead/create-leadfeatures/leads/lead-detail/lead-detail/lead-detail').then(m => m.LeadDetail),
    data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
  }
];
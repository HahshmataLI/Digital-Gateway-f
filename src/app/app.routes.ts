import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./core/layout/main-layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'leads',
        loadChildren: () => import('./features/leads/leads.routes').then(m => m.LEADS_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
      },
       {
        path: 'batches',
        loadChildren: () => import('./features/batches/batches.routes').then(m => m.BATCHES_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.TRAINER] }
      },
            {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then(m => m.PAYMENTS_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] }
      },
      //       {
      //   path: 'users',
      //   loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
      //   canActivate: [RoleGuard],
      //   data: { roles: [UserRole.ADMIN] }
      // },
      // {
      //   path: 'reports',
      //   loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
      //   canActivate: [RoleGuard],
      //   data: { roles: [UserRole.ADMIN] }
      // },
      {
        path: 'courses',
        loadChildren: () => import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR] }
      },
      {
        path: 'enrollments',
        loadChildren: () => import('./features/enrollments/enrollments.routes').then(m => m.ENROLLMENTS_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.ACCOUNTANT] }
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then(m => m.PAYMENTS_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] }
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
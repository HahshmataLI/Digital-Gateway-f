import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { AvatarModule } from 'primeng/avatar';
import { UserRole } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, PanelMenuModule, AvatarModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  @Output() closeSidebar = new EventEmitter<void>();
  
  menuItems: MenuItem[] = [];
  user: any;
  
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.buildMenu();
    });
  }

  private buildMenu(): void {
    const user = this.user;
    const menu: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-pie',
        routerLink: '/dashboard',
        routerLinkActiveOptions: { exact: true }
      }
    ];

    // Leads - Admin & Counselor only
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.COUNSELOR) {
      menu.push({
        label: 'Leads',
        icon: 'pi pi-users',
        expanded: false,
        items: [
          {
            label: 'All Leads',
            icon: 'pi pi-list',
            routerLink: '/dashboard/leads'
          },
          {
            label: 'Add New Lead',
            icon: 'pi pi-user-plus',
            routerLink: '/dashboard/leads/new'
          }
        ]
      });
    }

    // Courses - Admin & Counselor only
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.COUNSELOR) {
      menu.push({
        label: 'Courses',
        icon: 'pi pi-book',
        expanded: false,
        items: [
          {
            label: 'All Courses',
            icon: 'pi pi-list',
            routerLink: '/dashboard/courses'
          },
          {
            label: 'Add New Course',
            icon: 'pi pi-plus',
            routerLink: '/dashboard/courses/new'
          }
        ]
      });
    }

    // Batches - Admin, Counselor & Trainer
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.COUNSELOR || user?.role === UserRole.TRAINER) {
      menu.push({
        label: 'Batches',
        icon: 'pi pi-calendar',
        expanded: false,
        items: [
          {
            label: 'All Batches',
            icon: 'pi pi-list',
            routerLink: '/dashboard/batches'
          },
          {
            label: 'Create Batch',
            icon: 'pi pi-plus',
            routerLink: '/dashboard/batches/new'
          },
          {
            label: 'Mark Attendance',
            icon: 'pi pi-check-square',
            routerLink: '/dashboard/batches/attendance'
          }
        ]
      });
    }

    // Enrollments - Admin, Counselor & Accountant
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.COUNSELOR || user?.role === UserRole.ACCOUNTANT) {
      menu.push({
        label: 'Enrollments',
        icon: 'pi pi-user-plus',
        expanded: false,
        items: [
          {
            label: 'All Enrollments',
            icon: 'pi pi-list',
            routerLink: '/dashboard/enrollments'
          },
          {
            label: 'New Enrollment',
            icon: 'pi pi-plus',
            routerLink: '/dashboard/enrollments/new'
          }
        ]
      });
    }

    // Payments - Admin & Accountant
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.ACCOUNTANT) {
      menu.push({
        label: 'Payments',
        icon: 'pi pi-credit-card',
        expanded: false,
        items: [
          {
            label: 'All Payments',
            icon: 'pi pi-list',
            routerLink: '/dashboard/payments'
          },
          {
            label: 'Payment Report',
            icon: 'pi pi-chart-line',
            routerLink: '/dashboard/payments/report'
          }
        ]
      });
    }

    // Users - Admin only
    if (user?.role === UserRole.ADMIN) {
      menu.push({
        label: 'Users',
        icon: 'pi pi-user',
        expanded: false,
        items: [
          {
            label: 'All Users',
            icon: 'pi pi-list',
            routerLink: '/dashboard/users'
          },
          {
            label: 'Add New User',
            icon: 'pi pi-plus',
            routerLink: '/dashboard/users/new'
          }
        ]
      });
    }

    // Reports - Admin only
    if (user?.role === UserRole.ADMIN) {
      menu.push({
        label: 'Reports',
        icon: 'pi pi-chart-bar',
        expanded: false,
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-home',
            routerLink: '/dashboard/reports'
          },
          {
            label: 'Lead Report',
            icon: 'pi pi-users',
            routerLink: '/dashboard/reports/leads'
          },
          {
            label: 'Revenue Report',
            icon: 'pi pi-wallet',
            routerLink: '/dashboard/reports/revenue'
          },
          {
            label: 'Attendance Report',
            icon: 'pi pi-check-square',
            routerLink: '/dashboard/reports/attendance'
          }
        ]
      });
    }

    this.menuItems = menu;
  }

  onMenuOpen(): void {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        this.closeSidebar.emit();
      }, 200); // Small delay for better UX
    }
  }
}
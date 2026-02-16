import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, ButtonModule, AvatarModule, MenuModule, TooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();
  
  private authService = inject(AuthService);
  user: User | null = null;
  isMobile = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
  }

  toggleMenu() {
    this.menuToggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
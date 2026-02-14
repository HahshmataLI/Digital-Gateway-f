import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, ButtonModule, AvatarModule, MenuModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header  implements OnInit{

  private authService = inject(AuthService);
  user = this.authService.getCurrentUser();

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
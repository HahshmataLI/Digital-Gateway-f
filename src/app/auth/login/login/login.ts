import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
// import { LoginRequest } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-login',
  imports: [    CommonModule,
    FormsModule,ProgressSpinnerModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login  {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

onSubmit(): void {
  if (!this.email || !this.password) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please enter email and password',
      life: 3000
    });
    return;
  }

  this.loading = true;

  const credentials = {
    email: this.email,
    password: this.password
  };

this.authService.login(credentials).subscribe({
  next: (response: any) => {
    if (response.success && response.data) {

      // 🔥 THIS LINE WAS MISSING
      this.authService.handleLoginResponse(response);

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Welcome, ${response.data.user.name}!`,
        life: 3000
      });

      this.router.navigate(['/dashboard']);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  },
  error: (error) => {
    this.loading = false;
    this.password = '';

    let errorDetail = 'Login failed';
    if (error.status === 401) {
      errorDetail = 'Invalid email or password';
    } else if (error.status === 0) {
      errorDetail = 'Cannot connect to server';
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: errorDetail,
      life: 3000
    });
  }
});

}
}
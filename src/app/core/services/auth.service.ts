import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRole } from '../models/user.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user_data';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearStorage();
      }
    }
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.apiService.post('/auth/login', credentials);
  }

  handleLoginResponse(response: any): void {
    if (response.success && response.data) {
      const { token, user } = response.data;
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(requiredRoles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }

  // Get all users (Admin only)
  getUsers(): Observable<User[]> {
    return this.apiService.get<ApiResponse<User[]>>('/users').pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        return [];
      })
    );
  }

  // Get users by role - FIXED: Use UserRole enum type
  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.apiService.get<ApiResponse<User[]>>(`/users?role=${role}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        return [];
      })
    );
  }

  // Get single user
  getUser(id: string): Observable<User> {
    return this.apiService.get<ApiResponse<User>>(`/users/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('User not found');
      })
    );
  }

  // Create user (Admin only) - FIXED: Response structure
  createUser(userData: Partial<User>): Observable<User> {
    return this.apiService.post<RegisterResponse>('/auth/register', userData).pipe(
      map(response => {
        if (response.success) {
          return response.data.user; // Now correctly typed
        }
        throw new Error(response.message || 'Failed to create user');
      })
    );
  }

  // Update user (Admin only)
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.apiService.put<ApiResponse<User>>(`/users/${id}`, userData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update user');
      })
    );
  }

  // Delete user (Admin only)
  deleteUser(id: string): Observable<any> {
    return this.apiService.delete<ApiResponse<any>>(`/users/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Failed to delete user');
      })
    );
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
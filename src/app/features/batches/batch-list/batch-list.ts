import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { MessageService } from 'primeng/api';

import { Batch, BatchFilter } from '../../../core/models/batch.model';
import { Course } from '../../../core/models/course.model';
import { User, UserRole } from '../../../core/models/user.model';
import { BatchService } from '../../../core/services/batch.service';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service'; // Changed from UserService
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
@Component({
  selector: 'app-batch-list',
  imports: [CommonModule,RouterLink, ReactiveFormsModule, SharedModule, TagModule, TableModule, ProgressBarModule],
  templateUrl: './batch-list.html',
  styleUrl: './batch-list.css',
})
export class BatchList implements OnInit {
  loading = false;
  batches: Batch[] = [];
  totalRecords = 0;

  // Pagination
  currentPage = 1;
  rowsPerPage = 10;
  sortField = 'startDate';
  sortOrder = -1;

  // Stats
  stats = {
    total: 0,
    active: 0,
    upcoming: 0,
    ongoing: 0
  };

  // Filters
  filterForm: FormGroup;

  // Options
  courses: Course[] = [];
  courseOptions: any[] = [];
  loadingCourses = false;

  trainers: User[] = [];
  trainerOptions: any[] = [];
  loadingTrainers = false;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  constructor(
    private fb: FormBuilder,
    private batchService: BatchService,
    private courseService: CourseService,
    private authService: AuthService, // Changed from UserService
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      course: [''],
      status: [''],
      trainer: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadTrainers();
    
    // Listen to filter changes with debounce
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadBatches();
      });

    // Initial load
    this.loadBatches();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getActiveCourses().subscribe({
      next: (response: any) => {
        this.courses = response.data || [];
        this.courseOptions = this.courses.map(course => ({
          label: `${course.code} - ${course.name}`,
          value: course._id
        }));
        this.loadingCourses = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loadingCourses = false;
      }
    });
  }

// FIXED: Use UserRole.TRAINER enum instead of string 'trainer'
  loadTrainers(): void {
    this.loadingTrainers = true;
    this.authService.getUsersByRole(UserRole.TRAINER).subscribe({
      next: (users) => {
        this.trainers = users;
        this.trainerOptions = this.trainers.map(trainer => ({
          label: trainer.name,
          value: trainer._id
        }));
        this.loadingTrainers = false;
      },
      error: (error) => {
        console.error('Error loading trainers:', error);
        this.loadingTrainers = false;
      }
    });
  }

  loadBatches(): void {
    this.loading = true;

    const formValue = this.filterForm.value;
    
    const filter: BatchFilter = {
      page: this.currentPage,
      limit: this.rowsPerPage
    };

    if (formValue.course) filter.course = formValue.course;
    if (formValue.status) filter.status = formValue.status;
    if (formValue.trainer) filter.trainer = formValue.trainer;
    if (formValue.search?.trim()) filter.search = formValue.search.trim();

    const params: any = {
      ...filter,
      sortBy: this.sortField,
      sortOrder: this.sortOrder === 1 ? 'asc' : 'desc'
    };

    this.batchService.getBatches(params).subscribe({
      next: (response) => {
        this.batches = response.data ?? [];
        this.totalRecords = response.total ?? 0;
        
        // Calculate stats
        this.stats.total = this.totalRecords;
        this.stats.active = this.batches.filter(b => b.status === 'ongoing').length;
        this.stats.upcoming = this.batches.filter(b => b.status === 'upcoming').length;
        this.stats.ongoing = this.batches.filter(b => b.status === 'ongoing').length;
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading batches:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load batches'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.rowsPerPage = event.rows;
    this.loadBatches();
  }

  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadBatches();
  }

  clearFilters(): void {
    this.filterForm.reset({
      course: '',
      status: '',
      trainer: '',
      search: ''
    });
  }

  viewBatch(id: string): void {
    this.router.navigate(['/dashboard/batches', id]);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'ongoing': return 'success';
      case 'upcoming': return 'info';
      case 'completed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'contrast';
    }
  }
}
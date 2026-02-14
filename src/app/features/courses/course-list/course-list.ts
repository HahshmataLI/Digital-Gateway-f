import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Course } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-course-list',
  imports: [SharedModule,ReactiveFormsModule,RouterLink,CommonModule,FormsModule,TagModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
})
export class CourseList implements OnInit {
  loading = false;
  courses: Course[] = [];
  totalRecords = 0;

  // Pagination
  currentPage = 1;
  rowsPerPage = 10;

  // Filters
  filterForm: FormGroup;

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' }
  ];

  durationOptions = [
    { label: 'All Durations', value: '' },
    { label: '1 Month', value: '1 month' },
    { label: '2 Months', value: '2 months' },
    { label: '3 Months', value: '3 months' },
    { label: '6 Months', value: '6 months' },
    { label: '1 Year', value: '1 year' }
  ];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      isActive: [''],
      duration: ['']
    });
  }

  ngOnInit(): void {
    // Listen to filter changes with debounce
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadCourses();
      });

    // Initial load
    this.loadCourses();
  }

loadCourses(): void {
  this.loading = true;

  const formValue = this.filterForm.value;
  const { search, isActive, duration } = formValue;

  const params: any = {
    page: this.currentPage,
    limit: this.rowsPerPage
  };

  // Add filters - only if they have values
  if (search?.trim()) params.search = search.trim();
  if (isActive !== '' && isActive !== null && isActive !== undefined) {
    params.isActive = isActive;
  }
  if (duration?.trim() && duration !== '') {
    params.duration = duration.trim();
  }

  console.log('Fetching courses with params:', params);

  this.courseService.getCourses(params).subscribe({
    next: (response) => {
      console.log('Courses response:', response);
      if (response.success) {
        this.courses = response.data ?? [];
        this.totalRecords = response.total ?? response.count ?? 0;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: response.message || 'Failed to load courses'
        });
      }
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error loading courses:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load courses'
      });
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.rowsPerPage = event.rows;
    this.loadCourses();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadCourses();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      isActive: '',
      duration: ''
    });
    // No need to call loadCourses() here as valueChanges will trigger it
  }

  addNewCourse(): void {
    this.router.navigate(['/dashboard/courses/new']);
  }

  viewCourse(id: string): void {
    this.router.navigate(['/dashboard/courses', id]);
  }

  editCourse(id: string): void {
    this.router.navigate(['/dashboard/courses/edit', id]);
  }

  toggleCourseStatus(course: Course): void {
    const action = course.isActive ? 'deactivate' : 'activate';
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} this course?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const updatedCourse = { ...course, isActive: !course.isActive };
        this.courseService.updateCourse(course._id!, updatedCourse).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Course ${action}d successfully`
            });
            this.loadCourses();
          },
          error: (error) => {
            console.error('Error toggling course status:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Failed to ${action} course`
            });
          }
        });
      }
    });
  }

  deleteCourse(id: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this course? This action cannot be undone.',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.courseService.deleteCourse(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Course deleted successfully'
            });
            this.loadCourses();
          },
          error: (error) => {
            console.error('Error deleting course:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete course'
            });
          }
        });
      }
    });
  }
}
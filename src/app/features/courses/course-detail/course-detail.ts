import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Course, UserRef } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-course-detail',
  imports: [SharedModule, TagModule, RouterLink,CommonModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css',
})
export class CourseDetail  implements OnInit {
  course: Course | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadCourse(params['id']);
      }
    });
  }

  loadCourse(id: string): void {
    this.loading = true;
    this.courseService.getCourse(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.course = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load course details'
          });
          this.router.navigate(['/dashboard/courses']);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load course details'
        });
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/courses']);
      }
    });
  }

  getTotalCourseHours(): number {
    if (!this.course?.curriculum || this.course.curriculum.length === 0) {
      return 0;
    }
    return this.course.curriculum.reduce((total, topic) => total + topic.hours, 0);
  }

  toggleCourseStatus(): void {
    if (!this.course?._id) return;

    const action = this.course.isActive ? 'deactivate' : 'activate';
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} this course?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const updateData = {
          isActive: !this.course?.isActive
        };
        
        this.courseService.updateCourse(this.course!._id!, updateData).subscribe({
          next: (response) => {
            if (response.success) {
              this.course = response.data;
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Course ${action}d successfully`
              });
            }
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

  deleteCourse(): void {
    if (!this.course?._id) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this course? This action cannot be undone.',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.courseService.deleteCourse(this.course!._id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Course deleted successfully'
              });
              this.router.navigate(['/dashboard/courses']);
            }
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

  viewStudents(): void {
    this.router.navigate(['/dashboard/students'], { 
      queryParams: { course: this.course?._id } 
    });
  }

  duplicateCourse(): void {
    if (!this.course) return;

    this.confirmationService.confirm({
      message: 'Create a copy of this course?',
      header: 'Duplicate Course',
      icon: 'pi pi-copy',
      accept: () => {
        const { _id, createdAt, updatedAt, ...courseData } = this.course!;
        const duplicateData = {
          ...courseData,
          name: `${courseData.name} (Copy)`,
          code: `${courseData.code}-COPY`,
          isActive: false
        };

        this.courseService.createCourse(duplicateData).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Course duplicated successfully'
              });
              this.router.navigate(['/dashboard/courses', response.data._id]);
            }
          },
          error: (error) => {
            console.error('Error duplicating course:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to duplicate course'
            });
          }
        });
      }
    });
  }

  // Helper method to get user name safely
  getUserName(user: string | UserRef | undefined): string {
    if (!user) return 'Unknown';
    if (typeof user === 'string') return user; // Return ObjectId if not populated
    return user.name || 'Unknown';
  }

  // Check if createdBy/updatedBy is a populated user object
  isPopulatedUser(user: string | UserRef | undefined): user is UserRef {
    return typeof user === 'object' && user !== null && 'name' in user;
  }
}
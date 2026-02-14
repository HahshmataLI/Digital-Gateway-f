import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Course } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-course-form',
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './course-form.html',
  styleUrl: './course-form.css',
})
export class CourseForm implements OnInit {
  loading = false;
  isEditMode = false;
  courseId: string = '';
  
  courseForm: FormGroup;
  
  durationOptions = [
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
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.courseForm = this.createForm();
  }

// In course-form.ts, update ngOnInit to handle edit mode:
ngOnInit() {
  this.route.params.subscribe(params => {
    // Check if we're on edit route (has 'id' parameter)
    if (params['id']) {
      this.isEditMode = true;
      this.courseId = params['id'] as string; // Type assertion to string
      this.loadCourse(this.courseId);
    } else {
      // New course mode
      this.isEditMode = false;
      this.courseId = ''; // Reset for new course
      // Reset form for new course
      this.resetForm();
    }
  });
}

// Also update the cancel method to use proper navigation:

  createForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.pattern]],
      name: ['', Validators.required],
      description: ['', Validators.required],
      duration: ['', Validators.required],
      fees: [0, [Validators.required, Validators.min(0)]],
      curriculum: this.fb.array([this.createCurriculumTopic()], Validators.required),
      prerequisitesString: [''],
      isActive: [true]
    });
  }
resetForm(): void {
  this.courseForm.reset({
    code: '',
    name: '',
    description: '',
    duration: '1 month', 
    fees: 0,
    curriculum: [this.createCurriculumTopic()],
    prerequisitesString: '',
    isActive: true
  });
  
  // Clear curriculum array and add one default topic
  while (this.curriculumFormArray.length !== 0) {
    this.curriculumFormArray.removeAt(0);
  }
  this.curriculumFormArray.push(this.createCurriculumTopic());
}
  createCurriculumTopic(): FormGroup {
    return this.fb.group({
      topic: ['', Validators.required],
      hours: [1, [Validators.required, Validators.min(1)]]
    });
  }

  get curriculumFormArray(): FormArray {
    return this.courseForm.get('curriculum') as FormArray;
  }

  addCurriculumTopic(): void {
    this.curriculumFormArray.push(this.createCurriculumTopic());
  }

  removeCurriculumTopic(index: number): void {
    this.curriculumFormArray.removeAt(index);
  }

  loadCourse(id: string): void {
    this.loading = true;
    this.courseService.getCourse(id).subscribe({
      next: (response) => {
        const course = response.data;
        this.patchFormWithCourse(course);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load course'
        });
        this.router.navigate(['/courses']);
      }
    });
  }

  patchFormWithCourse(course: Course): void {
    // Clear existing curriculum
    while (this.curriculumFormArray.length !== 0) {
      this.curriculumFormArray.removeAt(0);
    }
    
    // Add curriculum topics
    if (course.curriculum && course.curriculum.length > 0) {
      course.curriculum.forEach(topic => {
        this.curriculumFormArray.push(
          this.fb.group({
            topic: [topic.topic, Validators.required],
            hours: [topic.hours, [Validators.required, Validators.min(1)]]
          })
        );
      });
    } else {
      this.curriculumFormArray.push(this.createCurriculumTopic());
    }
    
    // Set prerequisites as string (one per line)
    const prerequisitesString = course.prerequisites?.join('\n') || '';
    
    this.courseForm.patchValue({
      code: course.code,
      name: course.name,
      description: course.description,
      duration: course.duration,
      fees: course.fees,
      prerequisitesString: prerequisitesString,
      isActive: course.isActive
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.markFormGroupTouched(this.courseForm);
      return;
    }

    this.loading = true;
    
    // Prepare course data
    const formValue = this.courseForm.value;
    const courseData: Course = {
      code: formValue.code,
      name: formValue.name,
      description: formValue.description,
      duration: formValue.duration,
      fees: formValue.fees,
      curriculum: formValue.curriculum,
      prerequisites: formValue.prerequisitesString
        ? formValue.prerequisitesString.split('\n').map((p: string) => p.trim()).filter((p: string) => p)
        : [],
      isActive: formValue.isActive
    };

    if (this.isEditMode && this.courseId) {
      // Update existing course
      this.courseService.updateCourse(this.courseId, courseData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Course updated successfully'
          });
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update course'
          });
          this.loading = false;
        }
      });
    } else {
      // Create new course
      this.courseService.createCourse(courseData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Course created successfully'
          });
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create course'
          });
          this.loading = false;
        }
      });
    }
  }

 cancel(): void {
  if (this.isEditMode) {
    this.router.navigate(['/courses', this.courseId]);
  } else {
    this.router.navigate(['/courses']);
  }
}


  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }
}
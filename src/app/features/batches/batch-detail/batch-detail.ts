import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Batch } from '../../../core/models/batch.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { BatchService } from '../../../core/services/batch.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { SharedModule } from '../../../shared/shared.module';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-batch-detail',
  imports: [CommonModule, RouterLink,SharedModule, TagModule, ProgressBarModule],
  templateUrl: './batch-detail.html',
  styleUrl: './batch-detail.css',
})
export class BatchDetail implements OnInit {
  loading = false;
  batch: Batch | null = null;
  batchId: string = '';
  enrolledStudents: Enrollment[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private batchService: BatchService,
    private enrollmentService: EnrollmentService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.batchId = params['id'];
        this.loadBatch(this.batchId);
        this.loadEnrolledStudents(this.batchId);
      }
    });
  }

  loadBatch(id: string): void {
    this.loading = true;
    this.batchService.getBatch(id).subscribe({
      next: (batch) => {
        this.batch = batch;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading batch:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load batch details'
        });
        this.router.navigate(['/dashboard/batches']);
      }
    });
  }

  loadEnrolledStudents(batchId: string): void {
    this.enrollmentService.getEnrollments({ batch: batchId }).subscribe({
      next: (response) => {
        this.enrolledStudents = response.data || [];
      },
      error: (error) => {
        console.error('Error loading enrolled students:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/batches']);
  }
get batchStatus(): string | undefined {
  return this.batch?.status ?? undefined;
}

getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
  if (!status) return 'contrast';
  switch (status) {
    case 'ongoing': return 'success';
    case 'upcoming': return 'info';
    case 'completed': return 'secondary';
    case 'cancelled': return 'danger';
    default: return 'contrast';
  }
}
}
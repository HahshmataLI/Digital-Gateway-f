import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { LeadsService } from '../../../../../../../../../../core/services/leads.service';
import { Lead, LeadStatus, AddFollowUpRequest } from '../../../../../../../../../../core/models/lead.model';
import { UserRole } from '../../../../../../../../../../core/models/user.model';
import { AuthService } from '../../../../../../../../../../core/services/auth.service';
import { SharedModule } from '../../../../../../../../../../shared/shared.module';
import { ProgressSpinner } from "primeng/progressspinner";
import { DatePicker } from "primeng/datepicker";
@Component({
  selector: 'app-lead-detail',
  imports: [CommonModule, TagModule,RouterLink, TimelineModule, FormsModule, SharedModule, ProgressSpinner, DatePicker],
  templateUrl: './lead-detail.html',
  styleUrl: './lead-detail.css',
})
export class LeadDetail  implements OnInit  {
  lead: Lead | null = null;
  loading = true;
  
  // Follow-up dialog
  showFollowUpDialog = false;
  followUpData: AddFollowUpRequest = {
    note: '',  // Changed from 'notes' to 'note' to match backend
    nextFollowUpDate: new Date()
  };
  
  // Status options with labels
  statusOptions = [
    { label: 'New', value: LeadStatus.NEW },
    { label: 'Contacted', value: LeadStatus.CONTACTED },
    { label: 'Follow-up', value: LeadStatus.FOLLOW_UP },
    { label: 'Converted', value: LeadStatus.CONVERTED },
    { label: 'Closed', value: LeadStatus.CLOSED }
  ];
  
  newStatus: LeadStatus = LeadStatus.NEW;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadsService: LeadsService,
    private authService: AuthService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadLead(params['id']);
      }
    });
  }

  loadLead(id: string): void {
    this.loading = true;
    this.leadsService.getLead(id).subscribe({
      next: (lead) => {
        this.lead = lead;
        this.newStatus = lead.status;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading lead:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load lead details',
          life: 3000
        });
        this.cdr.detectChanges()
        this.router.navigate(['/dashboard/leads']);
      }
    });
  }

  getStatusSeverity(status: LeadStatus): any {
    switch (status) {
      case LeadStatus.NEW: return 'info';
      case LeadStatus.CONTACTED: return 'warning';
      case LeadStatus.FOLLOW_UP: return 'help';
      case LeadStatus.CONVERTED: return 'success';
      case LeadStatus.CLOSED: return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: LeadStatus): string {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  updateStatus(): void {
    if (!this.lead?._id) return;

    this.leadsService.updateLeadStatus(this.lead._id, this.newStatus)
      .subscribe({
        next: (updatedLead) => {
          this.lead = updatedLead;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Status updated successfully',
            life: 3000
          });
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update status',
            life: 3000
          });
        }
      });
  }

  openFollowUpDialog(): void {
    this.followUpData = {
      note: '',
      nextFollowUpDate: new Date()
    };
    this.showFollowUpDialog = true;
  }

  addFollowUp(): void {
    if (!this.lead?._id) return;

    this.leadsService.addFollowUp(this.lead._id, this.followUpData)
      .subscribe({
        next: (updatedLead) => {
          this.lead = updatedLead;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Follow-up added successfully',
            life: 3000
          });
          this.showFollowUpDialog = false;
        },
        error: (error) => {
          console.error('Error adding follow-up:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to add follow-up',
            life: 3000
          });
        }
      });
  }

  getFollowUpEvents() {
    if (!this.lead?.followUps || this.lead.followUps.length === 0) return [];
    
    return this.lead.followUps.map(followUp => ({
      status: followUp.nextFollowUpDate ? 'Scheduled' : 'Completed',
      date: followUp.date || new Date(),
      nextDate: followUp.nextFollowUpDate,
      icon: followUp.nextFollowUpDate ? 'pi pi-calendar' : 'pi pi-check-circle',
      color: followUp.nextFollowUpDate ? '#3B82F6' : '#10B981',
      note: followUp.note
    }));
  }

  isAdminOrCounselor(): boolean {
    return this.authService.hasRole([UserRole.ADMIN, UserRole.COUNSELOR]);
  }
}
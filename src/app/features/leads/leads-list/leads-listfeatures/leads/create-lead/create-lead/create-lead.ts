import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,  ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';



import { MessageService } from 'primeng/api';
import { LeadsService } from '../../../../../../../core/services/leads.service';
import { LeadSource, LeadStatus } from '../../../../../../../core/models/lead.model';
import { SharedModule } from '../../../../../../../shared/shared.module';
import { ProgressSpinner } from "primeng/progressspinner";

@Component({
  selector: 'app-create-lead',
  imports: [SharedModule,RouterLink, ReactiveFormsModule, CommonModule, ProgressSpinner],
  templateUrl: './create-lead.html',
  styleUrl: './create-lead.css',
})
export class  CreateLead  implements OnInit {
  leadForm: FormGroup;
  loading = false;
  isEditMode = false;
  leadId: string | null = null;
  
  sourceOptions = [
    { label: 'Website', value: LeadSource.WEBSITE },
    { label: 'WhatsApp', value: LeadSource.WHATSAPP },
    { label: 'Walk-in', value: LeadSource.WALK_IN },
    { label: 'Referral', value: LeadSource.REFERRAL }
  ];

  constructor(
    private fb: FormBuilder,
    private leadsService: LeadsService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.leadForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      source: [LeadSource.WEBSITE, Validators.required],
      notes: [''],
      status: [LeadStatus.NEW] // Add status field for edit mode
    });
  }

ngOnInit(): void {
  // Check if we're in edit mode
  this.route.params.subscribe(params => {
    const leadId = params['id'];
    if (leadId) {
      this.isEditMode = true;
      this.leadId = leadId;
      this.loadLeadForEdit(leadId);
    }
  });
}

  loadLeadForEdit(id: string): void {
  this.loading = true;
  this.leadsService.getLead(id).subscribe({
      next: (lead) => {
        this.leadForm.patchValue({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          notes: lead.notes || '',
          status: lead.status
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading lead:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load lead data',
          life: 3000
        });
        this.router.navigate(['/dashboard/leads']);
      }
    });
  }

  get formControls() {
    return this.leadForm.controls;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Lead' : 'Add New Lead';
  }

  get submitButtonLabel(): string {
    return this.isEditMode ? 'Update Lead' : 'Create Lead';
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      this.markFormGroupTouched(this.leadForm);
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.leadId) {
      // Update existing lead
      this.leadsService.updateLead(this.leadId, this.leadForm.value).subscribe({
        next: (updatedLead) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Lead "${updatedLead.name}" updated successfully`,
            life: 3000
          });
          
          setTimeout(() => {
            this.router.navigate(['/dashboard/leads', updatedLead._id]);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating lead:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update lead',
            life: 3000
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // Create new lead
      this.leadsService.createLead(this.leadForm.value).subscribe({
        next: (createdLead) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Lead "${createdLead.name}" created successfully`,
            life: 3000
          });
          
          setTimeout(() => {
            this.router.navigate(['/dashboard/leads']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating lead:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create lead',
            life: 3000
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
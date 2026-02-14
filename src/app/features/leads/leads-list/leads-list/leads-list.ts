import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LeadsService } from '../../../../core/services/leads.service';
import { Lead, LeadStatus, LeadSource } from '../../../../core/models/lead.model';
import { UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProgressSpinner } from "primeng/progressspinner";
import { SplitButtonModule } from 'primeng/splitbutton';
import { debounceTime } from 'rxjs';
@Component({
  selector: 'app-leads-list',
  imports: [
    CommonModule,
    SplitButtonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    InputTextModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    ProgressSpinner
],
  templateUrl: './leads-list.html',
  styleUrl: './leads-list.css',
  providers: [ConfirmationService]
})
export class LeadsList  implements OnInit {
  leads: Lead[] = [];
  loading = true;
  selectedLeads: Lead[] = [];
  
  // Form for filters
  filterForm: FormGroup;
  
  // Status options
  statusOptions = [
    { label: 'New', value: LeadStatus.NEW },
    { label: 'Contacted', value: LeadStatus.CONTACTED },
    { label: 'Follow-up', value: LeadStatus.FOLLOW_UP },
    { label: 'Converted', value: LeadStatus.CONVERTED },
    { label: 'Closed', value: LeadStatus.CLOSED }
  ];
  
  // Source options
  sourceOptions = [
    { label: 'Website', value: LeadSource.WEBSITE },
    { label: 'WhatsApp', value: LeadSource.WHATSAPP },
    { label: 'Walk-in', value: LeadSource.WALK_IN },
    { label: 'Referral', value: LeadSource.REFERRAL }
  ];
  
  // Pagination
  totalLeads = 0;
  currentPage = 1;
  rowsPerPage = 10;
  totalPages = 0;
  
  // Dialog
  showStatusDialog = false;
  selectedLeadForStatus: Lead | null = null;
  newStatus: LeadStatus = LeadStatus.NEW;

  constructor(
    private leadsService: LeadsService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      source: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadLeads();
    
    // Subscribe to form changes
    this.filterForm.valueChanges
  .pipe(debounceTime(300))  // wait 300ms after user stops typing
  .subscribe(() => {
    this.currentPage = 1;
    this.loadLeads();
  });
  }

 loadLeads(): void {
  this.loading = true; // ✅ only here, not elsewhere
  const filters = {
    status: this.filterForm.get('status')?.value,
    source: this.filterForm.get('source')?.value,
    search: this.filterForm.get('search')?.value
  };

  this.leadsService.getLeads(this.currentPage, this.rowsPerPage, filters)
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.leads = response.data;
          this.totalLeads = response.total;
          this.totalPages = response.totalPages;
        }
        this.loading = false;
         this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
         this.cdr.detectChanges();
      }
    });
}


  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.rowsPerPage = event.rows;
    this.loadLeads();
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

  getSourceLabel(source: LeadSource): string {
    return source.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  openStatusDialog(lead: Lead): void {
    this.selectedLeadForStatus = lead;
    this.newStatus = lead.status;
    this.showStatusDialog = true;
  }

  updateLeadStatus(): void {
    if (!this.selectedLeadForStatus?._id) return;

    this.leadsService.updateLeadStatus(this.selectedLeadForStatus._id, this.newStatus)
      .subscribe({
        next: (updatedLead) => {
          const index = this.leads.findIndex(l => l._id === updatedLead._id);
          if (index !== -1) {
            this.leads[index] = updatedLead;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Lead status updated',
            life: 3000
          });
          this.showStatusDialog = false;
          this.selectedLeadForStatus = null;
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

  deleteLead(lead: Lead): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${lead.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (lead._id) {
          this.leadsService.deleteLead(lead._id).subscribe({
            next: () => {
              this.leads = this.leads.filter(l => l._id !== lead._id);
              this.totalLeads--;
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Lead deleted successfully',
                life: 3000
              });
            },
            error: (error) => {
              console.error('Error deleting lead:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.error?.message || 'Failed to delete lead',
                life: 3000
              });
            }
          });
        }
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      source: '',
      search: ''
    });
  }

  // get filteredLeads(): Lead[] {
  //   const searchTerm = this.filterForm.get('search')?.value?.toLowerCase() || '';
    
  //   if (!searchTerm) {
  //     return this.leads;
  //   }
    
  //   return this.leads.filter(lead => 
  //     lead.name.toLowerCase().includes(searchTerm) ||
  //     lead.email.toLowerCase().includes(searchTerm) ||
  //     lead.phone.includes(searchTerm) ||
  //     (lead.notes && lead.notes.toLowerCase().includes(searchTerm))
  //   );
  // }

  isAdmin(): boolean {
    return this.authService.hasRole([UserRole.ADMIN]);
  }

  navigateToDetail(lead: Lead): void {
    if (lead._id) {
      this.router.navigate(['/dashboard/leads', lead._id]);
    }
  }
}
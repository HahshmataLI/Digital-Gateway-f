import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { TitleCase } from './pipes/titlecase.pipe';

// PrimeNG modules we'll use frequently
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { AvatarModule } from 'primeng/avatar';
import { InputNumberModule } from 'primeng/inputnumber';
// import { InputTextareaModule } from 'primeng/inputtextarea';
// import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MultiSelectModule } from 'primeng/multiselect';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    TagModule,
    MultiSelectModule,
    ProgressBarModule,
    AvatarModule,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    SelectModule,
    TableModule,
    ProgressSpinnerModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    ToolbarModule,
  
  ],
  exports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    AvatarModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    ProgressSpinnerModule,
    DatePickerModule,

    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    ToolbarModule,
    ProgressBarModule,
   CheckboxModule,
   TagModule
    // TitleCasePipe
  ]
})
export class SharedModule {}
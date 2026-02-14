import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-root',
  imports: [ RouterOutlet,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [MessageService]
})
export class App {
  protected readonly title = signal('digital-gateway-crm');
}

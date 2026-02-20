import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Receipts } from '../../../../core/models/payment.model';
import { PaymentService } from '../../../../core/services/payment.service';
import { SharedModule } from '../../../../shared/shared.module';
import { ChangeDetectorRef } from '@angular/core';
import { PdfService } from '../../../../core/services/pdf.service';
import { PrintReceipt } from '../print-receipt/print-receipt';

@Component({
  selector: 'app-receipt',
  imports: [CommonModule, SharedModule,PrintReceipt],
  templateUrl: './receipt.html',
  styleUrl: './receipt.css',
})

export class Receipt implements OnInit {
  @ViewChild('printSection') printSection!: ElementRef;
  
  loading = false;
  downloading = false;
  receipt: Receipts | null = null;
  paymentId: string = '';
  pdfProgress = 0;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private pdfService: PdfService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.paymentId = params['id'];
        this.loadReceipt(this.paymentId);
      }
    });
  }

  loadReceipt(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.paymentService.generateReceipt(id).subscribe({
      next: (receipt) => {
        console.log('Receipt loaded:', receipt);
        this.receipt = receipt;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading receipt:', error);
        this.errorMessage = 'Failed to generate receipt. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate receipt. Please try again.'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Print receipt with proper formatting
   */
  printReceipt(): void {
    if (!this.receipt) return;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print receipt');
      return;
    }

    // Get the print HTML
    const printContent = this.getPrintHTML();
    
    // Write to print window
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }

  /**
   * Generate print HTML for receipt
   */
  private getPrintHTML(): string {
    if (!this.receipt) return '';

    const date = new Date(this.receipt.date).toLocaleDateString();
    const generatedDate = new Date(this.receipt.timestamp).toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${this.receipt.receiptNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm;
          }
          
          body {
            font-family: 'Courier New', Courier, monospace;
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          
          .institute {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          
          .tagline {
            font-size: 14px;
            color: #666;
            margin: 5px 0;
          }
          
          .title {
            font-size: 20px;
            font-weight: bold;
            background: #f0f0f0;
            display: inline-block;
            padding: 5px 20px;
            margin-top: 10px;
          }
          
          .info-box {
            margin: 20px 0;
            border: 1px solid #ddd;
            padding: 15px;
            background: #f9f9f9;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px dotted #ccc;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .label {
            font-weight: bold;
            width: 120px;
          }
          
          .section {
            margin: 25px 0;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 16px;
            background: #333;
            color: white;
            padding: 5px 10px;
            margin-bottom: 15px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          td {
            padding: 8px 5px;
            border-bottom: 1px dotted #ccc;
          }
          
          td.label {
            font-weight: bold;
            width: 120px;
          }
          
          .amount {
            font-size: 18px;
            font-weight: bold;
            color: #2e7d32;
          }
          
          .amount-words {
            margin: 25px 0;
            padding: 15px;
            background: #f5f5f5;
            border-left: 4px solid #333;
            font-style: italic;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
          }
          
          .footer-text {
            font-size: 12px;
            color: #666;
          }
          
          .generated {
            font-size: 11px;
            color: #999;
            margin: 10px 0 30px;
          }
          
          .signatures {
            display: flex;
            justify-content: space-around;
            margin: 40px 0 20px;
          }
          
          .signature-line {
            text-align: center;
            width: 200px;
          }
          
          .line {
            border-top: 1px solid #333;
            margin-bottom: 5px;
          }
          
          .signature-label {
            font-size: 12px;
            color: #666;
          }
          
          .thank-you {
            font-size: 14px;
            font-weight: bold;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="institute">Digital Gateway</div>
            <div class="tagline">Training Institute</div>
            <div class="title">PAYMENT RECEIPT</div>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="label">Receipt No:</span>
              <span>${this.receipt.receiptNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span>${date}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment No:</span>
              <span>${this.receipt.paymentNumber}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">STUDENT DETAILS</div>
            <table>
              <tr>
                <td class="label">Name:</td>
                <td>${this.receipt.student.name}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td>${this.receipt.student.email}</td>
              </tr>
              <tr>
                <td class="label">Phone:</td>
                <td>${this.receipt.student.phone}</td>
              </tr>
              ${this.receipt.student.address ? `
              <tr>
                <td class="label">Address:</td>
                <td>${this.receipt.student.address}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div class="section">
            <div class="section-title">COURSE DETAILS</div>
            <table>
              <tr>
                <td class="label">Course Name:</td>
                <td>${this.receipt.course.name}</td>
              </tr>
              <tr>
                <td class="label">Course Code:</td>
                <td>${this.receipt.course.code}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">PAYMENT DETAILS</div>
            <table>
              <tr>
                <td class="label">Payment Mode:</td>
                <td>${this.receipt.paymentMode}</td>
              </tr>
              ${this.receipt.transactionReference ? `
              <tr>
                <td class="label">Transaction Ref:</td>
                <td>${this.receipt.transactionReference}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="label">Amount Paid:</td>
                <td class="amount">Rs ${this.receipt.amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="amount-words">
            <div style="font-weight: bold; margin-bottom: 5px;">Amount in Words:</div>
            <div>${this.receipt.amountInWords}</div>
          </div>

          <div class="footer">
            <div class="footer-text">This is a computer generated receipt. No signature required.</div>
            <div class="generated">Generated on: ${generatedDate}</div>
            
            <div class="signatures">
              <div class="signature-line">
                <div class="line"></div>
                <div class="signature-label">Authorized Signatory</div>
              </div>
              <div class="signature-line">
                <div class="line"></div>
                <div class="signature-label">Student Signature</div>
              </div>
            </div>
            
            <div class="thank-you">Thank you for choosing Digital Gateway!</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Download PDF with proper receipt formatting
   */
  async downloadPDF(): Promise<void> {
    if (!this.receipt) return;

    this.downloading = true;
    this.pdfProgress = 0;
    this.cdr.detectChanges();

    const interval = setInterval(() => {
      if (this.pdfProgress < 90) {
        this.pdfProgress += 10;
        this.cdr.detectChanges();
      }
    }, 200);

    try {
      // Create a hidden iframe with the print content
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(this.getPrintHTML());
        iframeDoc.close();

        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Print to PDF
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }

      clearInterval(interval);
      this.pdfProgress = 100;
      this.cdr.detectChanges();

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'PDF generated successfully'
      });

    } catch (error) {
      clearInterval(interval);
      console.error('PDF generation error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate PDF. Please use Print instead.'
      });
    } finally {
      setTimeout(() => {
        this.downloading = false;
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  /**
   * Share receipt info
   */
  shareReceipt(): void {
    if (!this.receipt) return;

    const shareText = `Digital Gateway Receipt
Receipt #: ${this.receipt.receiptNumber}
Date: ${new Date(this.receipt.date).toLocaleDateString()}
Student: ${this.receipt.student.name}
Course: ${this.receipt.course.name}
Amount: Rs ${this.receipt.amount}`;

    if (navigator.share) {
      navigator.share({
        title: 'Payment Receipt',
        text: shareText,
      }).catch(() => {
        this.copyToClipboard(shareText);
      });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Receipt info copied to clipboard'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy to clipboard'
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/payments', this.paymentId]);
  }

  getPaymentModeIcon(mode: string): string {
    switch (mode) {
      case 'cash': return 'pi pi-money-bill';
      case 'card': return 'pi pi-credit-card';
      case 'upi': return 'pi pi-mobile';
      case 'bank_transfer': return 'pi pi-building';
      case 'cheque': return 'pi pi-file';
      default: return 'pi pi-money-bill';
    }
  }

  retry(): void {
    this.loadReceipt(this.paymentId);
  }
}

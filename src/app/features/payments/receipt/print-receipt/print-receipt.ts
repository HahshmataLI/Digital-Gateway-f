import { Component, Input } from '@angular/core';
import { Receipts } from '../../../../core/models/payment.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-print-receipt',
  imports: [CommonModule],
  templateUrl: './print-receipt.html',
  styleUrl: './print-receipt.css',
})
export class PrintReceipt   {
  private _receipt: Receipts | null = null;

  @Input() 
  set receipt(value: Receipts | null) {
    this._receipt = value;
  }

  get receipt(): Receipts {
    if (!this._receipt) {
      throw new Error('Receipt is required for PrintReceiptComponent');
    }
    return this._receipt;
  }
}
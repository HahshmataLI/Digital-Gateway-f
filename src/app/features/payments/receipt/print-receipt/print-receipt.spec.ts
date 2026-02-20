import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintReceipt } from './print-receipt';

describe('PrintReceipt', () => {
  let component: PrintReceipt;
  let fixture: ComponentFixture<PrintReceipt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintReceipt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintReceipt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

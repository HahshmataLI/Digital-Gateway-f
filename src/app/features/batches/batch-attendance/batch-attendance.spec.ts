import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAttendance } from './batch-attendance';

describe('BatchAttendance', () => {
  let component: BatchAttendance;
  let fixture: ComponentFixture<BatchAttendance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchAttendance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchAttendance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

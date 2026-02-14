import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchDetail } from './batch-detail';

describe('BatchDetail', () => {
  let component: BatchDetail;
  let fixture: ComponentFixture<BatchDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

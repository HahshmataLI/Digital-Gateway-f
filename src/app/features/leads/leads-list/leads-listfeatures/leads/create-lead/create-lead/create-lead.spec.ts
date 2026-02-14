import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLead } from './create-lead';

describe('CreateLead', () => {
  let component: CreateLead;
  let fixture: ComponentFixture<CreateLead>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLead]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLead);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

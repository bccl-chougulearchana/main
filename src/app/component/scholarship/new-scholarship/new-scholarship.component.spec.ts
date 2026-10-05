import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewScholarshipComponent } from './new-scholarship.component';

describe('NewScholarshipComponent', () => {
  let component: NewScholarshipComponent;
  let fixture: ComponentFixture<NewScholarshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewScholarshipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewScholarshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

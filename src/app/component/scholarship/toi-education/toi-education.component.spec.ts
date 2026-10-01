import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToiEducationComponent } from './toi-education.component';

describe('ToiEducationComponent', () => {
  let component: ToiEducationComponent;
  let fixture: ComponentFixture<ToiEducationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToiEducationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToiEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

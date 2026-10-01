import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeConnectComponent } from './employee-connect.component';

describe('EmployeeConnectComponent', () => {
  let component: EmployeeConnectComponent;
  let fixture: ComponentFixture<EmployeeConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeConnectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

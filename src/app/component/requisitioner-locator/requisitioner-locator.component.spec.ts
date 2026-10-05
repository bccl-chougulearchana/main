import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitionerLocatorComponent } from './requisitioner-locator.component';

describe('RequisitionerLocatorComponent', () => {
  let component: RequisitionerLocatorComponent;
  let fixture: ComponentFixture<RequisitionerLocatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequisitionerLocatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequisitionerLocatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

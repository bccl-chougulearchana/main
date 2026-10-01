import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalControlsComponent } from './operational-controls.component';

describe('OperationalControlsComponent', () => {
  let component: OperationalControlsComponent;
  let fixture: ComponentFixture<OperationalControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationalControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

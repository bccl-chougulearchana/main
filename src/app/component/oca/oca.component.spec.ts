import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcaComponent } from './oca.component';

describe('OcaComponent', () => {
  let component: OcaComponent;
  let fixture: ComponentFixture<OcaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OcaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

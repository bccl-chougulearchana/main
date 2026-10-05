import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesSocietyAccountComponent } from './times-society-account.component';

describe('TimesSocietyAccountComponent', () => {
  let component: TimesSocietyAccountComponent;
  let fixture: ComponentFixture<TimesSocietyAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesSocietyAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesSocietyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

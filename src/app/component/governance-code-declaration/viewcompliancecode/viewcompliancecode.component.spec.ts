import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewcompliancecodeComponent } from './viewcompliancecode.component';

describe('ViewcompliancecodeComponent', () => {
  let component: ViewcompliancecodeComponent;
  let fixture: ComponentFixture<ViewcompliancecodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewcompliancecodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewcompliancecodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

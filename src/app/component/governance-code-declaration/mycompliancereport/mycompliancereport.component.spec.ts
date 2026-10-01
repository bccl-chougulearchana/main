import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MycompliancereportComponent } from './mycompliancereport.component';

describe('MycompliancereportComponent', () => {
  let component: MycompliancereportComponent;
  let fixture: ComponentFixture<MycompliancereportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MycompliancereportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MycompliancereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

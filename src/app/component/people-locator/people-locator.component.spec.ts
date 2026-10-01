import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleLocatorComponent } from './people-locator.component';

describe('PeopleLocatorComponent', () => {
  let component: PeopleLocatorComponent;
  let fixture: ComponentFixture<PeopleLocatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeopleLocatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleLocatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

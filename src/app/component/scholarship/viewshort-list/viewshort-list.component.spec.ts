import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewshortListComponent } from './viewshort-list.component';

describe('ViewshortListComponent', () => {
  let component: ViewshortListComponent;
  let fixture: ComponentFixture<ViewshortListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewshortListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewshortListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

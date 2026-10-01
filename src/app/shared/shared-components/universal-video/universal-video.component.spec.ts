import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversalVideoComponent } from './universal-video.component';

describe('UniversalVideoComponent', () => {
  let component: UniversalVideoComponent;
  let fixture: ComponentFixture<UniversalVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniversalVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniversalVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

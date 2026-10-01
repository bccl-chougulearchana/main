import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorpConnectCarouselComponent } from './corp-connect-carousel.component';

describe('CorpConnectCarouselComponent', () => {
  let component: CorpConnectCarouselComponent;
  let fixture: ComponentFixture<CorpConnectCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorpConnectCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorpConnectCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

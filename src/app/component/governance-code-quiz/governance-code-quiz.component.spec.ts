import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernanceCodeQuizComponent } from './governance-code-quiz.component';

describe('GovernanceCodeQuizComponent', () => {
  let component: GovernanceCodeQuizComponent;
  let fixture: ComponentFixture<GovernanceCodeQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovernanceCodeQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GovernanceCodeQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

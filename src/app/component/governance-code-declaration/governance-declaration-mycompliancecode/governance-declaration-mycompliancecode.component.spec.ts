import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernanceDeclarationMycompliancecodeComponent } from './governance-declaration-mycompliancecode.component';

describe('GovernanceDeclarationMycompliancecodeComponent', () => {
  let component: GovernanceDeclarationMycompliancecodeComponent;
  let fixture: ComponentFixture<GovernanceDeclarationMycompliancecodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GovernanceDeclarationMycompliancecodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GovernanceDeclarationMycompliancecodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

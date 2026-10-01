import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernanceCodeDeclarationComponent } from './governance-code-declaration.component';

describe('GovernanceCodeDeclarationComponent', () => {
  let component: GovernanceCodeDeclarationComponent;
  let fixture: ComponentFixture<GovernanceCodeDeclarationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GovernanceCodeDeclarationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GovernanceCodeDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

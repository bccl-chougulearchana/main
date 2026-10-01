import { TestBed } from '@angular/core/testing';

import { GovernanceCodeService } from './governance-code.service';

describe('GovernanceCodeService', () => {
  let service: GovernanceCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GovernanceCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

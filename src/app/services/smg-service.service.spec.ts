import { TestBed } from '@angular/core/testing';

import { SmgServiceService } from './smg-service.service';

describe('SmgServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SmgServiceService = TestBed.get(SmgServiceService);
    expect(service).toBeTruthy();
  });
});

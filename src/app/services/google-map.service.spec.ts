import { TestBed } from '@angular/core/testing';

import { GoogleMapService } from './google-map.service';

describe('GoogleMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoogleMapService = TestBed.get(GoogleMapService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { EngineServiceService } from './engine-service.service';

describe('EngineServiceService', () => {
  let service: EngineServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

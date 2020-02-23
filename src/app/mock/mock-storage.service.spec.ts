import { TestBed } from '@angular/core/testing';

import { MockStorageService } from './mock-storage.service';

describe('MockStorageService', () => {
  let service: MockStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { MockDbService } from './mock-db.service';

describe('MockDbService', () => {
  let service: MockDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

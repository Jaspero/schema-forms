import { TestBed } from '@angular/core/testing';

import { SeoEditorService } from './seo-editor.service';

describe('SeoEditorService', () => {
  let service: SeoEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

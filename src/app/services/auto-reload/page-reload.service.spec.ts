import { TestBed } from '@angular/core/testing';

import { PageReloadService } from './page-reload.service';

describe('PageReloadService', () => {
  let service: PageReloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageReloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ScrollToTopGuard } from './scroll-to-top.guard';

describe('ScrollToTopGuard', () => {
  let guard: ScrollToTopGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ScrollToTopGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

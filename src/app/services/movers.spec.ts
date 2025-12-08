import { TestBed } from '@angular/core/testing';

import { Movers } from './movers';

describe('Movers', () => {
  let service: Movers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Movers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

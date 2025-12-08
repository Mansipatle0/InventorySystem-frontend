import { TestBed } from '@angular/core/testing';

import { Cashier } from './cashier';

describe('Cashier', () => {
  let service: Cashier;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cashier);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

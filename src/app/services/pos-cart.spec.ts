import { TestBed } from '@angular/core/testing';

import { PosCart } from './pos-cart';

describe('PosCart', () => {
  let service: PosCart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosCart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

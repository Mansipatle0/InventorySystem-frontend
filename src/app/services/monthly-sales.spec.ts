import { TestBed } from '@angular/core/testing';

import { MonthlySales } from './monthly-sales';

describe('MonthlySales', () => {
  let service: MonthlySales;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlySales);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

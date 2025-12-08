import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySalesReport } from './daily-sales-report';

describe('DailySalesReport', () => {
  let component: DailySalesReport;
  let fixture: ComponentFixture<DailySalesReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailySalesReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailySalesReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

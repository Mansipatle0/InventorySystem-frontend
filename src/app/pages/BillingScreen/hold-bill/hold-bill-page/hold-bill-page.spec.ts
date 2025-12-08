import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldBillPage } from './hold-bill-page';

describe('HoldBillPage', () => {
  let component: HoldBillPage;
  let fixture: ComponentFixture<HoldBillPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldBillPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldBillPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecallBillPage } from './recall-bill-page';

describe('RecallBillPage', () => {
  let component: RecallBillPage;
  let fixture: ComponentFixture<RecallBillPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecallBillPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecallBillPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

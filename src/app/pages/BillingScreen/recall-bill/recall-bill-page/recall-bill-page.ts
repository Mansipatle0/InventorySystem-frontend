import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CashierService,
  HoldBillSummary,
  HoldBillDetail,
} from '../../../../services/cashier';
import {
  PosCartItem,
  PosCartService,
} from '../../../../services/pos-cart';

@Component({
  selector: 'app-recall-bill-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recall-bill-page.html',
  styleUrl: './recall-bill-page.css',
})
export class RecallBillPage implements OnInit {

  searchText = '';
  bills: HoldBillSummary[] = [];
  loading = false;

  constructor(
    private cashierService: CashierService,
    private cartService: PosCartService,
    private router: Router,
    private cdr: ChangeDetectorRef,     // ⭐ INSTANT UI REFRESH
    private zone: NgZone                // ⭐ Ensure Angular updates DOM
  ) {}

  ngOnInit(): void {
    this.loadHeldBills();
  }

  // ⭐ INSTANT TABLE LOAD FIX
  loadHeldBills(): void {
    this.loading = true;
    this.cdr.detectChanges(); // Instantly update "Loading..."

    this.cashierService.getHeldBills().subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.bills = Array.isArray(data) ? data : [];
          this.loading = false;
          this.cdr.detectChanges();  // ⭐ Immediately show table
        });
      },
      error: (err) => {
        console.error('Failed to load held bills for recall', err);
        alert('Failed to load held bills.');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredBills(): HoldBillSummary[] {
    const term = this.searchText.trim().toLowerCase();
    if (!term) return this.bills;

    return this.bills.filter(
      (b) =>
        b.holdCode.toLowerCase().includes(term) ||
        (b.customerName ?? '').toLowerCase().includes(term)
    );
  }

  // ⭐ RECALL BILL → Restore to POS and navigate
  recallToPos(bill: HoldBillSummary): void {
    this.cashierService.getHeldBill(bill.id).subscribe({
      next: (detail: HoldBillDetail) => {
        const items: PosCartItem[] = detail.items.map((it) => ({
          productId: it.productId,
          barcode: it.skuCode,
          name: it.productName,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          lineTotal: it.lineTotal,
        }));

        // Update POS cart
        this.cartService.setItems(items);
        this.cartService.setDiscountAmount(0);

        // ⭐ Ensure dashboard opens at POS tab
        localStorage.setItem('cashierActiveTab', 'POS');

        // Navigate to cashier dashboard
        this.router.navigate(['/cashier']);
      },
      error: (err) => {
        console.error('Failed to recall held bill', err);
        alert('Failed to recall held bill.');
      },
    });
  }
}

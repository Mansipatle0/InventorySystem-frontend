import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CashierService,
  HoldBillDetail,
  HoldBillRequest,
  HoldBillSummary,
} from '../../../../services/cashier';
import {
  PosCartItem,
  PosCartService,
} from '../../../../services/pos-cart';

@Component({
  selector: 'app-hold-bill-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hold-bill-page.html',
  styleUrl: './hold-bill-page.css',
})
export class HoldBillPage implements OnInit {
  searchText = '';
  heldBills: HoldBillSummary[] = [];
  loading = false;

  constructor(
    private cashierService: CashierService,
    private cartService: PosCartService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,       // ⭐ Added for instant UI update
    private zone: NgZone                  // ⭐ Ensures Angular refreshes UI
  ) {}

  ngOnInit(): void {
    this.loadHeldBills();
  }

  get filteredBills(): HoldBillSummary[] {
    const term = this.searchText.trim().toLowerCase();
    if (!term) return this.heldBills;

    return this.heldBills.filter(
      (b) =>
        b.holdCode.toLowerCase().includes(term) ||
        (b.customerName ?? '').toLowerCase().includes(term)
    );
  }

  // ⭐ INSTANT PAGE LOAD FIX
  loadHeldBills(): void {
    this.loading = true;
    this.cdr.detectChanges(); // refresh UI immediately

    this.cashierService.getHeldBills().subscribe({
      next: (bills) => {
        this.zone.run(() => {
          this.heldBills = bills || [];
          this.loading = false;
          this.cdr.detectChanges();  // ⭐ instantly display rows
        });
      },
      error: (err) => {
        console.error('❌ Failed to load held bills', err);
        alert('Failed to load held bills.');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ⭐ Hold current POS cart
  holdCurrentCart(): void {
    const cartState = this.cartService.getSnapshot();

    if (!cartState.items.length) {
      alert('Cart is empty. Please add items in POS first.');
      return;
    }

    const req: HoldBillRequest = {
      cartItems: cartState.items.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
        discountAmount: 0,
      })),
      customerName: 'Walk-in',
      customerPhone: '',
      note: 'Held from POS',
      cashierId: 1,
    };

    this.cashierService.createHoldBill(req).subscribe({
      next: (summary) => {
        alert(`Cart held successfully.\nHold Code: ${summary.holdCode}`);

        this.cartService.clearCart();
        this.loadHeldBills();
      },
      error: (err) => {
        console.error('❌ Failed to hold bill', err);

        const message =
          err?.error?.error ||
          err?.error?.message ||
          'Failed to hold the current cart.';

        alert(message);
      },
    });
  }

  // ⭐ RECALL BILL — restore to POS cart + navigate
  recallHeldBill(bill: HoldBillSummary): void {
    this.cashierService.getHeldBill(bill.id).subscribe({
      next: (detail) => {
        const items = detail.items.map((it) => ({
          productId: it.productId,
          barcode: it.skuCode,
          name: it.productName,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          lineTotal: it.lineTotal,
        }));

        this.cartService.setItems(items);
        this.cartService.setDiscountAmount(0);

        // Save active tab so cashier page opens at POS
        localStorage.setItem('cashierActiveTab', 'POS');

        // ⭐ navigate to cashier dashboard root
        this.router.navigate(['/cashier']);
      },
      error: (err) => {
        console.error('❌ Failed to recall held bill', err);
        alert('Failed to recall held bill.');
      },
    });
  }

  // ⭐ DELETE HELD BILL
  deleteHeldBill(bill: HoldBillSummary): void {
    if (!confirm(`Delete held bill ${bill.holdCode}?`)) return;

    this.cashierService.deleteHeldBill(bill.id).subscribe({
      next: () => {
        this.zone.run(() => {
          this.heldBills = this.heldBills.filter((x) => x.id !== bill.id);
          this.cdr.detectChanges(); // ⭐ instant table update
        });
      },
      error: (err) => {
        console.error('❌ Failed to delete held bill', err);
        alert('Failed to delete held bill.');
      },
    });
  }
}

import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { PosCartItem, PosCartService, PosCartState } from '../../../../services/pos-cart';
import { ProductDto, ProductService } from '../../../../services/product';
import { CashierService, SaleRequest, SaleResponse } from '../../../../services/cashier';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './pos-page.html',
  styleUrl: './pos-page.css',
})
export class PosPage implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('barcodeInput') barcodeInputRef!: ElementRef<HTMLInputElement>;

  cartItems: PosCartItem[] = [];
  subtotal = 0;
  taxPercent = 0;
  taxAmount = 0;
  discountAmount = 0;
  grandTotal = 0;

  isSubmitting = false;
  private cartSub?: Subscription;

  constructor(
    private productService: ProductService,
    private cashierService: CashierService,
    private cartService: PosCartService,
    private cdr: ChangeDetectorRef,       // ⭐ For instant UI load
    private zone: NgZone                  // ⭐ Ensures Angular runs CD cycle
  ) {}

  ngOnInit(): void {
    // ⭐ INSTANT UI LOAD FIX: force UI to paint immediately
    this.cdr.detectChanges();

    this.cartSub = this.cartService.cart$.subscribe(
      (state: PosCartState) => {
        this.zone.run(() => {
          this.cartItems = state.items;
          this.subtotal = state.subtotal;
          this.taxPercent = state.taxPercent;
          this.taxAmount = state.taxAmount;
          this.discountAmount = state.discountAmount;
          this.grandTotal = state.grandTotal;
          this.cdr.detectChanges();      // ⭐ instant table refresh
        });
      }
    );
  }

  ngAfterViewInit() {
    setTimeout(() => this.focusBarcodeInput(), 10);  // ⭐ immediate focus after render
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  focusBarcodeInput() {
    if (this.barcodeInputRef) {
      this.barcodeInputRef.nativeElement.focus();
    }
  }

  onBarcodeEnter(barcode: string) {
    const trimmed = barcode.trim();
    if (!trimmed) {
      this.focusBarcodeInput();
      return;
    }

    this.productService.getByCode(trimmed).subscribe({
      next: (product: ProductDto) => {
        const codeToShow = product.barcode || product.skuCode;

        this.cartService.addOrIncreaseItem(
          product.id,
          codeToShow ?? '',
          product.name,
          product.sellingPrice
        );

        this.clearBarcodeInput();
      },
      error: (err) => {
        const message =
          err?.error?.error ||
          err?.error?.message ||
          `Product not found for code: ${trimmed}`;

        alert(message);
        this.clearBarcodeInput();
      },
    });
  }

  clearBarcodeInput() {
    if (this.barcodeInputRef) {
      this.barcodeInputRef.nativeElement.value = '';
      this.focusBarcodeInput(); // keep cursor active for next scan
    }
  }

  onQuantityChange(item: PosCartItem, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (isNaN(value) || value <= 0) value = 1;

    this.cartService.updateQuantity(item.productId, value);
  }

  removeItem(item: PosCartItem) {
    this.cartService.removeItem(item.productId);
  }

  clearCart() {
    if (!this.cartItems.length) return;

    const confirmClear = confirm('Clear the current cart?');
    if (!confirmClear) return;

    this.cartService.clearCart();
    this.focusBarcodeInput();
  }

  onDiscountChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (isNaN(value) || value < 0) value = 0;

    this.cartService.setDiscountAmount(value);
  }

  completeSale() {
    if (!this.cartItems.length) {
      alert('Cart is empty.');
      this.focusBarcodeInput();
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const payload: SaleRequest = {
      cartItems: this.cartItems.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
        discountAmount: 0,
      })),
      paymentMode: 'CASH',
      customerName: 'Walk-in',
      customerPhone: '',
      notes: '',
      cashierId: 1,
    };

    this.cashierService.createSale(payload).subscribe({
      next: (res: SaleResponse) => {
        alert(`Sale completed.\nBill No: ${res.billNumber}`);
        this.cartService.clearCart();
        this.isSubmitting = false;
        this.focusBarcodeInput();
      },
      error: (err) => {
        const message =
          err?.error?.error ||
          err?.error?.message ||
          'Failed to complete sale. Please try again.';

        alert(message);
        this.isSubmitting = false;
      },
    });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PosCartItem {
  productId: number;
  barcode: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PosCartState {
  items: PosCartItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class PosCartService {
  private state: PosCartState = {
    items: [],
    subtotal: 0,
    taxPercent: 0,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 0,
  };

  private readonly stateSubject = new BehaviorSubject<PosCartState>(
    this.cloneState()
  );

  // POS / Hold Bill components yahan subscribe kar sakte hain
  cart$: Observable<PosCartState> = this.stateSubject.asObservable();

  // Snapshot – direct read ke liye
  getSnapshot(): PosCartState {
    return this.cloneState();
  }

  // POS me add/increase item
  addOrIncreaseItem(
    productId: number,
    barcode: string,
    name: string,
    unitPrice: number
  ): void {
    const existing = this.state.items.find(
      (i) => i.productId === productId
    );

    if (!existing) {
      this.state.items.push({
        productId,
        barcode,
        name,
        unitPrice,
        quantity: 1,
        lineTotal: unitPrice,
      });
    } else {
      existing.quantity += 1;
      existing.lineTotal = existing.quantity * existing.unitPrice;
    }

    this.recalcAndEmit();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) quantity = 1;

    const item = this.state.items.find((i) => i.productId === productId);
    if (!item) return;

    item.quantity = quantity;
    item.lineTotal = item.quantity * item.unitPrice;

    this.recalcAndEmit();
  }

  removeItem(productId: number): void {
    this.state.items = this.state.items.filter(
      (i) => i.productId !== productId
    );
    this.recalcAndEmit();
  }

  clearCart(): void {
    this.state.items = [];
    this.state.discountAmount = 0;
    this.recalcAndEmit();
  }

  setDiscountAmount(amount: number): void {
    if (amount < 0) amount = 0;
    this.state.discountAmount = amount;
    this.recalcAndEmit();
  }

  setTaxPercent(percent: number): void {
    if (percent < 0) percent = 0;
    this.state.taxPercent = percent;
    this.recalcAndEmit();
  }

  // Recall hold bill -> cart set karne ke liye
  setItems(items: PosCartItem[]): void {
    this.state.items = items.map((i) => ({
      ...i,
      lineTotal: i.unitPrice * i.quantity,
    }));
    this.recalcAndEmit();
  }

  private recalcAndEmit(): void {
    const subtotal = this.state.items.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    this.state.subtotal = subtotal;
    this.state.taxAmount =
      (this.state.subtotal * this.state.taxPercent) / 100;
    this.state.grandTotal =
      this.state.subtotal + this.state.taxAmount - this.state.discountAmount;

    this.stateSubject.next(this.cloneState());
  }

  private cloneState(): PosCartState {
    return {
      ...this.state,
      items: this.state.items.map((i) => ({ ...i })),
    };
  }
}

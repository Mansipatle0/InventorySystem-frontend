import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

export interface SaleRequest {
  cartItems: CartItemRequest[];
  paymentMode: string;     // "CASH" | "CARD" | "UPI" | "OTHER"
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  cashierId?: number;
}

export interface SaleItemResponse {
  productId: number;
  productName: string;
  skuCode: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface SaleResponse {
  saleId: number;
  billNumber: string;
  saleDate: string;
  paymentMode: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  grandTotal: number;
  items: SaleItemResponse[];
}

// ---- Hold bill types ----

export interface HoldBillRequest {
  cartItems: CartItemRequest[];
  customerName?: string;
  customerPhone?: string;
  note?: string;
  cashierId?: number;
}

export interface HoldBillSummary {
  id: number;
  holdCode: string;
  createdAt: string;
  customerName?: string;
  estimatedTotal: number;
  itemsCount: number;
}

export interface HoldBillDetail {
  id: number;
  holdCode: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  estimatedTotal: number;
  items: SaleItemResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class CashierService {
  private readonly baseUrl = 'http://localhost:8080/api/cashier';

  // 🔥 SIMPLE CACHE FOR HELD BILLS
  private heldBillsCache: HoldBillSummary[] | null = null;
  private heldBillsLastFetched: number | null = null;
  private readonly CACHE_TTL_MS = 30_000; // 30 seconds

  // 🔥 SIMPLE CACHE FOR INVOICES (current session)
  private invoiceCache: SaleResponse[] = [];
  private readonly MAX_INVOICE_CACHE = 50;

  constructor(private http: HttpClient) {}

  // ----------------- Sales / Invoices -----------------

  createSale(request: SaleRequest): Observable<SaleResponse> {
    return this.http
      .post<SaleResponse>(`${this.baseUrl}/sales`, request)
      .pipe(tap(res => this.cacheInvoice(res)));
  }

  /** GET /api/cashier/sales/bill/{billNumber} */
  getSaleByBillNumber(billNumber: string): Observable<SaleResponse> {
    return this.http
      .get<SaleResponse>(
        `${this.baseUrl}/sales/bill/${encodeURIComponent(billNumber)}`
      )
      .pipe(tap(res => this.cacheInvoice(res)));
  }

  // ----- Invoice cache helpers (frontend only) -----

  /** Store invoice in cache (latest first) */
  private cacheInvoice(inv: SaleResponse | null | undefined): void {
    if (!inv || !inv.billNumber) return;

    // remove existing same billNumber
    const existingIndex = this.invoiceCache.findIndex(
      i => i.billNumber === inv.billNumber
    );
    if (existingIndex >= 0) {
      this.invoiceCache.splice(existingIndex, 1);
    }

    // add to top
    this.invoiceCache.unshift(inv);

    // limit cache size
    if (this.invoiceCache.length > this.MAX_INVOICE_CACHE) {
      this.invoiceCache.pop();
    }
  }

  /** Return all cached invoices (for InvoicePage list) */
  getCachedInvoices(): SaleResponse[] {
    return this.invoiceCache;
  }

  /** Return 1 cached invoice (for view/print) */
  getCachedInvoiceByBill(billNumber: string): SaleResponse | undefined {
    return this.invoiceCache.find(i => i.billNumber === billNumber);
  }

  // ----------------- Hold Bills -----------------

  createHoldBill(req: HoldBillRequest): Observable<HoldBillSummary> {
    // new hold bill banega, to purana cache invalid
    this.clearHeldBillsCache();
    return this.http.post<HoldBillSummary>(`${this.baseUrl}/hold-bills`, req);
  }

  /**
   * Get all held bills.
   * - Pehli baar: server se call + cache me save
   * - Next time (30 sec ke andar): cache se instant return
   */
  getHeldBills(useCache: boolean = true): Observable<HoldBillSummary[]> {
    const now = Date.now();

    if (
      useCache &&
      this.heldBillsCache &&
      this.heldBillsLastFetched &&
      now - this.heldBillsLastFetched < this.CACHE_TTL_MS
    ) {
      // ✅ Cache fresh hai – direct return
      return of(this.heldBillsCache);
    }

    // ❌ Cache empty ya expire – server se fetch
    return this.http
      .get<HoldBillSummary[]>(`${this.baseUrl}/hold-bills`)
      .pipe(
        tap((bills) => {
          this.heldBillsCache = bills;
          this.heldBillsLastFetched = Date.now();
        })
      );
  }

  getHeldBill(id: number): Observable<HoldBillDetail> {
    return this.http.get<HoldBillDetail>(`${this.baseUrl}/hold-bills/${id}`);
  }

  deleteHeldBill(id: number): Observable<void> {
    // delete hua to cache invalid
    this.clearHeldBillsCache();
    return this.http.delete<void>(`${this.baseUrl}/hold-bills/${id}`);
  }

  // ----------------- Cache helpers -----------------

  clearHeldBillsCache(): void {
    this.heldBillsCache = null;
    this.heldBillsLastFetched = null;
  }
}

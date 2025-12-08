import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CashierService, SaleResponse } from '../../../../services/cashier';

interface Invoice {
  id: string;
  date: Date;
  customerName: string;
  totalAmount: number;
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'OTHER';
}

@Component({
  selector: 'app-invoice-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-page.html',
  styleUrl: './invoice-page.css',
})
export class InvoicePage implements OnInit {
  searchText = '';
  invoices: Invoice[] = [];
  loading = false;

  constructor(
    private cashierService: CashierService,
    private cdr: ChangeDetectorRef,     // ⭐ Needed for instant UI refresh
    private zone: NgZone                // ⭐ Ensures Angular detects changes
  ) {}

  ngOnInit(): void {
    this.loadCachedInvoices();
  }

  loadCachedInvoices(): void {
    this.loading = true;
    this.cdr.detectChanges(); // ⭐ Immediately show loading

    const cached: SaleResponse[] = this.cashierService.getCachedInvoices();

    this.zone.run(() => {
      this.invoices = cached.map(res => ({
        id: res.billNumber,
        date: new Date(res.saleDate),
        customerName: res.customerName || 'Walk-in Customer',
        totalAmount: res.grandTotal,
        paymentMode: (res.paymentMode as any) || 'CASH'
      }));

      this.loading = false;
      this.cdr.detectChanges(); // ⭐ Instantly render invoice list
    });
  }

  get filteredInvoices(): Invoice[] {
    const term = this.searchText.trim().toLowerCase();
    if (!term) return this.invoices;

    return this.invoices.filter(
      inv =>
        inv.id.toLowerCase().includes(term) ||
        inv.customerName.toLowerCase().includes(term)
    );
  }

  viewInvoice(inv: Invoice): void {
    const cached = this.cashierService.getCachedInvoiceByBill(inv.id);

    if (cached) {
      const res = cached;
      const summary = `
Invoice: ${res.billNumber}
Date: ${res.saleDate}
Customer: ${res.customerName ?? 'Walk-in Customer'}
Payment: ${res.paymentMode}
Subtotal: ₹ ${res.subtotal}
Discount: ₹ ${res.totalDiscount}
Tax: ₹ ${res.taxAmount}
Grand Total: ₹ ${res.grandTotal}
`;
      alert(summary);
      return;
    }

    this.cashierService.getSaleByBillNumber(inv.id).subscribe({
      next: (res: SaleResponse) => {
        const summary = `
Invoice: ${res.billNumber}
Date: ${res.saleDate}
Customer: ${res.customerName ?? 'Walk-in Customer'}
Payment: ${res.paymentMode}
Subtotal: ₹ ${res.subtotal}
Discount: ₹ ${res.totalDiscount}
Tax: ₹ ${res.taxAmount}
Grand Total: ₹ ${res.grandTotal}
`;
        alert(summary);
      },
      error: () => alert('Failed to load invoice details.')
    });
  }

  printInvoice(inv: Invoice): void {
    const cached = this.cashierService.getCachedInvoiceByBill(inv.id);
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('Please allow pop-ups to print invoices.');
      return;
    }

    const renderAndPrint = (res: SaleResponse) => {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${res.billNumber}</title>
            <style>
              body { font-family: system-ui; padding: 24px; }
              h1 { font-size: 20px; margin-bottom: 8px; }
              p { margin: 4px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 13px; }
              th { background: #f3f4f6; }
              .total-row td { font-weight: 600; }
            </style>
          </head>
          <body>
            <h1>SmartInventory - Invoice</h1>
            <p><strong>Invoice No:</strong> ${res.billNumber}</p>
            <p><strong>Date:</strong> ${res.saleDate}</p>
            <p><strong>Customer:</strong> ${res.customerName ?? 'Walk-in Customer'}</p>
            <p><strong>Payment Mode:</strong> ${res.paymentMode}</p>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${res.items
                  .map(
                    (item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>₹ ${item.unitPrice}</td>
                  <td>₹ ${item.lineTotal}</td>
                </tr>`
                  )
                  .join('')}
                <tr class="total-row">
                  <td colspan="4">Grand Total</td>
                  <td>₹ ${res.grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    };

    if (cached) {
      renderAndPrint(cached);
    } else {
      this.cashierService.getSaleByBillNumber(inv.id).subscribe({
        next: (res) => renderAndPrint(res),
        error: () => {
          printWindow.close();
          alert('Failed to load invoice for printing.');
        }
      });
    }
  }
}

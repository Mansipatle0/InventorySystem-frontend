// src/app/components/admin-stock/admin-stock.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductDto } from '../../../services/product';

interface StockRow {
  product: ProductDto;      // keep full product
  id: number;
  code: string;
  name: string;
  currentStock: number;
  minStock: number;

  // inline edit fields
  adjustedStock: number;
  adjustedMinStock: number;

  // UI flag: show "Saved" state
  saved: boolean;
}

@Component({
  selector: 'app-admin-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-stock.html',
  styleUrl: './admin-stock.css',
})
export class AdminStock implements OnInit {
  rows: StockRow[] = [];
  loading = false;
  adjustmentMode = false;

  constructor(private productService: ProductService,  private cdr: ChangeDetectorRef,  private zone: NgZone) {}

  ngOnInit(): void {
    this.loadStock();
  }

  // 🔄 Load stock data from products table
  loadStock(): void {
    this.loading = true;
  this.cdr.detectChanges();

    this.productService.getAllForAdmin().subscribe({
    next: (products: ProductDto[]) => {
      this.zone.run(() => {   // 🔥 ensures Angular change detection runs

        this.rows = products.map(p => ({
          product: p,
          id: p.id,
          code: p.skuCode,
          name: p.name,
          currentStock: p.currentStock ?? 0,
          minStock: p.minStockLevel ?? 0,
          adjustedStock: p.currentStock ?? 0,
          adjustedMinStock: p.minStockLevel ?? 0,
          saved: false,
        }));

        this.loading = false;
        this.cdr.detectChanges();  // 🔥 instantly updates table
      });
    },
      error: (err) => {
        console.error('Failed to load stock data', err);
        this.loading = false;
           this.cdr.detectChanges(); 
      },
    });
  }

  // 👉 Stock In later (no navigation now)
  onStockInClick(): void {
    alert('Stock In (Purchase) will be implemented later.');
  }

  // 👉 Toggle inline adjustment mode
  onStockAdjustmentClick(): void {
    this.adjustmentMode = !this.adjustmentMode;

    if (this.adjustmentMode) {
      // reset adjusted values from current values & clear saved state
      this.rows.forEach((r) => {
        r.adjustedStock = r.currentStock;
        r.adjustedMinStock = r.minStock;
        r.saved = false;
      });
    } else {
      // when leaving adjustment mode, clear saved flags
      this.rows.forEach((r) => (r.saved = false));
    }
  }

  // 👉 Save adjustment for a single row using PATCH /api/products/{id}/stock
  saveAdjustment(row: StockRow): void {
    const newCurrentStock = Number(row.adjustedStock);
    const newMinStock = Number(row.adjustedMinStock);

    // If nothing changed, don't call backend
    if (
      newCurrentStock === row.currentStock &&
      newMinStock === row.minStock
    ) {
      return;
    }

    const payload = {
      currentStock: newCurrentStock,
      minStockLevel: newMinStock,
    };

    console.log('Sending stock update payload:', payload);

    this.productService.updateStock(row.id, payload).subscribe({
      next: (updated) => {
        console.log('Stock updated for product:', updated);

        // sync row + product with backend response
        row.product = updated;
        row.currentStock = updated.currentStock ?? newCurrentStock;
        row.minStock = updated.minStockLevel ?? newMinStock;

        row.adjustedStock = row.currentStock;
        row.adjustedMinStock = row.minStock;

        // show "Saved" state
        row.saved = true;

        // optional: auto clear "Saved" after 3 seconds
        setTimeout(() => {
          row.saved = false;
        }, 3000);
      },
      error: (err) => {
        console.error(
          'Failed to update stock',
          err?.error || err?.message || err
        );
        alert('Failed to update stock. Please check backend logs.');
      },
    });
  }

  // 👉 Reset just this row (back to current values)
  cancelAdjustment(row: StockRow): void {
    row.adjustedStock = row.currentStock;
    row.adjustedMinStock = row.minStock;
    row.saved = false;
  }
}

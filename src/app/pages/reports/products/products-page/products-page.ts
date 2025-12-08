import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductReportRow, ReportService } from '../../../../services/report-service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {

  searchText = '';
  categoryFilter = 'ALL';
  rows: ProductReportRow[] = [];

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProductHistory();
  }

  loadProductHistory() {
    this.reportService.getProductHistory().subscribe({
      next: (res: ProductReportRow[]) => {
        this.rows = res;
        console.log("Product History Loaded:", res);

     
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Failed to load product history", err);
      }
    });
  }

  get categories(): string[] {
    const unique = Array.from(new Set(this.rows.map(r => r.category)));
    return ['ALL', ...unique];
  }

  get filteredRows(): ProductReportRow[] {
    return this.rows.filter(row => {
      const matchesCategory =
        this.categoryFilter === 'ALL' || row.category === this.categoryFilter;

      const lower = this.searchText.toLowerCase();
      const matchesText =
        !lower ||
        row.code.toLowerCase().includes(lower) ||
        row.name.toLowerCase().includes(lower);

      return matchesCategory && matchesText;
    });
  }
}

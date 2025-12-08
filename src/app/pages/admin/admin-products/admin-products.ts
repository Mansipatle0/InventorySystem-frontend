import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductDto, ProductService } from '../../../services/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts implements OnInit {
  searchText = '';
  rows: ProductDto[] = [];
  loading = false;

  editingRowId: number | null = null;
  editModel: Partial<ProductDto> | null = null;

  savedForRow = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef,   // 🔥 FIX 1: Added
    private zone: NgZone              // 🔥 FIX 2: Added
  ) {}

  ngOnInit(): void {
    this.loadProducts(); // 🔥 load instantly
  }

  // 🔥 FIX — FORCE UI REFRESH on page load
  loadProducts(): void {
    this.loading = true;
    this.cdr.detectChanges(); // instant UI refresh

    this.productService.getAllForAdmin().subscribe({
      next: (data: ProductDto[]) => {
        this.zone.run(() => { // make sure Angular updates UI

          this.rows = data;
          this.loading = false;

          this.cdr.detectChanges(); // 🔥 instant table load
        });
      },
      error: (err: any) => {
        console.error('Failed to load products', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredRows(): ProductDto[] {
    const q = this.searchText.toLowerCase().trim();
    if (!q) return this.rows;

    return this.rows.filter(
      (p) =>
        p.skuCode.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q)
    );
  }

  onAddProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }

  onBulkImport(): void {
    console.log('Bulk Import clicked');
  }

  // Activate / Disable toggle
  onToggleStatus(row: ProductDto): void {
    this.productService.toggleActiveForAdmin(row.id).subscribe({
      next: (updated: ProductDto) => {
        this.zone.run(() => {
          const index = this.rows.findIndex((p) => p.id === updated.id);
          if (index !== -1) {
            this.rows[index] = updated;
          }
          this.cdr.detectChanges(); // 🔥 UI updates instantly
        });
      },
      error: (err) => {
        console.error('Failed to toggle product active flag', err);
      },
    });
  }

  onEdit(row: ProductDto): void {
    this.editingRowId = row.id;
    this.editModel = { ...row };
    this.savedForRow = false;
    this.cdr.detectChanges();
  }

  onCancelEdit(): void {
    this.editingRowId = null;
    this.editModel = null;
    this.savedForRow = false;
    this.cdr.detectChanges();
  }

  onSaveEdit(): void {
    if (!this.editingRowId || !this.editModel) return;

    this.productService.updateForAdmin(this.editingRowId, this.editModel).subscribe({
      next: (updated: ProductDto) => {
        this.zone.run(() => {
          const index = this.rows.findIndex((p) => p.id === updated.id);
          if (index !== -1) {
            this.rows[index] = updated;
          }

          this.savedForRow = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.editingRowId = null;
            this.editModel = null;
            this.savedForRow = false;
            this.cdr.detectChanges();
          }, 1000);
        });
      },
      error: (err) => {
        console.error('Failed to save edited product', err);
        this.savedForRow = false;
        this.cdr.detectChanges();
      },
    });
  }
}

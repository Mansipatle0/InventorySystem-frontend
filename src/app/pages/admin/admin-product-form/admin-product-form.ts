// src/app/pages/admin/admin-product-form/admin-product-form.ts
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ProductDto,
  ProductService,
} from '../../../services/product';

type Mode = 'SCAN' | 'MANUAL';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.css',
})
export class AdminProductForm {
  mode: Mode = 'SCAN';

  // value coming from wireless scanner
  scanBarcode = '';

  // form model for new product
  form: Partial<ProductDto> = {
    skuCode: '',
    barcode: '',
    name: '',
    category: '',
    unitOfMeasure: '',
    mrp: 0,
    sellingPrice: 0,
    minStockLevel: 0,
      currentStock: 0,  
    active: true,
  };

  saving = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private productService: ProductService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  switchMode(mode: Mode) {
    this.mode = mode;
    this.errorMessage = '';
    this.infoMessage = '';

    // 🔥 force UI refresh when switching SCAN / MANUAL
    this.cdr.detectChanges();
  }

  /**
   * Called when user scans and presses Enter or clicks button.
   * NO API CALL – just copy scanned value into form.barcode.
   */
  onScanConfirm(): void {
    this.errorMessage = '';
    this.infoMessage = '';

    const code = this.scanBarcode.trim();
    if (!code) {
      this.errorMessage = 'Please scan or type a barcode first.';
      this.cdr.detectChanges();
      return;
    }

    // put scanned barcode into form
    this.form.barcode = code;
    this.infoMessage =
      'Barcode captured. Fill other details and save the product.';

    // 🔥 reflect barcode + message immediately
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.form.skuCode || !this.form.name) {
      this.errorMessage = 'SKU Code and Name are required.';
      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.cdr.detectChanges(); // show "Saving..." instantly

    this.productService.createForAdmin(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.infoMessage = 'Product created successfully.';

        // 🔥 update UI once more before navigation
        this.cdr.detectChanges();

        // go back to products list
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        this.saving = false;
        console.error('Failed to create product', err);
        this.errorMessage =
          'Failed to create product. Check console for details.';

        // 🔥 ensure error message appears immediately
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }
}

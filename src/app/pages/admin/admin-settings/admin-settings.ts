// src/app/components/admin-settings/admin-settings.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService, StoreSettings } from '../../../services/settings-service';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css',
})
export class AdminSettings implements OnInit {
  shopName = 'My SmartInventory Store';
  gstNumber = '';
  address = '';
  invoicePrefix = 'BILL-';
  taxPercent = 0;
  discountPercent = 0;

  saving = false;
  saveMessage = '';

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings: StoreSettings) => {
        if (!settings) return;

        this.shopName = settings.shopName ?? this.shopName;
        this.gstNumber = settings.gstNumber ?? '';
        this.address = settings.address ?? '';
        this.invoicePrefix = settings.invoicePrefix ?? 'BILL-';
        this.taxPercent = settings.taxPercent ?? 0;
        this.discountPercent = settings.discountPercent ?? 0;
      },
      error: (err: any) => {
        console.error('Failed to load settings', err);
      },
    });
  }

  onSave(): void {
     if (this.saving) return;
    this.saving = true;
    this.saveMessage = '';

    const payload: StoreSettings = {
      shopName: this.shopName,
      gstNumber: this.gstNumber,
      address: this.address,
      invoicePrefix: this.invoicePrefix,
      taxPercent: this.taxPercent,
      discountPercent: this.discountPercent,
    };

     this.settingsService
      .saveSettings(payload)
      .pipe(
        // this ALWAYS runs (success or error)
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: (res) => {
          console.log('Settings saved:', res);
          this.saveMessage = 'Settings saved successfully.';
        },
        error: (err) => {
          console.error('Failed to save settings', err);
          this.saveMessage = 'Failed to save settings.';
        },
      });
  }
}

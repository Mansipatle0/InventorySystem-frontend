
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StoreSettings {
  shopName: string;
  gstNumber: string;
  address: string;
  invoicePrefix: string;
  taxPercent: number;
  discountPercent: number;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private baseUrl = 'http://localhost:8080/api/admin/settings';

  constructor(private http: HttpClient) {}

  getSettings(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(this.baseUrl);
  }

  saveSettings(settings: StoreSettings): Observable<StoreSettings> {
    return this.http.put<StoreSettings>(this.baseUrl, settings);
  }
}

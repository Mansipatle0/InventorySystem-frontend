// src/app/services/admin-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminOverviewMetrics {
  totalProducts: number;
  lowStockItems: number;
  activeUsers: number;
  todaySales: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  // adjust if your backend base URL is different
  private baseUrl = 'http://localhost:8080/api/admin/dashboard';

  constructor(private http: HttpClient) {}

  getOverviewMetrics(): Observable<AdminOverviewMetrics> {
    return this.http.get<AdminOverviewMetrics>(`${this.baseUrl}/overview`);
  }
}

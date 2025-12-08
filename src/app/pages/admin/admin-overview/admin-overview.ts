// src/app/pages/admin/admin-overview/admin-overview.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  AdminDashboardService,
  AdminOverviewMetrics,
} from '../../../services/admin-dashboard-service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-overview.html',
  styleUrl: './admin-overview.css',
})
export class AdminOverview implements OnInit {
  totalProducts = 0;
  lowStockItems = 0;
  activeUsers = 0;
  todaySales = 0;

  loading = false;
  errorMessage = '';

  constructor(
    private dashboardService: AdminDashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  private loadMetrics(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // ensure UI shows loading immediately

    this.dashboardService.getOverviewMetrics().subscribe({
      next: (metrics: AdminOverviewMetrics) => {
        this.totalProducts = metrics.totalProducts;
        this.lowStockItems = metrics.lowStockItems;
        this.activeUsers = metrics.activeUsers;
        this.todaySales = metrics.todaySales;
        this.loading = false;

        // 🔥 force instant UI refresh when coming from other child routes
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load admin overview metrics', err);
        this.errorMessage = 'Failed to load dashboard data.';
        this.loading = false;

        // 🔥 also refresh in error scenario
        this.cdr.detectChanges();
      },
    });
  }
}

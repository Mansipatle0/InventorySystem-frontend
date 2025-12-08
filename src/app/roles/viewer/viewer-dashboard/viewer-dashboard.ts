import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Sidebar } from "../../../core/layout/sidebar/sidebar";

@Component({
  selector: 'app-viewer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar],
  templateUrl: './viewer-dashboard.html',
  styleUrl: './viewer-dashboard.css',
})
export class ViewerDashboard implements OnInit {
  viewerName = 'Viewer';
  headerTitle = 'Reports Overview';
  isOverviewRoute = true;

  sidebarOpen = false;

  constructor(private router: Router) {}



toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
}

closeSidebar() {
  this.sidebarOpen = false;
}

  ngOnInit(): void {
    this.updateFromUrl(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        this.updateFromUrl(url);
      }
    });
  }

  private updateFromUrl(url: string): void {
    this.isOverviewRoute = !(
      url.includes('/viewer/daily') ||
      url.includes('/viewer/product') ||
      url.includes('/viewer/monthly') ||
      url.includes('/viewer/fast-slow') ||
      url.includes('/viewer/export')
    );

    if (url.includes('/viewer/daily')) this.headerTitle = 'Daily Sales Report';
    else if (url.includes('/viewer/product')) this.headerTitle = 'Product-wise Sales History';
    else if (url.includes('/viewer/monthly')) this.headerTitle = 'Monthly Sales Report';
    else if (url.includes('/viewer/fast-slow')) this.headerTitle = 'Fast / Slow Moving Products';
    else if (url.includes('/viewer/export')) this.headerTitle = 'Yearly Export (Excel)';
    else this.headerTitle = 'Reports Overview';
  }

  goTo(path: 'daily' | 'product' | 'monthly' | 'fast-slow' | 'export'): void {
    this.router.navigate(['/viewer', path]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Sidebar } from "../../../core/layout/sidebar/sidebar";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  adminName = 'Admin';
  headerTitle = 'Admin Overview';
  sidebarOpen = false;

toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
}

closeSidebar() {
  this.sidebarOpen = false;
}


  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/admin/products')) {
          this.headerTitle = 'Manage Products';
        } else if (event.url.includes('/admin/stock')) {
          this.headerTitle = 'Stock & Inventory';
        } else if (event.url.includes('/admin/requests')) {
          this.headerTitle = 'Stock / Purchase Requests';
        } else if (event.url.includes('/admin/users')) {
          this.headerTitle = 'Users & Roles';
        } else if (event.url.includes('/admin/reports')) {
          this.headerTitle = 'Admin Reports';
        } else {
          this.headerTitle = 'Admin Overview';
        }
      }
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

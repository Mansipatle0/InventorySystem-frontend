import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from "../../../core/layout/sidebar/sidebar";

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar],
  templateUrl: './cashier-dashboard.html',
  styleUrl: './cashier-dashboard.css',
})
export class CashierDashboard implements OnInit {

  cashierName = 'Cashier';
  headerTitle = 'POS / Billing Screen';
  sidebarOpen = false;

    toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Update Header Title based on current route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/cashier/pos')) this.headerTitle = 'POS / Billing Screen';
        else if (event.url.includes('/cashier/hold-bill')) this.headerTitle = 'Hold Bill';
        else if (event.url.includes('/cashier/recall-bill')) this.headerTitle = 'Recall Held Bill';
        else if (event.url.includes('/cashier/invoice')) this.headerTitle = 'Invoice';
      }
    });
  }


}

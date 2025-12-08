import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
    constructor(private router: Router) {}
 logout() {

    localStorage.clear();
    this.router.navigate(['/login']);
  }
  @Input() userName = '';
  @Input() role = '';      // ADMIN / CASHIER / VIEWER
  @Input() sidebarOpen = false;

  @Output() sidebarClose = new EventEmitter<void>();

  closeSidebar() {
    this.sidebarClose.emit();
  }
}

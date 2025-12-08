import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css',
})
export class AdminReports {
  active = 'daily';

  constructor(private router: Router) {}

  go(path: string) {
    this.active = path;
    this.router.navigate(['admin/reports', path]);
  }
}

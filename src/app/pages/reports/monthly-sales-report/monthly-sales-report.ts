import { ChangeDetectorRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MonthlyRow {
  month: string;
  bills: number;
  itemsSold: number;
  revenue: number;
   growthPercent?: number
}import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonthlySales } from '../../../services/monthly-sales';


@Component({
  selector: 'app-monthly-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monthly-sales-report.html',
  styleUrl: './monthly-sales-report.css',
})
export class MonthlySalesReport implements OnInit {

  selectedYear = new Date().getFullYear();
  rows: MonthlyRow[] = [];

  constructor(private reportService: MonthlySales, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadReport();
  }
  onYearChange(year: number) {
  this.selectedYear = year;
  this.loadReport();
}


loadReport() {
  this.reportService.getMonthlyReport(this.selectedYear).subscribe(data => {

    const processed = data.map((row, i) => {
      const prev = i === 0 ? 0 : data[i - 1].revenue;
      const growth = i === 0 ? 0 : ((row.revenue - prev) / prev) * 100;

      return { ...row, growthPercent: growth };
    });

    this.rows = processed;

    // 🔥 FORCE UI refresh instantly
    this.cdr.detectChanges();
  });
}



  get totalYearRevenue(): number {
    return this.rows.reduce((total, r) => total + r.revenue, 0);
  }

  get bestMonth(): string {
    if (!this.rows.length) return '-';
    return this.rows.reduce((max, row) => row.revenue > max.revenue ? row : max).month;
  }

  get avgMonthlyRevenue(): number {
    return this.rows.length ? this.totalYearRevenue / this.rows.length : 0;
  }

  get yearsList() {
    const now = new Date().getFullYear();
    return [now - 1, now, now + 1];
  }
}




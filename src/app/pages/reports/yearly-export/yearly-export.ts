import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface RawYearRow {
  month: number;   // backend → 11,12
  bills: number;
  revenue: number;
}

interface YearSummaryRow {
  month: string;   // UI → 'Nov','Dec'
  bills: number;
  revenue: number;
}

@Component({
  selector: 'app-yearly-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './yearly-export.html',
  styleUrl: './yearly-export.css',
})
export class YearlyExport implements OnInit {

  selectedYear = new Date().getFullYear();
  isExporting = false;

  rows: YearSummaryRow[] = [];

  private baseUrl = "http://localhost:8080/api/viewer/reports";

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadYearlyReport();
  }

  // 🔥 Instant reload on year change
  onYearChange() {
    this.loadYearlyReport();
  }

  // 🔥 Load yearly summary from backend
  loadYearlyReport() {
    this.http
      .get<RawYearRow[]>(`${this.baseUrl}/yearly-summary?year=${this.selectedYear}`)
      .subscribe({
        next: (data) => {
          const monthNames = [
            "Jan","Feb","Mar","Apr","May","Jun",
            "Jul","Aug","Sep","Oct","Nov","Dec"
          ];

          // Convert number months → month names
          this.rows = data.map(r => ({
            month: monthNames[r.month - 1],  // e.g., 11 → "Nov"
            bills: r.bills,
            revenue: r.revenue
          }));

          this.cdr.detectChanges();
        },
        error: err => {
          console.error("YEARLY SUMMARY ERROR:", err);
          this.rows = [];
        }
      });
  }

  // 🔥 Year dropdown list
  get yearsList() {
    const now = new Date().getFullYear();
    return [now - 1, now, now + 1];
  }

  // 🔥 Total yearly revenue
  get totalRevenue() {
    return this.rows.reduce((sum, r) => sum + r.revenue, 0);
  }

  // 🔥 Download Excel File
  onExport() {
    this.isExporting = true;

    this.http.get(`${this.baseUrl}/yearly/export?year=${this.selectedYear}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Yearly-Report-${this.selectedYear}.xlsx`;
        a.click();

        this.isExporting = false;
      },
      error: (err) => {
        console.error("EXPORT ERROR:", err);
        this.isExporting = false;
      }
    });
  }

  // Preview button → same as refresh
  onPreview() {
    this.loadYearlyReport();
  }
}

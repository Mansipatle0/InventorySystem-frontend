import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailySalesService } from '../../../services/daily-sales-service';

@Component({
  selector: 'app-daily-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-sales-report.html',
  styleUrls: ['./daily-sales-report.css'],
})
export class DailySalesReport implements OnInit {

  selectedDate: string = new Date().toISOString().slice(0, 10);
  rows: any[] = [];

  constructor(
    private salesService: DailySalesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  /** Trigger on date changed */
  onDateChange(value: string) {
    this.selectedDate = value;
    this.loadData();
  }

  /** Load daily report */
  loadData() {
    this.salesService.getDailySales(this.selectedDate).subscribe({
      next: (res: any) => {

        let json;

        // Backend returns JSON string → parse it
        try {
          json = typeof res === 'string' ? JSON.parse(res) : res;
        } catch {
          this.rows = [];
          return;
        }

        if (!Array.isArray(json)) {
          this.rows = [];
          return;
        }

        // 🟢 Map backend → UI
        this.rows = json.map((sale: any) => ({
          billNo: sale.billNumber,
          time: sale.createdAt?.split("T")[1]?.substring(0, 5) || "",
          items: sale.items?.length || 0,
          amount: sale.grandTotal || 0,
          cashier: sale.cashierId || ""
        }));

        // 🔥 Force UI to update instantly
        this.rows = [...this.rows];
        this.cdr.detectChanges();
      },

      error: () => {
        this.rows = [];
      }
    });
  }

  // --- Calculated values ---

  get totalBills(): number {
    return this.rows.length;
  }

  get totalItems(): number {
    return this.rows.reduce((sum, r) => sum + (r.items || 0), 0);
  }

  get totalRevenue(): number {
    return this.rows.reduce((sum, r) => sum + (r.amount || 0), 0);
  }

  get avgBasketValue(): number {
    return this.totalBills ? this.totalRevenue / this.totalBills : 0;
  }
}

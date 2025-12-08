import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MoverRow, Movers } from '../../../services/movers';


@Component({
  selector: 'app-fast-slow-movers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fast-slow-movers.html',
  styleUrl: './fast-slow-movers.css',
})
export class FastSlowMovers implements OnInit {

  fastMovers: MoverRow[] = [];
  slowMovers: MoverRow[] = [];

  loadingFast = false;
  loadingSlow = false;

  constructor(
    private moversService: Movers,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingFast = true;
    this.loadingSlow = true;

    // 🔥 Fast movers
    this.moversService.getFastMovers().subscribe({
      next: (rows: MoverRow[]) => {
        this.fastMovers = rows;
        this.loadingFast = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('FAST MOVERS ERROR:', err);
        this.fastMovers = [];
        this.loadingFast = false;
      }
    });

    // 🔥 Slow movers
    this.moversService.getSlowMovers().subscribe({
      next: (rows: MoverRow[]) => {
        this.slowMovers = rows;
        this.loadingSlow = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('SLOW MOVERS ERROR:', err);
        this.slowMovers = [];
        this.loadingSlow = false;
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MoverRow {
  code: string;
  name: string;
  category: string;
  qtySold: number;
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class Movers {

  private baseUrl = 'http://localhost:8080/api/viewer/reports';

  constructor(private http: HttpClient) {}

  getFastMovers(): Observable<MoverRow[]> {
    return this.http.get<MoverRow[]>(`${this.baseUrl}/fast-movers`);
  }

  getSlowMovers(): Observable<MoverRow[]> {
    return this.http.get<MoverRow[]>(`${this.baseUrl}/slow-movers`);
  }
}

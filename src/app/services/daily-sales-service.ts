import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DailySalesService {

  constructor(private http: HttpClient) {}

 getDailySales(date: string) {
  return this.http.get(`http://localhost:8080/api/sales/daily`, {
    params: { date },
    responseType: 'text'
  });
  }
}

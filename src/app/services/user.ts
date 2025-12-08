import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UserRole = 'ADMIN' | 'CASHIER' | 'VIEWER';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  password?: string;  
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly adminBaseUrl = 'http://localhost:8080/api/admin/users';

  constructor(private http: HttpClient) {}

  /** GET /api/admin/users */
  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.adminBaseUrl);
  }

  /** POST /api/admin/users */
  create(body: Partial<UserDto>): Observable<UserDto> {
    return this.http.post<UserDto>(this.adminBaseUrl, body);
  }

  /** PUT /api/admin/users/{id} */
  update(id: number, body: Partial<UserDto>): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.adminBaseUrl}/${id}`, body);
  }

  /** PATCH /api/admin/users/{id}/toggle-active */
  toggleActive(id: number): Observable<UserDto> {
    return this.http.patch<UserDto>(
      `${this.adminBaseUrl}/${id}/toggle-active`,
      {}
    );
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../../services/login';


type UserRole = 'ADMIN' | 'CASHIER' | 'VIEWER';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})
export class LoginPage {

  email = '';
  password = '';
  selectedRole: UserRole = 'CASHIER';
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private loginService: Login
  ) {}

  onRoleChange(role: UserRole) {
    this.selectedRole = role;
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'CASHIER': return 'Cashier';
      default: return 'Viewer / Manager';
    }
  }

  login() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.isLoading = true;

    this.loginService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;

        // Check if selected role matches user role
        if (user.role !== this.selectedRole) {
          this.errorMessage = `This account belongs to ${user.role}, not ${this.selectedRole}.`;
          return;
        }

        // Save logged user info (optional)
        localStorage.setItem('loggedUser', JSON.stringify(user));

        // Navigate based on backend role
        if (user.role === 'ADMIN') {
          this.router.navigateByUrl('/admin');
        } else if (user.role === 'CASHIER') {
          this.router.navigateByUrl('/cashier');
        } else {
          this.router.navigateByUrl('/viewer');
        }
      },

      error: (err) => {
        this.isLoading = false;

        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'Something went wrong. Try again.';
        }
      }
    });
  }
}

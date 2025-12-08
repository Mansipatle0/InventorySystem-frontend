import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDto, UserRole, UserService } from '../../../services/user';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  rows: UserDto[] = [];
  loading = false;

  editingUserId: number | null = null;
  editModel: Partial<UserDto> | null = null;

  showAddRow = false;
  savedForRow = false;

  // NEW FIELDS:
  passwordEditMode: { [key: number]: boolean } = {};
  passwordVisibility: { [key: number]: boolean } = {};

  newUser: Partial<UserDto> = {
    name: '',
    email: '',
    role: 'CASHIER',
    active: true,
    password: ''
  };

  roles: UserRole[] = ['ADMIN', 'CASHIER', 'VIEWER'];

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.rows = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.loading = false;
      }
    });
  }

  // ---------------- ADD USER ----------------
  onAddUserClick(): void {
    this.showAddRow = true;
    this.newUser = {
      name: '',
      email: '',
      role: 'CASHIER',
      active: true,
      password: ''
    };
  }

  onCancelAdd(): void {
    this.showAddRow = false;
  }

  onSaveNewUser(): void {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.role || !this.newUser.password) {
      alert('Please fill name, email, role and password.');
      return;
    }

    this.userService.create(this.newUser).subscribe({
      next: () => {
        this.showAddRow = false;
        this.loadUsers();
      },
      error: (err) => console.error("Failed to create user", err)
    });
  }

  // ---------------- EDIT USER ----------------
  onEdit(row: UserDto): void {
    this.editingUserId = row.id;
    this.editModel = { ...row, password: "" };

    // default password mode = not editing
    this.passwordEditMode[row.id] = false;
    this.passwordVisibility[row.id] = false;

    this.cdr.detectChanges();
  }

  onCancelEdit(): void {
    this.editingUserId = null;
    this.editModel = null;
  }

  togglePasswordChange(id: number) {
    this.passwordEditMode[id] = !this.passwordEditMode[id];
    if (!this.passwordEditMode[id] && this.editModel) {
      this.editModel.password = "";
    }
    this.cdr.detectChanges();
  }

  togglePasswordVisibility(id: number) {
    this.passwordVisibility[id] = !this.passwordVisibility[id];
  }
  getMaskedPassword(password: string | undefined): string {
  if (!password) return "******";
  return "*".repeat(8); // always show 8 stars
}


  onSaveEdit(): void {
    if (!this.editingUserId || !this.editModel) return;

    const payload = { ...this.editModel };

    // only include password if admin explicitly chose "Change Password"
    if (!this.passwordEditMode[this.editingUserId] || !payload.password) {
      delete payload.password;
    }

    this.userService.update(this.editingUserId, payload).subscribe({
      next: () => {
        this.savedForRow = true;
        this.loadUsers();

        setTimeout(() => {
          this.editingUserId = null;
          this.editModel = null;
          this.savedForRow = false;
        }, 800);
      },
      error: (err) => console.error("Failed to update user", err)
    });
  }

  // ---------------- STATUS ----------------
  onToggleStatus(row: UserDto): void {
    const oldValue = row.active;
    row.active = !row.active;

    this.userService.toggleActive(row.id).subscribe({
      error: () => {
        row.active = oldValue;
        alert("Failed to update user status");
      }
    });
  }

 isActiveRow(row: UserDto): boolean { const v = (row as any).active; if (typeof v === 'boolean')
   return v; if (typeof v === 'number')
     return v === 1; if (!v)
       return false; const n = v.toString().toUpperCase();
  return ['TRUE', '1', 'ACTIVE', 'ENABLED', 'YES'].includes(n); }

  getStatusLabel(row: UserDto): string {
    return this.isActiveRow(row) ? "ACTIVE" : "DISABLED";
  }

  getToggleLabel(row: UserDto): string {
    return this.isActiveRow(row) ? "Disable" : "Enable";
  }
}

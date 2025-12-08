import { Routes } from '@angular/router';

export const routes: Routes = [

  // ===================================
  // DEFAULT
  // ===================================
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ===================================
  // LOGIN PAGE
  // ===================================
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login-page/login-page').then(m => m.LoginPage),
  },

  // ===================================
  // CASHIER DASHBOARD
  // ===================================
  {
    path: 'cashier',
    loadComponent: () =>
      import('./roles/cashier/cashier-dashboard/cashier-dashboard')
        .then(m => m.CashierDashboard),
    children: [
      { path: '', redirectTo: 'pos', pathMatch: 'full' },

      {
        path: 'pos',
        loadComponent: () =>
          import('./pages/BillingScreen/pos/pos-page/pos-page')
            .then(m => m.PosPage),
      },
      {
        path: 'hold-bill',
        loadComponent: () =>
          import('./pages/BillingScreen/hold-bill/hold-bill-page/hold-bill-page')
            .then(m => m.HoldBillPage),
      },
      {
        path: 'recall-bill',
        loadComponent: () =>
          import('./pages/BillingScreen/recall-bill/recall-bill-page/recall-bill-page')
            .then(m => m.RecallBillPage),
      },
      {
        path: 'invoice',
        loadComponent: () =>
          import('./pages/BillingScreen/invoice/invoice-page/invoice-page')
            .then(m => m.InvoicePage),
      },
    ]
  },

  // ===================================
  // VIEWER DASHBOARD (Reports)
  // ===================================
  {
    path: 'viewer',
    loadComponent: () =>
      import('./roles/viewer/viewer-dashboard/viewer-dashboard')
        .then(m => m.ViewerDashboard),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },

      {
        path: 'daily',
        loadComponent: () =>
          import('./pages/reports/daily-sales-report/daily-sales-report')
            .then(m => m.DailySalesReport),
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./pages/reports/products/products-page/products-page')
            .then(m => m.ProductsPage),
      },
      {
        path: 'monthly',
        loadComponent: () =>
          import('./pages/reports/monthly-sales-report/monthly-sales-report')
            .then(m => m.MonthlySalesReport),
      },
      {
        path: 'fast-slow',
        loadComponent: () =>
          import('./pages/reports/fast-slow-movers/fast-slow-movers')
            .then(m => m.FastSlowMovers),
      },
      {
        path: 'export',
        loadComponent: () =>
          import('./pages/reports/yearly-export/yearly-export')
            .then(m => m.YearlyExport),
      },
    ],
  },

  // ===================================
  // ADMIN DASHBOARD (management)
  // ===================================
  {
    path: 'admin',
    loadComponent: () =>
      import('./roles/admin/admin-dashboard/admin-dashboard')
        .then(m => m.AdminDashboard),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },

      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/admin/admin-overview/admin-overview')
            .then(m => m.AdminOverview),
      },

      {
        path: 'products',
        loadComponent: () =>
          import('./pages/admin/admin-products/admin-products')
            .then(m => m.AdminProducts),
      },

      {
        path: 'products/new',
        loadComponent: () =>
          import('./pages/admin/admin-product-form/admin-product-form')
            .then(m => m.AdminProductForm),
      },

      {
        path: 'stock',
        loadComponent: () =>
          import('./pages/admin/admin-stock/admin-stock')
            .then(m => m.AdminStock),
      },

      // ===========================
      // ADMIN REPORTS FIXED ROUTES
      // ===========================
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/admin/admin-reports/admin-reports')
            .then(m => m.AdminReports),
        children: [
          { path: '', redirectTo: 'daily', pathMatch: 'full' },

          {
            path: 'daily',
            loadComponent: () =>
              import('./pages/reports/daily-sales-report/daily-sales-report')
                .then(m => m.DailySalesReport),
          },
          {
            path: 'product',
            loadComponent: () =>
              import('./pages/reports/products/products-page/products-page')
                .then(m => m.ProductsPage),
          },
          {
            path: 'monthly',
            loadComponent: () =>
              import('./pages/reports/monthly-sales-report/monthly-sales-report')
                .then(m => m.MonthlySalesReport),
          },
          {
            path: 'fast-slow',
            loadComponent: () =>
              import('./pages/reports/fast-slow-movers/fast-slow-movers')
                .then(m => m.FastSlowMovers),
          },
          {
            path: 'export',
            loadComponent: () =>
              import('./pages/reports/yearly-export/yearly-export')
                .then(m => m.YearlyExport),
          },
        ]
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/admin-users/admin-users')
            .then(m => m.AdminUsers),
      },

      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/admin-settings/admin-settings')
            .then(m => m.AdminSettings),
      },
    ]
  },

  // ===================================
  // WILDCARD
  // ===================================
  { path: '**', redirectTo: 'login' }
];

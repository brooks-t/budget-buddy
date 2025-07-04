import { Routes } from '@angular/router';

/**
 * Main application routes for Budget Buddy
 * Each route represents a different section of our personal finance app
 */
export const routes: Routes = [
  // Default route - redirects to dashboard when user visits the root URL
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Dashboard - Main overview page showing financial summary
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard - Budget Buddy',
  },

  // Income - Track and manage income sources
  {
    path: 'income',
    loadComponent: () => import('./pages/income/income').then((m) => m.Income),
    title: 'Income - Budget Buddy',
  },

  // Expenses - Track and categorize spending
  {
    path: 'expenses',
    loadComponent: () =>
      import('./pages/expenses/expenses').then((m) => m.Expenses),
    title: 'Expenses - Budget Buddy',
  },

  // Goals - Set and monitor financial goals
  {
    path: 'goals',
    loadComponent: () => import('./pages/goals/goals').then((m) => m.Goals),
    title: 'Goals - Budget Buddy',
  },

  // Reports - View financial insights and analytics
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports').then((m) => m.Reports),
    title: 'Reports - Budget Buddy',
  },

  // Wildcard route - handles invalid URLs by redirecting to dashboard
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];

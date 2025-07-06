import { Routes } from '@angular/router';

/**
 * Application Routes Configuration
 *
 * This defines all the pages/components that users can navigate to
 * Each route maps a URL path to a specific component
 */
export const routes: Routes = [
  // Default route - redirect to dashboard when user visits root URL
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Dashboard route - shows financial overview
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },

  // Income tracking route
  {
    path: 'income',
    loadComponent: () => import('./pages/income/income').then((m) => m.Income),
  },

  // Expense tracking route
  {
    path: 'expenses',
    loadComponent: () =>
      import('./pages/expenses/expenses').then((m) => m.Expenses),
  },

  // Budget goals route
  {
    path: 'goals',
    loadComponent: () => import('./pages/goals/goals').then((m) => m.Goals),
  },

  // Reports route
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports').then((m) => m.Reports),
  },

  // Catch-all route - redirect any unknown URLs to dashboard
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];

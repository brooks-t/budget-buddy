import { Routes } from '@angular/router';

// Direct imports for all components - consistent approach
import { Dashboard } from './pages/dashboard/dashboard';
import { Income } from './pages/income/income';
import { Expenses } from './pages/expenses/expenses';
import { Goals } from './pages/goals/goals';
import { Reports } from './pages/reports/reports';

/**
 * Application Routes Configuration - Direct Import Version
 * Using direct imports for consistent, reliable routing
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
    component: Dashboard,
  },

  // Income tracking route
  {
    path: 'income',
    component: Income,
  },

  // Expense tracking route
  {
    path: 'expenses',
    component: Expenses,
  },

  // Goals route
  {
    path: 'goals',
    component: Goals,
  },

  // Reports route
  {
    path: 'reports',
    component: Reports,
  },

  // Catch-all route - redirect any unknown URLs to dashboard
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];

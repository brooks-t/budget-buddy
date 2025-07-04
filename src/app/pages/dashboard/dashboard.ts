import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dashboard Component - The main overview page for Budget Buddy
 *
 * This component demonstrates several key Angular concepts:
 * - Data binding with {{ }} interpolation
 * - Property binding with []
 * - Event binding with ()
 * - Structural directives like *ngFor
 * - Pipes for formatting data
 * - Component lifecycle
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, and built-in pipes
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  // Sample financial data - this simulates what would come from a backend API
  totalIncome = 5500.0;
  totalExpenses = 3200.0;

  // Computed property - shows how TypeScript getters work
  get totalSavings(): number {
    return this.totalIncome - this.totalExpenses;
  }

  // Sample transaction data - demonstrates working with arrays in Angular
  recentTransactions = [
    {
      id: 1,
      description: 'Salary Deposit',
      amount: 2750.0,
      type: 'income' as 'income' | 'expense', // TypeScript union type for type safety
      category: 'Salary',
      date: new Date('2024-01-15'),
    },
    {
      id: 2,
      description: 'Grocery Shopping',
      amount: -125.5,
      type: 'expense' as 'income' | 'expense',
      category: 'Food',
      date: new Date('2024-01-14'),
    },
    {
      id: 3,
      description: 'Freelance Work',
      amount: 500.0,
      type: 'income' as 'income' | 'expense',
      category: 'Freelance',
      date: new Date('2024-01-13'),
    },
    {
      id: 4,
      description: 'Electric Bill',
      amount: -89.25,
      type: 'expense' as 'income' | 'expense',
      category: 'Utilities',
      date: new Date('2024-01-12'),
    },
    {
      id: 5,
      description: 'Coffee Shop',
      amount: -4.75,
      type: 'expense' as 'income' | 'expense',
      category: 'Food',
      date: new Date('2024-01-12'),
    },
  ];

  // Event handler methods - these will be called when users click buttons
  onAddIncome(): void {
    // For now, we'll just log to console - later we'll open a form
    console.log('Add Income clicked - this will open an income form');

    // This shows how you might add a new transaction (temporary example)
    alert('Add Income feature coming soon!');
  }

  onAddExpense(): void {
    console.log('Add Expense clicked - this will open an expense form');
    alert('Add Expense feature coming soon!');
  }

  onViewReports(): void {
    console.log('View Reports clicked - this will navigate to reports page');
    alert('Reports feature coming soon!');
  }

  // Method to get the icon for each transaction type
  getTransactionIcon(type: 'income' | 'expense'): string {
    return type === 'income' ? '💵' : '💳';
  }

  // Method to get CSS class for styling different transaction types
  getTransactionClass(amount: number): string {
    return amount > 0 ? 'positive' : 'negative';
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Financial Data Service - Centralized data management for Budget Buddy
 *
 * This service demonstrates:
 * - Angular Services and Dependency Injection
 * - RxJS BehaviorSubject for reactive data
 * - Data sharing between components
 * - Single source of truth pattern
 */

// First, let's define TypeScript interfaces for type safety
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

export interface IncomeEntry {
  id: number;
  description: string;
  amount: number;
  source: string;
  frequency: 'one-time' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
}

export interface ExpenseEntry {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

@Injectable({
  providedIn: 'root', // This makes the service available app-wide
})
export class FinancialData {
  // Private BehaviorSubjects to hold our data
  // BehaviorSubject remembers the last value and emits it to new subscribers
  private incomeSubject = new BehaviorSubject<IncomeEntry[]>([
    // Sample income data
    {
      id: 1,
      description: 'Software Developer Salary',
      amount: 2750.0,
      source: 'Salary',
      frequency: 'monthly',
      date: new Date('2024-01-15'),
    },
    {
      id: 2,
      description: 'Website Design Project',
      amount: 500.0,
      source: 'Freelance Work',
      frequency: 'one-time',
      date: new Date('2024-01-13'),
    },
  ]);

  private expensesSubject = new BehaviorSubject<ExpenseEntry[]>([
    // Sample expense data
    {
      id: 1,
      description: 'Grocery Shopping',
      amount: 125.5,
      category: 'Groceries',
      date: new Date('2024-01-14'),
    },
    {
      id: 2,
      description: 'Electric Bill',
      amount: 89.25,
      category: 'Bills & Utilities',
      date: new Date('2024-01-12'),
    },
  ]);

  // Public observables for components to subscribe to
  // These allow components to react to data changes automatically
  public income$ = this.incomeSubject.asObservable();
  public expenses$ = this.expensesSubject.asObservable();

  constructor() {
    console.log('FinancialData service initialized');
  }

  // Methods to get current values (useful for calculations)
  getCurrentIncome(): IncomeEntry[] {
    return this.incomeSubject.getValue();
  }

  getCurrentExpenses(): ExpenseEntry[] {
    return this.expensesSubject.getValue();
  }

  // Methods to add new data
  addIncome(income: Omit<IncomeEntry, 'id'>): void {
    const currentIncome = this.getCurrentIncome();
    const newIncome: IncomeEntry = {
      ...income,
      id: Date.now(), // Simple ID generation
    };

    // Update the BehaviorSubject with new data
    this.incomeSubject.next([...currentIncome, newIncome]);
    console.log('Income added:', newIncome);
  }

  addExpense(expense: Omit<ExpenseEntry, 'id'>): void {
    const currentExpenses = this.getCurrentExpenses();
    const newExpense: ExpenseEntry = {
      ...expense,
      id: Date.now(),
    };

    this.expensesSubject.next([...currentExpenses, newExpense]);
    console.log('Expense added:', newExpense);
  }

  // Methods to delete data
  deleteIncome(id: number): void {
    const currentIncome = this.getCurrentIncome();
    const updatedIncome = currentIncome.filter((income) => income.id !== id);
    this.incomeSubject.next(updatedIncome);
    console.log('Income deleted with ID:', id);
  }

  deleteExpense(id: number): void {
    const currentExpenses = this.getCurrentExpenses();
    const updatedExpenses = currentExpenses.filter(
      (expense) => expense.id !== id
    );
    this.expensesSubject.next(updatedExpenses);
    console.log('Expense deleted with ID:', id);
  }

  // Computed properties for dashboard
  getTotalIncome(): Observable<number> {
    // Using RxJS map operator to transform the income array into a total
    return new Observable((subscriber) => {
      this.income$.subscribe((incomeList) => {
        const total = incomeList.reduce(
          (sum, income) => sum + income.amount,
          0
        );
        subscriber.next(total);
      });
    });
  }

  getTotalExpenses(): Observable<number> {
    return new Observable((subscriber) => {
      this.expenses$.subscribe((expensesList) => {
        const total = expensesList.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
        subscriber.next(total);
      });
    });
  }

  // Get recent transactions for dashboard (combines income and expenses)
  getRecentTransactions(): Observable<Transaction[]> {
    return new Observable((subscriber) => {
      // Combine both income and expenses into a single transaction list
      const incomeData = this.getCurrentIncome();
      const expenseData = this.getCurrentExpenses();

      // Convert income to transaction format
      const incomeTransactions: Transaction[] = incomeData.map((income) => ({
        id: income.id,
        description: income.description,
        amount: income.amount,
        type: 'income' as const,
        category: income.source,
        date: income.date,
      }));

      // Convert expenses to transaction format
      const expenseTransactions: Transaction[] = expenseData.map((expense) => ({
        id: expense.id,
        description: expense.description,
        amount: -expense.amount, // Negative for expenses
        type: 'expense' as const,
        category: expense.category,
        date: expense.date,
      }));

      // Combine and sort by date (newest first)
      const allTransactions = [...incomeTransactions, ...expenseTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5); // Get only the 5 most recent

      subscriber.next(allTransactions);
    });
  }
}

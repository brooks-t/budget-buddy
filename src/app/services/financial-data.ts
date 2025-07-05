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
 * - Proper timezone handling for date inputs
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
  // Private BehaviorSubjects to hold our data - NOW STARTING WITH EMPTY ARRAYS
  // BehaviorSubject remembers the last value and emits it to new subscribers
  private incomeSubject = new BehaviorSubject<IncomeEntry[]>([]);
  private expensesSubject = new BehaviorSubject<ExpenseEntry[]>([]);

  // Public observables for components to subscribe to
  // These allow components to react to data changes automatically
  public income$ = this.incomeSubject.asObservable();
  public expenses$ = this.expensesSubject.asObservable();

  constructor() {
    console.log('FinancialData service initialized - starting with empty data');
  }

  // Utility function to handle date conversion from HTML date input
  private createLocalDate(dateString: string): Date {
    // HTML date inputs give us a string in YYYY-MM-DD format
    // When we create a new Date(dateString), it assumes UTC timezone
    // This can cause the date to be off by one day in different timezones

    console.log('Original date string from form:', dateString);

    // Split the date string and create a date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);

    // Month is 0-indexed in JavaScript Date constructor
    const localDate = new Date(year, month - 1, day);

    console.log('Converted to local date:', localDate);
    console.log('Local date string:', localDate.toDateString());

    return localDate;
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

    // Convert the date properly to avoid timezone issues
    const properDate =
      income.date instanceof Date
        ? income.date
        : this.createLocalDate(income.date as string);

    const newIncome: IncomeEntry = {
      ...income,
      id: Date.now(), // Simple ID generation
      date: properDate, // Use our timezone-corrected date
    };

    // Update the BehaviorSubject with new data
    this.incomeSubject.next([...currentIncome, newIncome]);
    console.log('Income added with corrected date:', newIncome);
  }

  addExpense(expense: Omit<ExpenseEntry, 'id'>): void {
    const currentExpenses = this.getCurrentExpenses();

    // Convert the date properly to avoid timezone issues
    const properDate =
      expense.date instanceof Date
        ? expense.date
        : this.createLocalDate(expense.date as string);

    const newExpense: ExpenseEntry = {
      ...expense,
      id: Date.now(),
      date: properDate, // Use our timezone-corrected date
    };

    this.expensesSubject.next([...currentExpenses, newExpense]);
    console.log('Expense added with corrected date:', newExpense);
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
      // Subscribe to BOTH income and expenses observables to get live updates
      let currentIncomeData: IncomeEntry[] = [];
      let currentExpenseData: ExpenseEntry[] = [];

      // Subscribe to income changes
      const incomeSubscription = this.income$.subscribe((incomeData) => {
        currentIncomeData = incomeData;
        console.log('Recent transactions: Income data updated', incomeData);
        updateTransactions();
      });

      // Subscribe to expense changes
      const expenseSubscription = this.expenses$.subscribe((expenseData) => {
        currentExpenseData = expenseData;
        console.log('Recent transactions: Expense data updated', expenseData);
        updateTransactions();
      });

      // Function to combine and emit updated transactions
      function updateTransactions() {
        // Convert income to transaction format
        const incomeTransactions: Transaction[] = currentIncomeData.map(
          (income) => ({
            id: income.id,
            description: income.description,
            amount: income.amount,
            type: 'income' as const,
            category: income.source,
            date: income.date,
          })
        );

        // Convert expenses to transaction format
        const expenseTransactions: Transaction[] = currentExpenseData.map(
          (expense) => ({
            id: expense.id,
            description: expense.description,
            amount: -expense.amount, // Negative for expenses
            type: 'expense' as const,
            category: expense.category,
            date: expense.date,
          })
        );

        // Combine and sort by date (newest first)
        const allTransactions = [...incomeTransactions, ...expenseTransactions]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5); // Get only the 5 most recent

        console.log('Recent transactions updated:', allTransactions);
        subscriber.next(allTransactions);
      }

      // Cleanup function when observable is unsubscribed
      return () => {
        incomeSubscription.unsubscribe();
        expenseSubscription.unsubscribe();
      };
    });
  }
}

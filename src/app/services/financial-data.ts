import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Financial Data Service - Now with Budget Goals support
 */

// Add new interface for budget goals
export interface BudgetGoal {
  id: number;
  category: string;
  monthlyLimit: number;
  createdDate: Date;
  isActive: boolean;
}

// Add interface for budget progress tracking
export interface BudgetProgress {
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  isOverBudget: boolean;
  daysLeftInMonth: number;
}

// Existing interfaces...
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
  providedIn: 'root',
})
export class FinancialData {
  // Existing BehaviorSubjects...
  private incomeSubject = new BehaviorSubject<IncomeEntry[]>([]);
  private expensesSubject = new BehaviorSubject<ExpenseEntry[]>([]); // FIXED: Completely removed the extra '>' character

  // NEW: Add budget goals management
  private budgetGoalsSubject = new BehaviorSubject<BudgetGoal[]>([]);

  // Existing public observables...
  public income$ = this.incomeSubject.asObservable();
  public expenses$ = this.expensesSubject.asObservable();

  // NEW: Public observable for budget goals
  public budgetGoals$ = this.budgetGoalsSubject.asObservable();

  constructor() {
    console.log('FinancialData service initialized with budget goals support');
  }

  // Existing methods... (keep all your current methods)

  // NEW: Budget Goals Methods

  /**
   * Add a new budget goal for a category
   */
  addBudgetGoal(goal: Omit<BudgetGoal, 'id' | 'createdDate'>): void {
    const currentGoals = this.budgetGoalsSubject.getValue();

    // Check if goal already exists for this category
    const existingGoal = currentGoals.find(
      (g) => g.category === goal.category && g.isActive
    );
    if (existingGoal) {
      console.warn(
        `Active budget goal already exists for category: ${goal.category}`
      );
      return;
    }

    const newGoal: BudgetGoal = {
      ...goal,
      id: Date.now(),
      createdDate: new Date(),
    };

    this.budgetGoalsSubject.next([...currentGoals, newGoal]);
    console.log('Budget goal added:', newGoal);
  }

  /**
   * Update an existing budget goal
   */
  updateBudgetGoal(goalId: number, updates: Partial<BudgetGoal>): void {
    const currentGoals = this.budgetGoalsSubject.getValue();
    const updatedGoals = currentGoals.map((goal) =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    );

    this.budgetGoalsSubject.next(updatedGoals);
    console.log('Budget goal updated:', goalId, updates);
  }

  /**
   * Delete a budget goal
   */
  deleteBudgetGoal(goalId: number): void {
    const currentGoals = this.budgetGoalsSubject.getValue();
    const updatedGoals = currentGoals.filter((goal) => goal.id !== goalId);

    this.budgetGoalsSubject.next(updatedGoals);
    console.log('Budget goal deleted:', goalId);
  }

  /**
   * Get current month's budget progress for all categories
   */
  getBudgetProgress(): Observable<BudgetProgress[]> {
    return combineLatest([this.budgetGoals$, this.expenses$]).pipe(
      map(([goals, expenses]) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filter expenses for current month
        const currentMonthExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
          );
        });

        // Calculate days left in current month
        const daysInMonth = new Date(
          currentYear,
          currentMonth + 1,
          0
        ).getDate();
        const daysLeftInMonth = daysInMonth - currentDate.getDate();

        // Create progress for each active goal
        return goals
          .filter((goal) => goal.isActive)
          .map((goal) => {
            // Calculate spending for this category in current month
            const categorySpending = currentMonthExpenses
              .filter((expense) => expense.category === goal.category)
              .reduce((sum, expense) => sum + expense.amount, 0);

            const remainingBudget = goal.monthlyLimit - categorySpending;
            const percentageUsed =
              goal.monthlyLimit > 0
                ? (categorySpending / goal.monthlyLimit) * 100
                : 0;

            return {
              category: goal.category,
              monthlyLimit: goal.monthlyLimit,
              currentSpent: categorySpending,
              remainingBudget,
              percentageUsed: Math.round(percentageUsed),
              isOverBudget: categorySpending > goal.monthlyLimit,
              daysLeftInMonth,
            };
          });
      })
    );
  }

  // Utility function to handle date conversion from HTML date input
  private createLocalDate(dateString: string): Date {
    console.log('Original date string from form:', dateString);

    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    console.log('Converted to local date:', localDate);

    return localDate;
  }

  // Keep all your existing methods here...
  getCurrentIncome(): IncomeEntry[] {
    return this.incomeSubject.getValue();
  }

  getCurrentExpenses(): ExpenseEntry[] {
    return this.expensesSubject.getValue();
  }

  getCurrentBudgetGoals(): BudgetGoal[] {
    return this.budgetGoalsSubject.getValue();
  }

  addIncome(income: Omit<IncomeEntry, 'id'>): void {
    const currentIncome = this.getCurrentIncome();

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

  getRecentTransactions(): Observable<Transaction[]> {
    return new Observable((subscriber) => {
      let currentIncomeData: IncomeEntry[] = [];
      let currentExpenseData: ExpenseEntry[] = [];

      const incomeSubscription = this.income$.subscribe((incomeData) => {
        currentIncomeData = incomeData;
        updateTransactions();
      });

      const expenseSubscription = this.expenses$.subscribe((expenseData) => {
        currentExpenseData = expenseData;
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

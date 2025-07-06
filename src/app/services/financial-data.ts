import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Financial Data Service - Now with Budget Goals support and dummy data for development
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
  // TEMPORARY: Initialize with dummy data for development
  private incomeSubject = new BehaviorSubject<IncomeEntry[]>(
    this.createDummyIncome()
  );
  private expensesSubject = new BehaviorSubject<ExpenseEntry[]>(
    this.createDummyExpenses()
  );
  private budgetGoalsSubject = new BehaviorSubject<BudgetGoal[]>(
    this.createDummyBudgetGoals()
  );

  // Public observables...
  public income$ = this.incomeSubject.asObservable();
  public expenses$ = this.expensesSubject.asObservable();
  public budgetGoals$ = this.budgetGoalsSubject.asObservable();

  constructor() {
    console.log(
      'FinancialData service initialized with DUMMY DATA for development'
    );
    console.log('Income entries:', this.incomeSubject.getValue());
    console.log('Expense entries:', this.expensesSubject.getValue());
    console.log('Budget goals:', this.budgetGoalsSubject.getValue());
  }

  /**
   * TEMPORARY: Create realistic dummy income data
   * This simulates 6 months of income entries for testing charts and features
   */
  private createDummyIncome(): IncomeEntry[] {
    const dummyIncome: IncomeEntry[] = [];
    let id = 1000; // Start with high ID to avoid conflicts

    // Create income for the last 6 months
    for (let monthsBack = 5; monthsBack >= 0; monthsBack--) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthsBack);
      date.setDate(15); // Mid-month for salary

      // Monthly salary
      dummyIncome.push({
        id: id++,
        description: 'Software Developer Salary',
        amount: 5500,
        source: 'Salary',
        frequency: 'monthly',
        date: new Date(date),
      });

      // Occasional freelance work
      if (Math.random() > 0.5) {
        const freelanceDate = new Date(date);
        freelanceDate.setDate(Math.floor(Math.random() * 28) + 1);

        dummyIncome.push({
          id: id++,
          description: 'Web Development Project',
          amount: Math.floor(Math.random() * 1500) + 500, // $500-$2000
          source: 'Freelance Work',
          frequency: 'one-time',
          date: freelanceDate,
        });
      }

      // Investment returns (quarterly)
      if (monthsBack % 3 === 0) {
        const investmentDate = new Date(date);
        investmentDate.setDate(Math.floor(Math.random() * 28) + 1);

        dummyIncome.push({
          id: id++,
          description: 'Dividend Payment',
          amount: Math.floor(Math.random() * 300) + 100, // $100-$400
          source: 'Investment Returns',
          frequency: 'one-time',
          date: investmentDate,
        });
      }
    }

    return dummyIncome;
  }

  /**
   * TEMPORARY: Create realistic dummy expense data
   * This simulates varied spending across categories for testing
   */
  private createDummyExpenses(): ExpenseEntry[] {
    const dummyExpenses: ExpenseEntry[] = [];
    let id = 2000; // Start with high ID to avoid conflicts

    // Define spending patterns for different categories
    const spendingPatterns = {
      'Food & Dining': { min: 15, max: 85, frequency: 0.8 },
      Transportation: { min: 25, max: 150, frequency: 0.6 },
      'Bills & Utilities': { min: 80, max: 200, frequency: 0.9 },
      Groceries: { min: 40, max: 120, frequency: 0.7 },
      Entertainment: { min: 20, max: 80, frequency: 0.5 },
      Shopping: { min: 30, max: 200, frequency: 0.4 },
      Healthcare: { min: 50, max: 300, frequency: 0.2 },
      Education: { min: 100, max: 500, frequency: 0.1 },
    };

    // Create expenses for the last 6 months
    for (let monthsBack = 5; monthsBack >= 0; monthsBack--) {
      const baseDate = new Date();
      baseDate.setMonth(baseDate.getMonth() - monthsBack);

      // Generate expenses for each category
      Object.entries(spendingPatterns).forEach(([category, pattern]) => {
        // Number of transactions per month for this category
        const transactionCount = Math.floor(Math.random() * 8) + 2; // 2-10 transactions

        for (let i = 0; i < transactionCount; i++) {
          // Random chance this category has spending this month
          if (Math.random() < pattern.frequency) {
            const expenseDate = new Date(baseDate);
            expenseDate.setDate(Math.floor(Math.random() * 28) + 1);

            const amount =
              Math.floor(Math.random() * (pattern.max - pattern.min)) +
              pattern.min;

            dummyExpenses.push({
              id: id++,
              description: this.getExpenseDescription(category),
              amount: amount,
              category: category,
              date: expenseDate,
            });
          }
        }
      });
    }

    return dummyExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * TEMPORARY: Generate realistic expense descriptions
   */
  private getExpenseDescription(category: string): string {
    const descriptions: { [key: string]: string[] } = {
      'Food & Dining': [
        'Lunch at Pizza Place',
        'Coffee Shop',
        'Dinner with Friends',
        'Fast Food',
        'Restaurant Bill',
        'Food Delivery',
        'Breakfast Cafe',
        'Snacks',
      ],
      Transportation: [
        'Gas Station',
        'Uber Ride',
        'Public Transit',
        'Parking Fee',
        'Car Maintenance',
        'Bus Pass',
        'Taxi Fare',
        'Train Ticket',
      ],
      'Bills & Utilities': [
        'Electric Bill',
        'Internet Service',
        'Phone Bill',
        'Water Bill',
        'Cable TV',
        'Streaming Service',
        'Insurance Payment',
        'Rent',
      ],
      Groceries: [
        'Weekly Groceries',
        'Supermarket Shopping',
        'Fresh Produce',
        'Household Items',
        'Organic Market',
        'Bulk Shopping',
        'Convenience Store',
      ],
      Entertainment: [
        'Movie Tickets',
        'Concert',
        'Gaming',
        'Books',
        'Streaming Movies',
        'Sports Event',
        'Museum Visit',
        'Live Show',
      ],
      Shopping: [
        'Clothing Store',
        'Online Purchase',
        'Electronics',
        'Home Decor',
        'Shoes',
        'Gadgets',
        'Accessories',
        'Department Store',
      ],
      Healthcare: [
        'Doctor Visit',
        'Pharmacy',
        'Dental Checkup',
        'Prescription',
        'Health Insurance',
        'Vitamins',
        'Medical Tests',
        'Eye Exam',
      ],
      Education: [
        'Online Course',
        'Books',
        'Workshop',
        'Certification',
        'Training Program',
        'Educational Software',
        'Seminar',
        'Tuition',
      ],
    };

    const categoryDescriptions = descriptions[category] || ['Expense'];
    return categoryDescriptions[
      Math.floor(Math.random() * categoryDescriptions.length)
    ];
  }

  /**
   * TEMPORARY: Create dummy budget goals
   */
  private createDummyBudgetGoals(): BudgetGoal[] {
    return [
      {
        id: 3001,
        category: 'Food & Dining',
        monthlyLimit: 600,
        createdDate: new Date(2024, 0, 15), // January 15th
        isActive: true,
      },
      {
        id: 3002,
        category: 'Transportation',
        monthlyLimit: 400,
        createdDate: new Date(2024, 1, 1), // February 1st
        isActive: true,
      },
      {
        id: 3003,
        category: 'Entertainment',
        monthlyLimit: 200,
        createdDate: new Date(2024, 1, 10), // February 10th
        isActive: true,
      },
      {
        id: 3004,
        category: 'Shopping',
        monthlyLimit: 300,
        createdDate: new Date(2024, 2, 5), // March 5th
        isActive: true,
      },
      {
        id: 3005,
        category: 'Groceries',
        monthlyLimit: 500,
        createdDate: new Date(2024, 2, 20), // March 20th
        isActive: true,
      },
    ];
  }

  // Budget Goals Methods

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

  // Data access methods
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

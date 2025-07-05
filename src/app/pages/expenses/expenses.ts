import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FinancialData, ExpenseEntry } from '../../services/financial-data';

/**
 * Expenses Component - Now connected to the shared financial data service
 *
 * This component demonstrates:
 * - Using the same service as Dashboard and Income for data consistency
 * - Real-time updates that affect other components
 * - Proper subscription management
 * - Service-based CRUD operations
 */
@Component({
  selector: 'app-expenses',
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, pipes
    FormsModule, // Enables ngModel for form binding
  ],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses implements OnInit, OnDestroy {
  // Form data for adding new expenses
  newExpense = {
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  };

  // Predefined expense categories for easy selection
  expenseCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Groceries',
    'Other',
  ];

  // Data from the service - these will be populated by subscriptions
  expenses: ExpenseEntry[] = [];

  // Filter properties
  selectedCategory = 'All';
  searchTerm = '';

  // Subscription management
  private subscriptions: Subscription[] = [];

  // Computed property - calculates total expenses from service data
  get totalExpenses(): number {
    return this.filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  }

  // Computed property - returns filtered expenses based on category and search
  get filteredExpenses() {
    let filtered = this.expenses;

    // Filter by category
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      filtered = filtered.filter(
        (expense) => expense.category === this.selectedCategory
      );
    }

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          expense.category.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Constructor - Inject the shared financial data service
   */
  constructor(private financialDataService: FinancialData) {
    console.log('Expenses component initialized with financial service');
  }

  /**
   * OnInit - Set up subscription to expense data from the service
   */
  ngOnInit(): void {
    // Subscribe to expense data changes from the service
    const expensesSubscription = this.financialDataService.expenses$.subscribe({
      next: (expenseData) => {
        this.expenses = expenseData;
        console.log('Expenses component: Data updated from service', expenseData);
      },
      error: (error) => {
        console.error('Error getting expense data:', error);
      },
    });

    this.subscriptions.push(expensesSubscription);
  }

  /**
   * OnDestroy - Clean up subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('Expenses component subscriptions cleaned up');
  }

  // Method to add a new expense using the service
  addExpense(): void {
    // Basic form validation
    if (!this.newExpense.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (this.newExpense.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!this.newExpense.category) {
      alert('Please select a category');
      return;
    }

    // Use the service to add expense - this will automatically update Dashboard too!
    this.financialDataService.addExpense({
      description: this.newExpense.description.trim(),
      amount: this.newExpense.amount,
      category: this.newExpense.category,
      date: new Date(this.newExpense.date),
    });

    // Reset the form
    this.resetForm();

    console.log('Expense added through service - Dashboard will update automatically!');
  }

  // Method to delete an expense using the service
  deleteExpense(id: number): void {
    // Use the service to delete expense - this will automatically update Dashboard too!
    this.financialDataService.deleteExpense(id);
    console.log('Expense deleted through service - Dashboard will update automatically!');
  }

  // Method to reset the form
  resetForm(): void {
    this.newExpense = {
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
    };
  }

  // Method to get category color for visual distinction
  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Food & Dining': '#f56565',
      Transportation: '#4299e1',
      Shopping: '#9f7aea',
      Entertainment: '#ed8936',
      'Bills & Utilities': '#38b2ac',
      Healthcare: '#fc8181',
      Travel: '#4fd1c7',
      Education: '#63b3ed',
      Groceries: '#68d391',
      Other: '#a0aec0',
    };
    return colors[category] || '#a0aec0';
  }
}

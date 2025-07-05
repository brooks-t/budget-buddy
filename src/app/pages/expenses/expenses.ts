import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
 * - Better UX with proper form reset and success feedback
 * - Date validation to prevent future dates
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
  // ViewChild to access the form directly for proper reset
  @ViewChild('expenseForm') expenseForm!: NgForm;

  // UPDATED: Add maxDate property to restrict future dates
  maxDate: string = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

  // UPDATED: Form data for adding new expenses - now uses maxDate for default
  newExpense = {
    description: '',
    amount: 0,
    category: '',
    date: this.maxDate, // UPDATED: Default to today
  };

  // Success state for showing feedback to user
  showSuccessMessage = false;
  successMessage = '';

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
        console.log(
          'Expenses component: Data updated from service',
          expenseData
        );
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
      this.showErrorMessage('Please enter a description');
      return;
    }

    if (this.newExpense.amount <= 0) {
      this.showErrorMessage('Please enter a valid amount');
      return;
    }

    if (!this.newExpense.category) {
      this.showErrorMessage('Please select a category');
      return;
    }

    // UPDATED: Add custom date validation to prevent future dates
    if (!this.isValidDate(this.newExpense.date)) {
      this.showErrorMessage(
        'Please select a valid date that is not in the future'
      );
      return;
    }

    // Use the service to add expense - Pass the date STRING, not a Date object
    // Let the service handle the timezone conversion
    this.financialDataService.addExpense({
      description: this.newExpense.description.trim(),
      amount: this.newExpense.amount,
      category: this.newExpense.category,
      date: this.newExpense.date as any, // Pass the string directly, service will convert it
    });

    // Show success message
    this.showSuccessIndicator();

    // Reset the form properly
    this.resetForm();

    console.log(
      'Expense added through service - Dashboard will update automatically!'
    );
  }

  // Method to delete an expense using the service
  deleteExpense(id: number): void {
    // Use the service to delete expense - this will automatically update Dashboard too!
    this.financialDataService.deleteExpense(id);
    console.log(
      'Expense deleted through service - Dashboard will update automatically!'
    );
  }

  // UPDATED: Method to properly reset the form without validation errors
  resetForm(): void {
    // Reset the data
    this.newExpense = {
      description: '',
      amount: 0,
      category: '',
      date: this.maxDate, // UPDATED: Always reset to today's date
    };

    // Reset the form state to remove validation errors
    // We need to wait for the next tick to ensure the form is updated
    setTimeout(() => {
      if (this.expenseForm) {
        this.expenseForm.resetForm(this.newExpense);
      }
    }, 0);
  }

  // Method to show success indicator
  private showSuccessIndicator(): void {
    this.successMessage = `✅ Expense added successfully! Your dashboard has been updated.`;
    this.showSuccessMessage = true;

    // Hide the success message after 3 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  // Method to show error messages (replaces alert for better UX)
  private showErrorMessage(message: string): void {
    // You could enhance this with a proper toast notification system
    alert(message); // For now, keeping the alert but we could improve this
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

  // UPDATED: Fix the isValidDate method to avoid timezone issues
  private isValidDate(dateString: string): boolean {
    // Check if date string is provided
    if (!dateString) {
      return false;
    }

    // Use the same approach as our service to avoid timezone issues
    // Split the date string and create a date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);

    // Check for valid date parts
    if (!year || !month || !day) {
      return false;
    }

    // Create the selected date in local timezone (month is 0-indexed)
    const selectedDate = new Date(year, month - 1, day);

    // Create today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison

    // Check if the selected date is valid and not in the future
    const isValidDateObject = !isNaN(selectedDate.getTime());
    const isNotFuture = selectedDate <= today;

    console.log('Date validation (timezone-safe):', {
      dateString,
      dateParts: { year, month, day },
      selectedDate,
      today,
      isValidDateObject,
      isNotFuture,
      result: isValidDateObject && isNotFuture,
    });

    return isValidDateObject && isNotFuture;
  }
}

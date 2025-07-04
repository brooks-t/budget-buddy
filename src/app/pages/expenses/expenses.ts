import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Expenses Component - Track and categorize spending
 *
 * This component demonstrates:
 * - Template-driven forms with ngModel
 * - Form validation
 * - Adding/removing items from arrays
 * - Local data management
 * - Filtering and sorting data
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
export class Expenses {
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

  // Array to store all expenses
  expenses: Array<{
    id: number;
    description: string;
    amount: number;
    category: string;
    date: Date;
  }> = [
    // Sample expenses to show functionality
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
    {
      id: 3,
      description: 'Coffee Shop',
      amount: 4.75,
      category: 'Food & Dining',
      date: new Date('2024-01-12'),
    },
    {
      id: 4,
      description: 'Gas Station',
      amount: 45.0,
      category: 'Transportation',
      date: new Date('2024-01-11'),
    },
  ];

  // Filter properties
  selectedCategory = 'All';
  searchTerm = '';

  // Computed property - calculates total expenses
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

  // Method to add a new expense
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

    // Create new expense object
    const expense = {
      id: Date.now(), // Simple ID generation using timestamp
      description: this.newExpense.description.trim(),
      amount: this.newExpense.amount,
      category: this.newExpense.category,
      date: new Date(this.newExpense.date),
    };

    // Add to expenses array
    this.expenses.push(expense);

    // Reset the form
    this.resetForm();

    console.log('Expense added:', expense);
  }

  // Method to delete an expense
  deleteExpense(id: number): void {
    const index = this.expenses.findIndex((expense) => expense.id === id);
    if (index > -1) {
      this.expenses.splice(index, 1);
      console.log('Expense deleted with ID:', id);
    }
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Income Component - Track and manage income sources
 *
 * This component demonstrates:
 * - Similar form patterns to Expenses (reinforcing learning)
 * - Different data management approach for income vs expenses
 * - Recurring income concepts (salary, freelance, etc.)
 * - Income categorization and tracking
 */
@Component({
  selector: 'app-income',
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, pipes
    FormsModule, // Enables ngModel for form binding
  ],
  templateUrl: './income.html',
  styleUrl: './income.scss',
})
export class Income {
  // Form data for adding new income
  newIncome = {
    description: '',
    amount: 0,
    source: '',
    frequency: 'one-time', // one-time, monthly, weekly, yearly
    date: new Date().toISOString().split('T')[0],
  };

  // Income sources/categories for easy selection
  incomeSources = [
    'Salary',
    'Freelance Work',
    'Business Income',
    'Investment Returns',
    'Rental Income',
    'Side Hustle',
    'Bonus',
    'Gift/Prize',
    'Other',
  ];

  // Frequency options for recurring income
  frequencyOptions = [
    { value: 'one-time', label: 'One-time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Array to store all income entries
  incomeEntries: Array<{
    id: number;
    description: string;
    amount: number;
    source: string;
    frequency: string;
    date: Date;
  }> = [
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
    {
      id: 3,
      description: 'Stock Dividends',
      amount: 125.0,
      source: 'Investment Returns',
      frequency: 'monthly',
      date: new Date('2024-01-10'),
    },
  ];

  // Filter properties
  selectedSource = 'All';
  selectedFrequency = 'All';
  searchTerm = '';

  // Computed property - calculates total income
  get totalIncome(): number {
    return this.filteredIncome.reduce((sum, income) => sum + income.amount, 0);
  }

  // Computed property - returns filtered income based on filters
  get filteredIncome() {
    let filtered = this.incomeEntries;

    // Filter by source
    if (this.selectedSource && this.selectedSource !== 'All') {
      filtered = filtered.filter(
        (income) => income.source === this.selectedSource
      );
    }

    // Filter by frequency
    if (this.selectedFrequency && this.selectedFrequency !== 'All') {
      filtered = filtered.filter(
        (income) => income.frequency === this.selectedFrequency
      );
    }

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(
        (income) =>
          income.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          income.source.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Method to add a new income entry
  addIncome(): void {
    // Basic form validation
    if (!this.newIncome.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (this.newIncome.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!this.newIncome.source) {
      alert('Please select an income source');
      return;
    }

    // Create new income object
    const income = {
      id: Date.now(), // Simple ID generation using timestamp
      description: this.newIncome.description.trim(),
      amount: this.newIncome.amount,
      source: this.newIncome.source,
      frequency: this.newIncome.frequency,
      date: new Date(this.newIncome.date),
    };

    // Add to income array
    this.incomeEntries.push(income);

    // Reset the form
    this.resetForm();

    console.log('Income added:', income);
  }

  // Method to delete an income entry
  deleteIncome(id: number): void {
    const index = this.incomeEntries.findIndex((income) => income.id === id);
    if (index > -1) {
      this.incomeEntries.splice(index, 1);
      console.log('Income deleted with ID:', id);
    }
  }

  // Method to reset the form
  resetForm(): void {
    this.newIncome = {
      description: '',
      amount: 0,
      source: '',
      frequency: 'one-time',
      date: new Date().toISOString().split('T')[0],
    };
  }

  // Method to get source color for visual distinction
  getSourceColor(source: string): string {
    const colors: { [key: string]: string } = {
      Salary: '#48bb78',
      'Freelance Work': '#4299e1',
      'Business Income': '#9f7aea',
      'Investment Returns': '#ed8936',
      'Rental Income': '#38b2ac',
      'Side Hustle': '#fc8181',
      Bonus: '#4fd1c7',
      'Gift/Prize': '#63b3ed',
      Other: '#a0aec0',
    };
    return colors[source] || '#a0aec0';
  }

  // Method to get frequency display text
  getFrequencyDisplay(frequency: string): string {
    const displays: { [key: string]: string } = {
      'one-time': 'One-time',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return displays[frequency] || frequency;
  }
}
